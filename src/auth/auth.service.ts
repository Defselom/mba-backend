import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { JsonWebTokenError, JwtService, NotBeforeError, TokenExpiredError } from '@nestjs/jwt';

import { TokenExpiration } from '@/auth/constants';
import { JwtPayload, LoginDto } from '@/auth/dto';
import { RegisterDto } from '@/auth/dto/register.dto';
import { hashPassword, verifyPassword } from '@/auth/utils/handlePassword';
import { PrismaService } from '@/prisma/prisma.service';

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
    // check if user exists
    const userExists = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { username: dto.username }],
      },
    });

    if (userExists) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await hashPassword(dto.password);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        birthDay: dto.birthDay,
        phoneNumber: dto.phoneNumber,
        profilImage: dto.profilImage,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;

    return result;
  }

  async login(dto: LoginDto) {
    // check if user exists
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { username: dto.username }],
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // check password
    const isPasswordValid = await verifyPassword(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials provided');
    }

    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };

    const { access_token, refresh_token } = await this.generateTokens(payload);

    return {
      user: payload,
      access_token,
      refresh_token,
    };
  }

  logout() {
    // Implement your logout logic here
    return { message: 'Logout successful' };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload: JwtPayload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET', 'fallback-secret-refresh'),
      });

      //console.log(payload);

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const newPayload = {
        sub: user.id,
        username: user.username,
        email: user.email,
      };

      const { access_token, refresh_token } = await this.generateTokens(newPayload);

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
}
