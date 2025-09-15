import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { RegistrationStatus, WebinarStatus } from '@/../generated/prisma';
import { PrismaService } from '@/prisma/prisma.service';
import { AssignActorsDto, CreateWebinarDto, UpdateWebinarDto } from '@/webinaire/dto/index.dto';
import { WebinarService } from '@/webinaire/webinar.service';

describe('WebinarService', () => {
  let service: WebinarService;
  let prisma: PrismaService;

  const mockPrismaService = {
    webinar: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    registration: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebinarService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<WebinarService>(WebinarService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a webinar successfully', async () => {
      const createWebinarDto: CreateWebinarDto = {
        title: 'Test Webinar',
        description: 'Test Description',
        dateTime: new Date('2025-12-01T10:00:00Z'),
        duration: 60,
        legalTopic: 'Contract Law',
        maxCapacity: 100,
      };

      const expectedWebinar = {
        id: '1',
        ...createWebinarDto,
        status: 'SCHEDULED',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.webinar.create.mockResolvedValue(expectedWebinar);

      const result = await service.create(createWebinarDto);

      expect(prisma.webinar.create).toHaveBeenCalledWith({
        data: {
          ...createWebinarDto,
          status: 'SCHEDULED',
        },
      });
      expect(result).toEqual(expectedWebinar);
    });
  });

  describe('update', () => {
    it('should update a webinar successfully', async () => {
      const webinarId = '1';

      const updateWebinarDto: UpdateWebinarDto = {
        title: 'Updated Webinar',
        description: 'Updated Description',
      };

      const existingWebinar = {
        id: webinarId,
        title: 'Old Title',
        status: 'SCHEDULED',
      };

      const updatedWebinar = {
        id: webinarId,
        ...updateWebinarDto,
        status: 'SCHEDULED',
      };

      mockPrismaService.webinar.findUnique.mockResolvedValue(existingWebinar);
      mockPrismaService.webinar.update.mockResolvedValue(updatedWebinar);

      const result = await service.update(webinarId, updateWebinarDto);

      expect(prisma.webinar.findUnique).toHaveBeenCalledWith({ where: { id: webinarId } });
      expect(prisma.webinar.update).toHaveBeenCalledWith({
        where: { id: webinarId },
        data: updateWebinarDto,
      });
      expect(result).toEqual(updatedWebinar);
    });

    it('should throw NotFoundException when webinar does not exist', async () => {
      const webinarId = '1';

      const updateWebinarDto: UpdateWebinarDto = {
        title: 'Updated Webinar',
      };

      mockPrismaService.webinar.findUnique.mockResolvedValue(null);

      await expect(service.update(webinarId, updateWebinarDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when webinar is canceled/ongoing/completed', async () => {
      const webinarId = '1';

      const updateWebinarDto: UpdateWebinarDto = {
        title: 'Updated Webinar',
      };

      const existingWebinar = {
        id: webinarId,
        title: 'Old Title',
        status: 'CANCELED',
      };

      mockPrismaService.webinar.findUnique.mockResolvedValue(existingWebinar);

      await expect(service.update(webinarId, updateWebinarDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('handleStatus', () => {
    it('should handle webinar status successfully', async () => {
      const webinarId = '1';
      const status = WebinarStatus.ONGOING;

      const existingWebinar = {
        id: webinarId,
        title: 'Test Webinar',
        status: 'SCHEDULED',
      };

      const updatedWebinar = {
        ...existingWebinar,
        status: 'ONGOING',
      };

      mockPrismaService.webinar.findUnique.mockResolvedValue(existingWebinar);
      mockPrismaService.webinar.update.mockResolvedValue(updatedWebinar);

      const result = await service.handleStatus(webinarId, status);

      expect(prisma.webinar.findUnique).toHaveBeenCalledWith({ where: { id: webinarId } });
      expect(prisma.webinar.update).toHaveBeenCalledWith({
        where: { id: webinarId },
        data: { status },
      });
      expect(result).toEqual(updatedWebinar);
    });

    it('should throw NotFoundException when webinar does not exist', async () => {
      const webinarId = '1';
      const status = WebinarStatus.ONGOING;

      mockPrismaService.webinar.findUnique.mockResolvedValue(null);

      await expect(service.handleStatus(webinarId, status)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a webinar successfully', async () => {
      const webinarId = '1';

      const existingWebinar = {
        id: webinarId,
        title: 'Test Webinar',
        status: 'SCHEDULED',
      };

      mockPrismaService.webinar.findUnique.mockResolvedValue(existingWebinar);
      mockPrismaService.webinar.delete.mockResolvedValue(existingWebinar);

      const result = await service.delete(webinarId);

      expect(prisma.webinar.findUnique).toHaveBeenCalledWith({ where: { id: webinarId } });
      expect(prisma.webinar.delete).toHaveBeenCalledWith({ where: { id: webinarId } });
      expect(result).toEqual(existingWebinar);
    });

    it('should throw NotFoundException when webinar does not exist', async () => {
      const webinarId = '1';

      mockPrismaService.webinar.findUnique.mockResolvedValue(null);

      await expect(service.delete(webinarId)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when webinar is ongoing or completed', async () => {
      const webinarId = '1';

      const existingWebinar = {
        id: webinarId,
        title: 'Test Webinar',
        status: 'ONGOING',
      };

      mockPrismaService.webinar.findUnique.mockResolvedValue(existingWebinar);

      await expect(service.delete(webinarId)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated webinars', async () => {
      const pagination = { page: 1, limit: 10 };

      const mockWebinars = [
        {
          id: '1',
          title: 'Webinar 1',
          status: 'SCHEDULED',
        },
        {
          id: '2',
          title: 'Webinar 2',
          status: 'SCHEDULED',
        },
      ];

      mockPrismaService.webinar.findMany.mockResolvedValue(mockWebinars);
      mockPrismaService.webinar.count.mockResolvedValue(2);

      const result = await service.findAll(pagination);

      expect(prisma.webinar.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { dateTime: 'desc' },
        include: {
          animatedBy: true,
          moderatedBy: true,
          collaborators: true,
          registrations: true,
        },
      });
      expect(prisma.webinar.count).toHaveBeenCalled();
      expect(result).toEqual({
        data: mockWebinars,
        total: 2,
      });
    });

    it('should return paginated webinars with default pagination', async () => {
      const pagination = {};

      const mockWebinars = [
        {
          id: '1',
          title: 'Webinar 1',
          status: 'SCHEDULED',
        },
      ];

      mockPrismaService.webinar.findMany.mockResolvedValue(mockWebinars);
      mockPrismaService.webinar.count.mockResolvedValue(1);

      const result = await service.findAll(pagination);

      expect(prisma.webinar.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { dateTime: 'desc' },
        include: {
          animatedBy: true,
          moderatedBy: true,
          collaborators: true,
          registrations: true,
        },
      });
      expect(result).toEqual({
        data: mockWebinars,
        total: 1,
      });
    });
  });

  describe('assignActors', () => {
    it('should assign actors to webinar successfully', async () => {
      const webinarId = '1';

      const assignActorsDto: AssignActorsDto = {
        animatedById: 'user1',
        moderatedById: 'user2',
        collaboratorIds: ['user3', 'user4'],
      };

      const existingWebinar = {
        id: webinarId,
        title: 'Test Webinar',
      };

      const updatedWebinar = {
        id: webinarId,
        title: 'Test Webinar',
        animatedById: 'user1',
        moderatedById: 'user2',
        animatedBy: { id: 'user1', name: 'User 1' },
        moderatedBy: { id: 'user2', name: 'User 2' },
        collaborators: [
          { id: 'user3', name: 'User 3' },
          { id: 'user4', name: 'User 4' },
        ],
      };

      mockPrismaService.webinar.findUnique.mockResolvedValue(existingWebinar);
      mockPrismaService.webinar.update.mockResolvedValue(updatedWebinar);

      const result = await service.assignActors(webinarId, assignActorsDto);

      expect(prisma.webinar.findUnique).toHaveBeenCalledWith({ where: { id: webinarId } });
      expect(prisma.webinar.update).toHaveBeenCalledWith({
        where: { id: webinarId },
        data: {
          animatedById: 'user1',
          moderatedById: 'user2',
          collaborators: {
            set: [{ id: 'user3' }, { id: 'user4' }],
          },
        },
        include: { animatedBy: true, moderatedBy: true, collaborators: true },
      });
      expect(result).toEqual(updatedWebinar);
    });

    it('should throw NotFoundException when webinar does not exist', async () => {
      const webinarId = '1';

      const assignActorsDto: AssignActorsDto = {
        animatedById: 'user1',
        moderatedById: 'user2',
      };

      mockPrismaService.webinar.findUnique.mockResolvedValue(null);

      await expect(service.assignActors(webinarId, assignActorsDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAllRegistrations', () => {
    it('should return all registrations successfully', async () => {
      const mockRegistrations = [
        {
          id: 'reg1',
          webinarId: 'webinar1',
          userId: 'user1',
          status: 'CONFIRMED',
          user: { id: 'user1', name: 'User 1' },
        },
        {
          id: 'reg2',
          webinarId: 'webinar2',
          userId: 'user2',
          status: 'CONFIRMED',
          user: { id: 'user2', name: 'User 2' },
        },
      ];

      mockPrismaService.registration.findMany.mockResolvedValue(mockRegistrations);

      const result = await service.getAllRegistrations();

      expect(prisma.registration.findMany).toHaveBeenCalledWith({
        include: {
          user: true,
        },
      });
      expect(result).toEqual(mockRegistrations);
    });
  });

  describe('getRegistrations', () => {
    it('should return registrations for a specific webinar', async () => {
      const webinarId = 'webinar1';

      const mockRegistrations = [
        {
          id: 'reg1',
          webinarId: webinarId,
          userId: 'user1',
          status: 'CONFIRMED',
          user: { id: 'user1', name: 'User 1' },
        },
        {
          id: 'reg2',
          webinarId: webinarId,
          userId: 'user2',
          status: 'CONFIRMED',
          user: { id: 'user2', name: 'User 2' },
        },
      ];

      mockPrismaService.registration.findMany.mockResolvedValue(mockRegistrations);

      const result = await service.getRegistrations(webinarId);

      expect(prisma.registration.findMany).toHaveBeenCalledWith({
        where: { webinarId },
        include: {
          user: true,
        },
      });
      expect(result).toEqual(mockRegistrations);
    });
  });

  describe('registerUser', () => {
    it('should register user for webinar successfully', async () => {
      const webinarId = 'webinar1';
      const userId = 'user1';

      const mockWebinar = {
        id: webinarId,
        title: 'Test Webinar',
        status: WebinarStatus.SCHEDULED,
        maxCapacity: 100,
        registrations: [],
      };

      const mockRegistration = {
        id: 'reg1',
        webinarId,
        userId,
        status: RegistrationStatus.CONFIRMED,
      };

      mockPrismaService.webinar.findUnique.mockResolvedValue(mockWebinar);
      mockPrismaService.registration.findUnique.mockResolvedValue(null);
      mockPrismaService.registration.create.mockResolvedValue(mockRegistration);

      const result = await service.registerUser(webinarId, userId);

      expect(prisma.webinar.findUnique).toHaveBeenCalledWith({
        where: { id: webinarId },
        include: { registrations: true },
      });
      expect(prisma.registration.findUnique).toHaveBeenCalledWith({
        where: {
          webinarId_userId: {
            webinarId,
            userId,
          },
        },
      });
      expect(prisma.registration.create).toHaveBeenCalledWith({
        data: {
          webinarId,
          userId,
          status: RegistrationStatus.CONFIRMED,
        },
      });
      expect(result).toEqual(mockRegistration);
    });

    it('should throw NotFoundException when webinar does not exist', async () => {
      const webinarId = 'nonexistent';
      const userId = 'user1';

      mockPrismaService.webinar.findUnique.mockResolvedValue(null);

      await expect(service.registerUser(webinarId, userId)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when webinar is not scheduled', async () => {
      const webinarId = 'webinar1';
      const userId = 'user1';

      const mockWebinar = {
        id: webinarId,
        title: 'Test Webinar',
        status: WebinarStatus.ONGOING,
        maxCapacity: 100,
        registrations: [],
      };

      mockPrismaService.webinar.findUnique.mockResolvedValue(mockWebinar);

      await expect(service.registerUser(webinarId, userId)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when webinar is full', async () => {
      const webinarId = 'webinar1';
      const userId = 'user1';

      const mockWebinar = {
        id: webinarId,
        title: 'Test Webinar',
        status: WebinarStatus.SCHEDULED,
        maxCapacity: 1,
        registrations: [{ id: 'reg1', userId: 'user2' }],
      };

      mockPrismaService.webinar.findUnique.mockResolvedValue(mockWebinar);

      await expect(service.registerUser(webinarId, userId)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when user is already registered', async () => {
      const webinarId = 'webinar1';
      const userId = 'user1';

      const mockWebinar = {
        id: webinarId,
        title: 'Test Webinar',
        status: WebinarStatus.SCHEDULED,
        maxCapacity: 100,
        registrations: [],
      };

      const existingRegistration = {
        id: 'reg1',
        webinarId,
        userId,
        status: RegistrationStatus.CONFIRMED,
      };

      mockPrismaService.webinar.findUnique.mockResolvedValue(mockWebinar);
      mockPrismaService.registration.findUnique.mockResolvedValue(existingRegistration);

      await expect(service.registerUser(webinarId, userId)).rejects.toThrow(BadRequestException);
    });
  });

  describe('unregisterUser', () => {
    it('should cancel user registration successfully', async () => {
      const webinarId = 'webinar1';
      const userId = 'user1';

      const mockRegistration = {
        id: 'reg1',
        webinarId,
        userId,
        status: RegistrationStatus.CONFIRMED,
        webinar: { id: webinarId, title: 'Test Webinar' },
      };

      const mockCanceledRegistration = {
        ...mockRegistration,
        status: RegistrationStatus.CANCELED,
      };

      mockPrismaService.registration.findUnique.mockResolvedValue(mockRegistration);
      mockPrismaService.registration.update.mockResolvedValue(mockCanceledRegistration);

      const result = await service.unregisterUser(webinarId, userId);

      expect(prisma.registration.findUnique).toHaveBeenCalledWith({
        where: {
          webinarId_userId: {
            webinarId,
            userId,
          },
        },
        include: { webinar: true },
      });
      expect(prisma.registration.update).toHaveBeenCalledWith({
        where: {
          id: 'reg1',
        },
        data: { status: RegistrationStatus.CANCELED },
      });
      expect(result).toEqual(mockCanceledRegistration);
    });

    it('should throw NotFoundException when registration does not exist', async () => {
      const webinarId = 'webinar1';
      const userId = 'user1';

      mockPrismaService.registration.findUnique.mockResolvedValue(null);

      await expect(service.unregisterUser(webinarId, userId)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when registration is already canceled', async () => {
      const webinarId = 'webinar1';
      const userId = 'user1';

      const mockRegistration = {
        id: 'reg1',
        webinarId,
        userId,
        status: RegistrationStatus.CANCELED,
        webinar: { id: webinarId, title: 'Test Webinar' },
      };

      mockPrismaService.registration.findUnique.mockResolvedValue(mockRegistration);

      await expect(service.unregisterUser(webinarId, userId)).rejects.toThrow(BadRequestException);
    });
  });
});
