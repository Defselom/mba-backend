import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { UserRole, UserStatus } from '@/../generated/prisma';
import { LoggedInUser, RegisterDto } from '@/auth/dto';
import { generateRandomPassword, hashPassword } from '@/auth/utils';
import { EmailService } from '@/email/email.service';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto } from '@/shared/dto';
import { UploadService } from '@/upload/upload.service';
import { GetAllUserDto, UpdateUserDto } from '@/user/dto';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
    private emailService: EmailService,
  ) {}

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
    const generatedPassword = generateRandomPassword(12);
    const hashedPassword = await hashPassword(generatedPassword);

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

    // 4. Create role-specific profile
    switch (dto.role) {
      case UserRole.PARTICIPANT:
        if (!dto.participantProfile)
          throw new BadRequestException('Participant profile is required');
        await this.prisma.participantProfile.create({
          data: {
            userId: user.id,
            ...dto.participantProfile,
          },
        });
        break;
      case UserRole.SPEAKER:
        if (!dto.speakerProfile) throw new BadRequestException('Speaker profile is required');
        await this.prisma.speakerProfile.create({
          data: {
            userId: user.id,
            ...dto.speakerProfile,
          },
        });
        break;
      case UserRole.MODERATOR:
        if (!dto.moderatorProfile) throw new BadRequestException('Moderator profile is required');
        await this.prisma.moderatorProfile.create({
          data: {
            userId: user.id,
            ...dto.moderatorProfile,
          },
        });
        break;
      case UserRole.ADMIN:
        await this.prisma.adminProfile.create({
          data: {
            userId: user.id,
          },
        });
        break;

      default:
        break;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;

    const userImgUrl = await this.uploadService.getPresignedUrlFromPublicUrl(
      user?.profileImage ?? '',
    );

    const userWithImgUrl = { ...result, profileImage: userImgUrl };

    // send credentials email
    await this.emailService.sendCredentialsEmail({
      to: user.email,
      email: user.email,
      username: user.username,
      password: generatedPassword,
    });

    return userWithImgUrl;
  }

  async findAll(paginationDto: PaginationDto): Promise<{ data: GetAllUserDto[]; total: number }> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = paginationDto;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.userAccount.findMany({
        where: { isDeleted: false },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        omit: { password: true },
      }),
      this.prisma.userAccount.count({
        where: { isDeleted: false },
      }),
    ]);

    return { data: data as GetAllUserDto[], total };
  }

  async update(id: string, dto: UpdateUserDto): Promise<LoggedInUser> {
    const user = await this.prisma.userAccount.findUnique({
      where: { id, isDeleted: false },
    });

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

  // soft delete user
  async delete(id: string): Promise<void> {
    const user = await this.prisma.userAccount.findUnique({
      where: { id, isDeleted: false },
      select: { role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Effectuer un soft delete au lieu d'une suppression physique
    await this.prisma.userAccount.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  // update user status
  async updateStatus(id: string, userStatus: UserStatus): Promise<void> {
    const user = await this.prisma.userAccount.findUnique({
      where: { id, isDeleted: false },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.userAccount.update({
      where: { id },
      data: { status: userStatus },
    });

    console.log(updated);
  }

  async updateRole(id: string, userRole: UserRole): Promise<void> {
    const user = await this.prisma.userAccount.findUnique({
      where: { id, isDeleted: false },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.userAccount.update({
      where: { id },
      data: { role: userRole },
    });

    console.log(updated);
  }

  async getUserRegistrations(userId: string) {
    const registrations = await this.prisma.registration.findMany({
      where: { userId, isDeleted: false },
      include: {
        webinar: true,
      },
    });

    return registrations;
  }
}
