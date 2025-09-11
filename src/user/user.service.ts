import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { LoggedInUser, RegisterDto } from '@/auth/dto';
import { hashPassword } from '@/auth/utils';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto } from '@/shared/dto';
import { GetAllUserDto, UpdateUserDto } from '@/user/dto';
import { UserRole, UserStatus } from 'generated/prisma';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(dto: RegisterDto): Promise<LoggedInUser> {
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
        status:
          dto.role == UserRole.PARTICIPANT ? UserStatus.ACTIVE : UserStatus.PENDING_VALIDATION,
        firstName: dto.firstName,
        lastName: dto.lastName,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        phone: dto.phone,
        profileImage: dto.profileImage,
      },
    });

    return user;
  }

  async findAll(paginationDto: PaginationDto): Promise<{ data: GetAllUserDto[]; total: number }> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = paginationDto;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.userAccount.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        omit: { password: true },
      }),
      this.prisma.userAccount.count(),
    ]);

    return { data: data as GetAllUserDto[], total };
  }

  async update(id: string, dto: UpdateUserDto): Promise<LoggedInUser> {
    const user = await this.prisma.userAccount.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.userAccount.update({
      where: { id },
      data: {
        ...dto,
        role: dto.role,
      },
      omit: { password: true },
    });

    return updatedUser;
  }

  // delete user
  async delete(id: string): Promise<void> {
    const user = await this.prisma.userAccount.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.userAccount.delete({ where: { id } });
  }

  // update user status
  async updateStatus(id: string, userStatus: UserStatus): Promise<void> {
    const user = await this.prisma.userAccount.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.userAccount.update({
      where: { id },
      data: { status: userStatus },
    });

    console.log(updated);
  }
}
