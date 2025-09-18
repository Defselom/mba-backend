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
  UseGuards,
  Get,
  Param,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

import type { Response, Request } from 'express';

import { UAParser } from 'ua-parser-js';

import { AuthService } from '@/auth/auth.service';
import { loginExample, refreshTokenExample, RegisterExample } from '@/auth/doc';
import * as dto_1 from '@/auth/dto';
import { JwtGuard } from '@/auth/guard';
import { MetaData } from '@/auth/interface';
import { clearAuthCookies, setAuthCookies } from '@/auth/utils';
import { GetUser } from '@/decorator';
import { ResponseUtil } from '@/shared/utils';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully',
    example: loginExample,
  })
  async login(
    @Body() dto: dto_1.LoginDto,
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

    const result = await this.authService.login(dto, meta);
    const { access_token, refresh_token } = result.data;

    const isProduction = this.config.get<string>('NODE_ENV') === 'production';

    setAuthCookies(res, { access_token, refresh_token }, isProduction);

    return {
      ...result,
      data: {
        ...result.data,
        refresh_token: undefined,
      },
    };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add a new user',
    description: 'This endpoint allows you to register a new user.',
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    example: RegisterExample,
  })
  register(@Body() dto: dto_1.RegisterDto) {
    console.log(dto);

    return this.authService.register(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'User logout',
    description: 'Logs out the user and invalidates the refresh token.',
  })
  @ApiResponse({ status: 200, description: 'User logged out successfully' })
  logout(@Res({ passthrough: true }) res: Response, @Req() request: Request) {
    const cookies = request.cookies as Record<string, string | undefined>;

    const refreshToken = cookies?.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found please check your cookie');
    }

    console.log('refresh token:', refreshToken);

    clearAuthCookies(res);

    return this.authService.logout(refreshToken);
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'This endpoint allows you to refresh your access token using a valid refresh token. The refresh token can be provided in the request body or as an HTTP-only cookie.',
  })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    example: refreshTokenExample,
  })
  async refreshToken(
    @Body() dto: dto_1.RefreshUserTokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = (dto.refreshToken || req.cookies?.refresh_token) as string | undefined;

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
        access_token: result.data.access_token,
        refresh_token: result.data.refresh_token,
      },
      isProduction,
    );

    // Return only the access token, exclude refresh token from response
    return {
      ...result,
      data: {
        ...result.data,
        refresh_token: undefined,
      },
    };
  }

  // request password reset: generate a token, email and always respond 202
  @Post('forgot-password')
  @HttpCode(202)
  @ApiOperation({
    summary: 'Request password reset',
    description:
      'Initiates the password reset process by generating a reset token and sending it via email. Always responds with 202 to prevent email enumeration.',
  })
  @ApiResponse({
    status: 202,
    description:
      'If the email exists, a password reset link has been sent. Please check your email.',
  })
  async forgotPassword(@Body() dto: dto_1.ForgotPasswordDto): Promise<void> {
    await this.authService.requestPasswordReset(dto.email);
  }

  // valid reset token
  @Get('password/reset/:token/validate')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Validate password reset token',
    description: 'Checks if the provided password reset token is valid and not expired.',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset token is valid',
  })
  @ApiResponse({
    status: 400,
    description: 'Password reset token is invalid, expired, or already used',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid or expired password reset token',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Password reset token not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Password reset token not found',
        error: 'Not Found',
      },
    },
  })
  async validateResetToken(@Param('token') token: string): Promise<void> {
    await this.authService.validateResetToken(token);
  }

  // reset password using the token
  @Post('password/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset password',
    description:
      'Resets the user password using a valid reset token and the new password provided.',
  })
  @ApiResponse({
    status: 200,
    description: 'Password has been reset successfully',
    schema: {
      example: {
        statusCode: 200,
        message: 'Password has been reset successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Password reset token is invalid, expired, or already used',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid or expired password reset token',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Password reset token not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Password reset token not found',
        error: 'Not Found',
      },
    },
  })
  async resetPassword(@Body() dto: dto_1.ResetPasswordDto) {
    await this.authService.resetPassword(dto.token, dto.newPassword);

    return ResponseUtil.success(
      undefined,
      'Password has been reset successfully',
      undefined,
      HttpStatus.OK,
    );
  }

  // change password while logged in
  @Post('password/change')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Change password',
    description: 'Allows an authenticated user to change their password.',
  })
  @ApiResponse({
    status: 200,
    description: 'Password has been changed successfully',
    schema: {
      example: {
        statusCode: 200,
        message: 'Password has been changed successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Old password is incorrect or new password is invalid',
    schema: {
      example: {
        statusCode: 400,
        message: 'Old password is incorrect',
        error: 'Bad Request',
      },
    },
  })
  async changePassword(
    @Body() dto: { oldPassword: string; newPassword: string },
    @GetUser() user: dto_1.LoggedInUser,
  ) {
    await this.authService.changePassword(user.id, dto.oldPassword, dto.newPassword);

    return ResponseUtil.success(
      undefined,
      'Password has been changed successfully',
      undefined,
      HttpStatus.OK,
    );
  }
}
