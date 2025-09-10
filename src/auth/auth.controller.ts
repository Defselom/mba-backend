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

import { AuthService } from '@/auth/auth.service';
import { LoginDto, RegisterDto } from '@/auth/dto';
import { clearAuthCookies, setAuthCookies } from '@/auth/utils';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { user, access_token, refresh_token } = await this.authService.login(dto);

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
    @Headers('authorization') authorization: string | undefined,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = (req.cookies?.refresh_token || authorization?.replace('Bearer ', '')) as
      | string
      | undefined;

    clearAuthCookies(res);

    if (!refreshToken || typeof refreshToken !== 'string') {
      throw new UnauthorizedException('Refresh token not found');
    }

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const result = await this.authService.refreshTokens(refreshToken);

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
