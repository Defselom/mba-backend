import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

import type { Request } from 'express';

import * as dto from '@/auth/dto';
import { JwtGuard } from '@/auth/guard';
import { GetUser } from '@/decorator/get-user.decorator';
import { PaginationDto } from '@/shared/dto';
import { ApiResponse as IApiResponse } from '@/shared/interfaces';
import { generateBaseUrl, ResponseUtil } from '@/shared/utils';
import { getAllUserExample, getUserMeExample } from '@/user/doc';
import { createUserExample } from '@/user/doc/create-user.example';
import { GetAllUserDto } from '@/user/dto';
import { UserService } from '@/user/user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  @UseGuards(JwtGuard)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user information' })
  @ApiResponse({ status: 200, description: 'Connected user', example: getUserMeExample })
  getMe(@GetUser('') user: dto.LoggedInUser): { user: dto.LoggedInUser } {
    return { user: user };
  }

  @Post('')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    example: createUserExample,
  })
  async addUser(@Body() dto: dto.RegisterDto): Promise<IApiResponse<dto.LoggedInUser>> {
    const user = await this.userService.create(dto);

    return ResponseUtil.success(user, 'User created successfully');
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'Get all users',
    type: [GetAllUserDto],
    isArray: true,
    example: getAllUserExample,
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Req() request: Request,
  ): Promise<IApiResponse<GetAllUserDto[]>> {
    const { data, total } = await this.userService.findAll(paginationDto);

    const baseUrl = generateBaseUrl(request);

    console.log(paginationDto);

    return ResponseUtil.paginated(
      data,
      total,
      paginationDto.page || 1,
      paginationDto.limit || 10,
      'Users retrieved successfully',
      baseUrl,
    );
  }
}
