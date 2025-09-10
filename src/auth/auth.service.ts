import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { JsonWebTokenError, JwtService, NotBeforeError, TokenExpiredError } from '@nestjs/jwt';

import { TokenExpiration } from '@/auth/constants';
import { JwtPayload, LoginDto } from '@/auth/dto';
import { RegisterDto } from '@/auth/dto/register.dto';
import { MetaData, authResponse } from '@/auth/interface';
import { hashPassword, verifyPassword } from '@/auth/utils/handlePassword';
import { PrismaService } from '@/prisma/prisma.service';
import { ApiResponse } from '@/shared/interfaces';
import { ResponseUtil } from '@/shared/utils';
import { UserRole } from 'generated/prisma';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  private async generateTokens(
    payload: JwtPayload,
  ): Promise<{ access_token: string; refresh_token: string }> {
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

  async register(dto: RegisterDto) {
    // 1. Check if user exists
    const userExists = await this.prisma.userAccount.findFirst({
      where: {
        OR: [{ email: dto.email }, { username: dto.username }],
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
        status: 'ACTIVE', // ou 'PENDING_VALIDATION'
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

      default:
        break;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;

    return ResponseUtil.success(
      result,
      'User registered successfully',
      undefined,
      HttpStatus.CREATED,
    );
  }

  async login(dto: LoginDto, meta: MetaData): Promise<ApiResponse<authResponse>> {
    // check if user exists
    const user = await this.prisma.userAccount.findFirst({
      where: {
        OR: [{ email: dto.email }, { username: dto.username }],
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
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

    return ResponseUtil.success(
      {
        user: payload,
        access_token,
        refresh_token,
      },
      'Login successful',
      undefined,
      HttpStatus.OK,
    );
  }

  logout() {
    // Implement your logout logic here
    return ResponseUtil.success(null, 'Logged out successfully');
  }

  async refreshTokens(refreshToken: string, meta: MetaData): Promise<ApiResponse<authResponse>> {
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
        throw new UnauthorizedException('Refresh token is no longer active. Please log in again.');
      }

      const payload: JwtPayload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET', 'fallback-secret-refresh'),
      });

      //console.log(payload);

      const user = await this.prisma.userAccount.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
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

      return ResponseUtil.success(
        {
          user: newPayload,
          access_token,
          refresh_token,
        },
        'Token refreshed successfully',
        undefined,
        HttpStatus.OK,
      );
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
}
