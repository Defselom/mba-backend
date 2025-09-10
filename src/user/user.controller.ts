import { Controller, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';

import * as dto from '@/auth/dto';
import { JwtGuard } from '@/auth/guard';
import { GetUser } from '@/decorator/get-user.decorator';

@Controller('users')
export class UserController {
  @UseGuards(JwtGuard)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  getMe(@GetUser('') user: dto.LoggedInUser) {
    return { user: user };
  }
}
