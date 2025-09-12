import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '@/prisma/prisma.service';
import { AssignActorsDto, CreateWebinarDto, UpdateWebinarDto } from '@/webinaire/dto/index.dto';
import { WebinarService } from '@/webinaire/webinar.service';
import { RegistrationStatus, WebinarStatus } from 'generated/prisma';

describe('WebinarService', () => {
  let service: WebinarService;

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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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
        status: WebinarStatus.SCHEDULED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.webinar.create.mockResolvedValue(expectedWebinar);

      const result = await service.create(createWebinarDto);

      expect(mockPrismaService.webinar.create).toHaveBeenCalledWith({
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

      const updateData: UpdateWebinarDto = {
        title: 'Updated Webinar',
        description: 'Updated Description',
      };

      const existingWebinar = {
        id: webinarId,
        status: WebinarStatus.SCHEDULED,
      };

      const updatedWebinar = {
        ...existingWebinar,
        ...updateData,
      };

      mockPrismaService.webinar.findUnique.mockResolvedValue(existingWebinar);
      mockPrismaService.webinar.update.mockResolvedValue(updatedWebinar);

      const result = await service.update(webinarId, updateData);

      expect(mockPrismaService.webinar.findUnique).toHaveBeenCalledWith({
        where: { id: webinarId },
      });
      expect(mockPrismaService.webinar.update).toHaveBeenCalledWith({
        where: { id: webinarId },
        data: updateData,
      });
      expect(result).toEqual(updatedWebinar);
    });

    it('should throw NotFoundException when webinar does not exist', async () => {
      const webinarId = '1';

      const updateData: UpdateWebinarDto = {
        title: 'Updated Webinar',
      };

      mockPrismaService.webinar.findUnique.mockResolvedValue(null);

      await expect(service.update(webinarId, updateData)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.webinar.findUnique).toHaveBeenCalledWith({
        where: { id: webinarId },
      });
    });

    it('should throw BadRequestException when trying to update canceled webinar', async () => {
      const webinarId = '1';

      const updateData: UpdateWebinarDto = {
        title: 'Updated Webinar',
      };

      const existingWebinar = {
        id: webinarId,
        status: WebinarStatus.CANCELED,
      };

      mockPrismaService.webinar.findUnique.mockResolvedValue(existingWebinar);

      await expect(service.update(webinarId, updateData)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when trying to update ongoing webinar', async () => {
      const webinarId = '1';

      const updateData: UpdateWebinarDto = {
        title: 'Updated Webinar',
      };

      const existingWebinar = {
        id: webinarId,
        status: WebinarStatus.ONGOING,
      };

      mockPrismaService.webinar.findUnique.mockResolvedValue(existingWebinar);

      await expect(service.update(webinarId, updateData)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when trying to update completed webinar', async () => {
      const webinarId = '1';

      const updateData: UpdateWebinarDto = {
        title: 'Updated Webinar',
      };

      const existingWebinar = {
        id: webinarId,
        status: WebinarStatus.COMPLETED,
      };

      mockPrismaService.webinar.findUnique.mockResolvedValue(existingWebinar);

      await expect(service.update(webinarId, updateData)).rejects.toThrow(BadRequestException);
    });
  });

  describe('handleStatus', () => {
    it('should update webinar status successfully', async () => {
      const webinarId = '1';
      const newStatus = WebinarStatus.ONGOING;

      const existingWebinar = {
        id: webinarId,
        status: WebinarStatus.SCHEDULED,
      };

      const updatedWebinar = {
        ...existingWebinar,
        status: newStatus,
      };

      mockPrismaService.webinar.findUnique.mockResolvedValue(existingWebinar);
      mockPrismaService.webinar.update.mockResolvedValue(updatedWebinar);

      const result = await service.handleStatus(webinarId, newStatus);

      expect(mockPrismaService.webinar.findUnique).toHaveBeenCalledWith({
        where: { id: webinarId },
      });
      expect(mockPrismaService.webinar.update).toHaveBeenCalledWith({
        where: { id: webinarId },
        data: { status: newStatus },
      });
      expect(result).toEqual(updatedWebinar);
    });

    it('should throw NotFoundException when webinar does not exist', async () => {
      const webinarId = '1';
      const newStatus = WebinarStatus.ONGOING;

      mockPrismaService.webinar.findUnique.mockResolvedValue(null);

      await expect(service.handleStatus(webinarId, newStatus)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a scheduled webinar successfully', async () => {
      const webinarId = '1';

      const existingWebinar = {
        id: webinarId,
        status: WebinarStatus.SCHEDULED,
      };

      mockPrismaService.webinar.findUnique.mockResolvedValue(existingWebinar);
      mockPrismaService.webinar.delete.mockResolvedValue(existingWebinar);

      const result = await service.delete(webinarId);

      expect(mockPrismaService.webinar.findUnique).toHaveBeenCalledWith({
        where: { id: webinarId },
      });
      expect(mockPrismaService.webinar.delete).toHaveBeenCalledWith({
        where: { id: webinarId },
      });
      expect(result).toEqual(existingWebinar);
    });

    it('should delete a canceled webinar successfully', async () => {
      const webinarId = '1';

      const existingWebinar = {
        id: webinarId,
        status: WebinarStatus.CANCELED,
      };

      mockPrismaService.webinar.findUnique.mockResolvedValue(existingWebinar);
      mockPrismaService.webinar.delete.mockResolvedValue(existingWebinar);

      const result = await service.delete(webinarId);

      expect(result).toEqual(existingWebinar);
    });

    it('should throw NotFoundException when webinar does not exist', async () => {
      const webinarId = '1';

      mockPrismaService.webinar.findUnique.mockResolvedValue(null);

      await expect(service.delete(webinarId)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when trying to delete ongoing webinar', async () => {
      const webinarId = '1';

      const existingWebinar = {
        id: webinarId,
        status: WebinarStatus.ONGOING,
      };

      mockPrismaService.webinar.findUnique.mockResolvedValue(existingWebinar);

      await expect(service.delete(webinarId)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when trying to delete completed webinar', async () => {
      const webinarId = '1';

      const existingWebinar = {
        id: webinarId,
        status: WebinarStatus.COMPLETED,
      };

      mockPrismaService.webinar.findUnique.mockResolvedValue(existingWebinar);

      await expect(service.delete(webinarId)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated webinars with default pagination', async () => {
      const mockWebinars = [
        {
          id: '1',
          title: 'Webinar 1',
          animatedBy: null,
          moderatedBy: null,
          collaborators: [],
          registrations: [],
        },
        {
          id: '2',
          title: 'Webinar 2',
          animatedBy: null,
          moderatedBy: null,
          collaborators: [],
          registrations: [],
        },
      ];

      mockPrismaService.webinar.findMany.mockResolvedValue(mockWebinars);
      mockPrismaService.webinar.count.mockResolvedValue(2);

      const result = await service.findAll({});

      expect(mockPrismaService.webinar.findMany).toHaveBeenCalledWith({
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
      expect(mockPrismaService.webinar.count).toHaveBeenCalled();
      expect(result).toEqual({ data: mockWebinars, total: 2 });
    });

    it('should return paginated webinars with custom pagination', async () => {
      const mockWebinars = [
        {
          id: '1',
          title: 'Webinar 1',
          animatedBy: null,
          moderatedBy: null,
          collaborators: [],
          registrations: [],
        },
      ];

      mockPrismaService.webinar.findMany.mockResolvedValue(mockWebinars);
      mockPrismaService.webinar.count.mockResolvedValue(20);

      const result = await service.findAll({ page: 2, limit: 5 });

      expect(mockPrismaService.webinar.findMany).toHaveBeenCalledWith({
        skip: 5,
        take: 5,
        orderBy: { dateTime: 'desc' },
        include: {
          animatedBy: true,
          moderatedBy: true,
          collaborators: true,
          registrations: true,
        },
      });
      expect(result).toEqual({ data: mockWebinars, total: 20 });
    });
  });

  describe('assignActors', () => {
    it('should assign actors to webinar successfully', async () => {
      const webinarId = '1';

      const assignDto: AssignActorsDto = {
        animatedById: 'user1',
        moderatedById: 'user2',
        collaboratorIds: ['user3', 'user4'],
      };

      const existingWebinar = {
        id: webinarId,
        title: 'Test Webinar',
      };

      const updatedWebinar = {
        ...existingWebinar,
        animatedById: assignDto.animatedById,
        moderatedById: assignDto.moderatedById,
        animatedBy: { id: 'user1', username: 'animator' },
        moderatedBy: { id: 'user2', username: 'moderator' },
        collaborators: [
          { id: 'user3', username: 'collab1' },
          { id: 'user4', username: 'collab2' },
        ],
      };

      mockPrismaService.webinar.findUnique.mockResolvedValue(existingWebinar);
      mockPrismaService.webinar.update.mockResolvedValue(updatedWebinar);

      const result = await service.assignActors(webinarId, assignDto);

      expect(mockPrismaService.webinar.findUnique).toHaveBeenCalledWith({
        where: { id: webinarId },
      });
      expect(mockPrismaService.webinar.update).toHaveBeenCalledWith({
        where: { id: webinarId },
        data: {
          animatedById: assignDto.animatedById,
          moderatedById: assignDto.moderatedById,
          collaborators: {
            set: assignDto.collaboratorIds?.map(userId => ({ id: userId })) || [],
          },
        },
        include: { animatedBy: true, moderatedBy: true, collaborators: true },
      });
      expect(result).toEqual(updatedWebinar);
    });

    it('should throw NotFoundException when webinar does not exist', async () => {
      const webinarId = '1';

      const assignDto: AssignActorsDto = {
        animatedById: 'user1',
      };

      mockPrismaService.webinar.findUnique.mockResolvedValue(null);

      await expect(service.assignActors(webinarId, assignDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllRegistrations', () => {
    it('should return all registrations', async () => {
      const mockRegistrations = [
        {
          id: '1',
          webinarId: 'webinar1',
          userId: 'user1',
          user: { id: 'user1', username: 'john' },
        },
        {
          id: '2',
          webinarId: 'webinar2',
          userId: 'user2',
          user: { id: 'user2', username: 'jane' },
        },
      ];

      mockPrismaService.registration.findMany.mockResolvedValue(mockRegistrations);

      const result = await service.getAllRegistrations();

      expect(mockPrismaService.registration.findMany).toHaveBeenCalledWith({
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
          id: '1',
          webinarId: webinarId,
          userId: 'user1',
          user: { id: 'user1', username: 'john' },
        },
      ];

      mockPrismaService.registration.findMany.mockResolvedValue(mockRegistrations);

      const result = await service.getRegistrations(webinarId);

      expect(mockPrismaService.registration.findMany).toHaveBeenCalledWith({
        where: { webinarId },
        include: {
          user: true,
        },
      });
      expect(result).toEqual(mockRegistrations);
    });
  });

  describe('registerUser', () => {
    it('should register user successfully', async () => {
      const webinarId = 'webinar1';
      const userId = 'user1';

      const mockWebinar = {
        id: webinarId,
        status: WebinarStatus.SCHEDULED,
        maxCapacity: 100,
        registrations: new Array(50), // 50 registrations
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

      expect(mockPrismaService.webinar.findUnique).toHaveBeenCalledWith({
        where: { id: webinarId },
        include: { registrations: true },
      });
      expect(mockPrismaService.registration.findUnique).toHaveBeenCalledWith({
        where: {
          webinarId_userId: {
            webinarId,
            userId,
          },
        },
      });
      expect(mockPrismaService.registration.create).toHaveBeenCalledWith({
        data: {
          webinarId,
          userId,
          status: RegistrationStatus.CONFIRMED,
        },
      });
      expect(result).toEqual(mockRegistration);
    });

    it('should throw NotFoundException when webinar does not exist', async () => {
      const webinarId = 'webinar1';
      const userId = 'user1';

      mockPrismaService.webinar.findUnique.mockResolvedValue(null);

      await expect(service.registerUser(webinarId, userId)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when webinar is not scheduled', async () => {
      const webinarId = 'webinar1';
      const userId = 'user1';

      const mockWebinar = {
        id: webinarId,
        status: WebinarStatus.ONGOING,
        maxCapacity: 100,
        registrations: [],
      };

      mockPrismaService.webinar.findUnique.mockResolvedValue(mockWebinar);

      await expect(service.registerUser(webinarId, userId)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when webinar is at max capacity', async () => {
      const webinarId = 'webinar1';
      const userId = 'user1';

      const mockWebinar = {
        id: webinarId,
        status: WebinarStatus.SCHEDULED,
        maxCapacity: 2,
        registrations: new Array(2), // At max capacity
      };

      mockPrismaService.webinar.findUnique.mockResolvedValue(mockWebinar);

      await expect(service.registerUser(webinarId, userId)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when user is already registered', async () => {
      const webinarId = 'webinar1';
      const userId = 'user1';

      const mockWebinar = {
        id: webinarId,
        status: WebinarStatus.SCHEDULED,
        maxCapacity: 100,
        registrations: [],
      };

      const existingRegistration = {
        id: 'reg1',
        webinarId,
        userId,
      };

      mockPrismaService.webinar.findUnique.mockResolvedValue(mockWebinar);
      mockPrismaService.registration.findUnique.mockResolvedValue(existingRegistration);

      await expect(service.registerUser(webinarId, userId)).rejects.toThrow(BadRequestException);
    });
  });

  describe('unregisterUser', () => {
    it('should unregister user successfully', async () => {
      const webinarId = 'webinar1';
      const userId = 'user1';

      const mockRegistration = {
        id: 'reg1',
        webinarId,
        userId,
        status: RegistrationStatus.CONFIRMED,
        webinar: {
          id: webinarId,
          title: 'Test Webinar',
        },
      };

      const updatedRegistration = {
        ...mockRegistration,
        status: RegistrationStatus.CANCELED,
      };

      mockPrismaService.registration.findUnique.mockResolvedValue(mockRegistration);
      mockPrismaService.registration.update.mockResolvedValue(updatedRegistration);

      const result = await service.unregisterUser(webinarId, userId);

      expect(mockPrismaService.registration.findUnique).toHaveBeenCalledWith({
        where: {
          webinarId_userId: {
            webinarId,
            userId,
          },
        },
        include: { webinar: true },
      });
      expect(mockPrismaService.registration.update).toHaveBeenCalledWith({
        where: {
          id: mockRegistration.id,
        },
        data: { status: RegistrationStatus.CANCELED },
      });
      expect(result).toEqual(updatedRegistration);
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
        webinar: {
          id: webinarId,
          title: 'Test Webinar',
        },
      };

      mockPrismaService.registration.findUnique.mockResolvedValue(mockRegistration);

      await expect(service.unregisterUser(webinarId, userId)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when associated webinar not found', async () => {
      const webinarId = 'webinar1';
      const userId = 'user1';

      const mockRegistration = {
        id: 'reg1',
        webinarId,
        userId,
        status: RegistrationStatus.CONFIRMED,
        webinar: null,
      };

      mockPrismaService.registration.findUnique.mockResolvedValue(mockRegistration);

      await expect(service.unregisterUser(webinarId, userId)).rejects.toThrow(NotFoundException);
    });
  });
});
