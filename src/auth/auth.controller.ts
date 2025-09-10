import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  Headers,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import type { Response, Request } from 'express';

import { UAParser } from 'ua-parser-js';

import { AuthService } from '@/auth/auth.service';
import { LoginDto, RegisterDto } from '@/auth/dto';
import { MetaData } from '@/auth/interface';
import { clearAuthCookies, setAuthCookies } from '@/auth/utils';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const meta: MetaData = {
      ipAddress:
        (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
        req.socket.remoteAddress ||
        'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      deviceType: new UAParser(req.headers['user-agent']).getDevice().type || 'desktop',
    };

    const { user, access_token, refresh_token } = await this.authService.login(dto, meta);

    const isProduction = this.config.get<string>('NODE_ENV') === 'production';

    setAuthCookies(res, { access_token, refresh_token }, isProduction);

    return { user, access_token };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterDto) {
    console.log(dto);

    return this.authService.register(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    clearAuthCookies(res);

    return this.authService.logout();
  }

  @Post('refresh')
  @HttpCode(200)
  async refreshToken(
    @Body('refresh_token') refresh_token: string | undefined,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = (refresh_token || req.cookies?.refresh_token) as string | undefined;

    console.log('Refresh Token from body or cookie:', refreshToken);

    clearAuthCookies(res);

    if (!refreshToken && typeof refreshToken !== 'string') {
      throw new UnauthorizedException('Refresh token not found');
    }

    const meta: MetaData = {
      ipAddress:
        (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
        req.socket.remoteAddress ||
        'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      deviceType: new UAParser(req.headers['user-agent']).getDevice().type || 'desktop',
    };

    const result = await this.authService.refreshTokens(refreshToken, meta);

    // Pass only the tokens and a boolean for production mode
    const isProduction = this.config.get('NODE_ENV') === 'production';

    setAuthCookies(
      res,
      {
        access_token: result.access_token,
        refresh_token: result.refresh_token,
      },
      isProduction,
    );

    return { user: result.user, access_token: result.access_token };
  }
}
