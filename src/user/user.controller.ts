import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

import type { Request } from 'express';

import * as dto from '@/auth/dto';
import { JwtGuard } from '@/auth/guard';
import { RolesGuard } from '@/auth/guard';
import { Roles } from '@/decorator';
import { GetUser } from '@/decorator/get-user.decorator';
import { PaginationDto } from '@/shared/dto';
import { ApiResponse as IApiResponse } from '@/shared/interfaces';
import { generateBaseUrl, ResponseUtil } from '@/shared/utils';
import {
  getAllUserExample,
  getUserMeExample,
  updateUserExample,
  updateUserStatusExample,
} from '@/user/doc';
import { createUserExample } from '@/user/doc/create-user.example';
import { updateUserRoleExample } from '@/user/doc/update-user-role.example';
import { GetAllUserDto, UpdateUserDto, UpdateUserStatusDto } from '@/user/dto';
import { UpdateUserRoleDto } from '@/user/dto/update-user-role.dto';
import { UserService } from '@/user/user.service';
import { UserRole } from 'generated/prisma';

@Controller('users')
@UseGuards(JwtGuard, RolesGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user information' })
  @ApiResponse({ status: 200, description: 'Connected user', example: getUserMeExample })
  getMe(@GetUser('') user: dto.LoggedInUser): { user: dto.LoggedInUser } {
    return { user: user };
  }

  @Post('')
  @Roles(UserRole.ADMIN)
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
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtGuard)
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

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update current user base information' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UpdateUserDto,
    example: updateUserExample,
  })
  async updateMe(
    @GetUser('') user: dto.LoggedInUser,
    @Body() dto: UpdateUserDto,
    @Param('id') id: string,
  ): Promise<IApiResponse<dto.LoggedInUser>> {
    const updatedUser = await this.userService.update(id, dto);

    return ResponseUtil.success(updatedUser, 'User updated successfully');
  }

  @Patch(':id/role')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update user role', description: 'Update the role of a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User role updated successfully',
    example: updateUserRoleExample,
  })
  @HttpCode(HttpStatus.OK)
  async updateRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    await this.userService.updateRole(id, dto.role);

    return ResponseUtil.success(undefined, 'User role updated successfully');
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update user status',
    description: 'Handle a user status update by ID',
  })
  @ApiResponse({
    status: 200,
    description: 'User status updated successfully',
    example: updateUserStatusExample,
  })
  @HttpCode(HttpStatus.OK)
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateUserStatusDto) {
    await this.userService.updateStatus(id, dto.status);

    return ResponseUtil.success(undefined, 'User status updated successfully');
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  async deleteUser(@Param('id') id: string): Promise<IApiResponse<void>> {
    await this.userService.delete(id);

    return ResponseUtil.success(undefined, 'User deleted successfully');
  }
}
