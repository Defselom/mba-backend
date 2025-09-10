import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';

import { JwtPayload, LoggedInUser } from '@/auth/dto';
import { PrismaService } from '@/prisma/prisma.service';
import { UserStatus } from 'generated/prisma';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') || 'fallback-secret',
    });
  }

  async validate(payload: JwtPayload): Promise<LoggedInUser> {
    const user = await this.prisma.userAccount.findUnique({
      where: { id: payload.sub },
      omit: { password: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    console.log(user);

    // check is user is active
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('User is not active');
    }

    const safeUser: LoggedInUser = {
      ...user,
      iat: payload?.iat,
      exp: payload?.exp,
    };

    return safeUser;
  }
}
