import { Controller, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';

import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import * as dto from '@/auth/dto';
import { JwtGuard } from '@/auth/guard';
import { GetUser } from '@/decorator/get-user.decorator';
import { UserService } from '@/user/user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  @UseGuards(JwtGuard)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current user information' })
  @ApiResponse({ status: 200, description: 'Connected user' })
  getMe(@GetUser('') user: dto.LoggedInUser): { user: dto.LoggedInUser } {
    return { user: user };
  }
}
