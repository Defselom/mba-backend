import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { JsonWebTokenError, JwtService, NotBeforeError, TokenExpiredError } from '@nestjs/jwt';

import { UserRole, UserStatus } from '@/../generated/prisma';
import { PasswordResetTokenExpiration, TokenExpiration } from '@/auth/constants';
import { JwtPayload, LoginDto } from '@/auth/dto';
import { RegisterDto } from '@/auth/dto/register.dto';
import { MetaData } from '@/auth/interface';
import { generateResetToken, hashResetToken } from '@/auth/utils';
import { hashPassword, verifyPassword } from '@/auth/utils/handlePassword';
import { EmailService } from '@/email/email.service';
import { PrismaService } from '@/prisma/prisma.service';

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface LoginResult {
  user: JwtPayload;
  access_token: string;
  refresh_token: string;
}

export interface UserData {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  status: UserStatus;
  firstName?: string;
  lastName?: string;
  birthDate?: Date;
  phone?: string;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
    private mailService: EmailService,
  ) {}

  private async generateTokens(payload: JwtPayload): Promise<AuthTokens> {
    const access_token = await this.jwtService.signAsync(payload, {
      secret: this.config.get<string>('JWT_SECRET', 'fallback-secret'),
      expiresIn: TokenExpiration.ACCESS_TOKEN,
    });

    const refresh_token = await this.jwtService.signAsync(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET', 'fallback-secret-refresh'),
      expiresIn: TokenExpiration.REFRESH_TOKEN,
    });

    return {
      access_token,
      refresh_token,
    };
  }

  async register(dto: RegisterDto): Promise<UserData> {
    // 1. Check if user exists
    const userExists = await this.prisma.userAccount.findFirst({
      where: {
        OR: [{ email: dto.email }, { username: dto.username }],
        isDeleted: false,
      },
    });

    if (userExists) {
      throw new ConflictException('User already exists');
    }

    // 2. Hash password
    const hashedPassword = dto.password ? await hashPassword(dto.password) : undefined;

    // 3. Create UserAccount
    const user = await this.prisma.userAccount.create({
      data: {
        email: dto.email,
        username: dto.username,
        password: hashedPassword,
        role: dto.role,
        status: UserStatus.PENDING_VALIDATION,
        firstName: dto.firstName,
        lastName: dto.lastName,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        phone: dto.phone,
        profileImage: dto.profileImage,
      },
    });

    // 4. Create role-specific profile
    switch (dto.role) {
      case UserRole.PARTICIPANT:
        if (!dto.participantProfile)
          throw new BadRequestException('Participant profile is required');
        await this.prisma.participantProfile.create({
          data: {
            userId: user.id,
            ...dto.participantProfile,
          },
        });
        break;
      case UserRole.SPEAKER:
        if (!dto.speakerProfile) throw new BadRequestException('Speaker profile is required');
        await this.prisma.speakerProfile.create({
          data: {
            userId: user.id,
            ...dto.speakerProfile,
          },
        });
        break;
      case UserRole.MODERATOR:
        if (!dto.moderatorProfile) throw new BadRequestException('Moderator profile is required');
        await this.prisma.moderatorProfile.create({
          data: {
            userId: user.id,
            ...dto.moderatorProfile,
          },
        });
        break;
      case UserRole.ADMIN:
        await this.prisma.adminProfile.create({
          data: {
            userId: user.id,
          },
        });
        break;

      default:
        break;
    }

    // Return user data without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userData } = user;

    // Convert null values to undefined to match UserData interface
    const result: UserData = {
      ...userData,
      lastName: userData.lastName ?? undefined,
      birthDate: userData.birthDate ?? undefined,
      phone: userData.phone ?? undefined,
      profileImage: userData.profileImage ?? undefined,
    };

    return result;
  }

  async login(dto: LoginDto, meta: MetaData): Promise<LoginResult> {
    // check if user exists
    const user = await this.prisma.userAccount.findFirst({
      where: {
        OR: [{ email: dto.email }, { username: dto.username }],
        isDeleted: false,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Vérifier que l'utilisateur n'est pas supprimé (soft delete)
    if (user.isDeleted) {
      throw new UnauthorizedException('Account is no longer available');
    }

    // check password
    const isPasswordValid = await verifyPassword(dto.password, user.password ?? '#$@!invalid');

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials provided');
    }

    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const { access_token, refresh_token } = await this.generateTokens(payload);

    await this.prisma.session.create({
      data: {
        ...meta,
        token: refresh_token,
        userId: user.id,
        expiresAt: new Date(Date.now() + TokenExpiration.REFRESH_TOKEN),
      },
    });

    return {
      user: payload,
      access_token,
      refresh_token,
    };
  }

  async logout(refreshToken?: string): Promise<void> {
    const currentSession = await this.prisma.session.findUnique({ where: { token: refreshToken } });

    if (currentSession) {
      await this.prisma.session.update({
        where: { id: currentSession.id },
        data: {
          isActive: false,
          revokedAt: new Date(),
        },
      });
    }
  }

  async refreshTokens(refreshToken: string, meta: MetaData): Promise<LoginResult> {
    try {
      const existingSession = await this.prisma.session.findUnique({
        where: { token: refreshToken },
      });

      if (!existingSession) {
        throw new UnauthorizedException('Refresh token not recognized. Please log in again.');
      }

      if (existingSession.expiresAt < new Date()) {
        await this.prisma.session.delete({
          where: { id: existingSession.id },
        });
        throw new UnauthorizedException('Refresh token has expired. Please log in again.');
      }

      if (!existingSession.isActive) {
        throw new UnauthorizedException('Your session is no longer active. Please log in again.');
      }

      const payload: JwtPayload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET', 'fallback-secret-refresh'),
      });

      const user = await this.prisma.userAccount.findUnique({
        where: { id: payload.sub, isDeleted: false },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Vérifier que l'utilisateur n'est pas supprimé (soft delete)
      if (user.isDeleted) {
        throw new UnauthorizedException('Account is no longer available');
      }

      const newPayload = {
        sub: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      };

      const { access_token, refresh_token } = await this.generateTokens(newPayload);

      await Promise.all([
        this.prisma.session.delete({
          where: { id: existingSession.id },
        }),
        this.prisma.session.create({
          data: {
            ipAddress: meta?.ipAddress || null,
            userAgent: meta?.userAgent || null,
            deviceType: meta?.deviceType || null,
            token: refresh_token,
            userId: user.id,
            expiresAt: new Date(Date.now() + TokenExpiration.REFRESH_TOKEN),
          },
        }),
      ]);

      return {
        user: newPayload,
        access_token,
        refresh_token,
      };
    } catch (error: unknown) {
      // Gestion spécifique pour les tokens expirés
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('Refresh token has expired. Please log in again.');
      } else if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Invalid refresh token format');
      } else if (error instanceof NotBeforeError) {
        throw new UnauthorizedException('Refresh token not active yet');
      }

      // Log pour debugging
      if (process.env.NODE_ENV === 'development') {
        console.error('Refresh token error:', error);
      }

      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // request password reset: generate a token, email and always respond 202
  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.prisma.userAccount.findUnique({
      where: { email, isDeleted: false },
    });

    if (user) {
      // Generate token and its hash
      const { tokenPlain, tokenHash } = generateResetToken();

      // Save hashed token to DB with expiration (1 hour)
      await this.prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token: tokenHash,
          expiresAt: new Date(Date.now() + PasswordResetTokenExpiration.RESET_DURATION), // 30 minutes
        },
      });

      // Send email with plain token
      try {
        await this.mailService.sendPasswordResetEmail(user.email, tokenPlain);
      } catch (error) {
        console.error('Error sending password reset email:', error);

        // Optionally, you might want to clear the token if email fails
      }
    }

    // Always respond with void to prevent email enumeration
  }

  // valid reset token
  async validateResetToken(token: string): Promise<void> {
    const tokenHash = hashResetToken(token);

    const resetToken = await this.prisma.passwordResetToken.findFirst({
      where: { token: tokenHash },
    });

    if (!resetToken) {
      throw new NotFoundException('Password reset token not valid');
    }

    if (resetToken.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    if (resetToken.used)
      throw new BadRequestException('This password reset token has already been used');
  }

  // change password using reset token
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = hashResetToken(token);

    const resetToken = await this.prisma.passwordResetToken.findFirst({
      where: { token: tokenHash },
    });

    if (!resetToken) {
      throw new NotFoundException('Password reset token not valid');
    }

    if (resetToken.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    if (resetToken.used)
      throw new BadRequestException('This password reset token has already been used');

    const user = await this.prisma.userAccount.findUnique({
      where: { id: resetToken.userId, isDeleted: false },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hashedPassword = await hashPassword(newPassword);

    await Promise.all([
      this.prisma.userAccount.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
    ]);

    // Notify user of password change
    await this.mailService.sendPasswordChangedEmail({
      to: user.email,
      userName: user.firstName || user.username,
      changeDate: new Date(),
    });
  }

  // change password when logged in
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.prisma.userAccount.findUnique({
      where: { id: userId, isDeleted: false },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.password) {
      throw new BadRequestException('User does not have a password set');
    }

    if (oldPassword === newPassword) {
      throw new BadRequestException('New password must be different from old password');
    }

    const isOldPasswordValid = await verifyPassword(oldPassword, user.password);

    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Old password is incorrect');
    }

    const hashedNewPassword = await hashPassword(newPassword);

    await this.prisma.userAccount.update({
      where: { id: user.id },
      data: { password: hashedNewPassword },
    });

    // Notify user of password change
    await this.mailService.sendPasswordChangedEmail({
      to: user.email,
      userName: user.firstName || user.username,
      changeDate: new Date(),
    });
  }
}
