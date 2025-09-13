import { BadRequestException, HttpStatus, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { JwtGuard, RolesGuard } from '@/auth/guard';
import { ResponseUtil } from '@/shared/utils';
import {
  AssignActorsDto,
  CreateWebinarDto,
  UpdateWebinarDto,
  UpdateWebinarStatusDto,
  WebinarRegistrationDto,
} from '@/webinaire/dto/index.dto';
import { WebinarController } from '@/webinaire/webinar.controller';
import { WebinarService } from '@/webinaire/webinar.service';
import { RegistrationStatus, WebinarStatus } from '@/../generated/prisma';

describe('WebinarController', () => {
  let controller: WebinarController;

  const mockWebinarService = {
    create: jest.fn(),
    update: jest.fn(),
    handleStatus: jest.fn(),
    delete: jest.fn(),
    findAll: jest.fn(),
    assignActors: jest.fn(),
    getAllRegistrations: jest.fn(),
    getRegistrations: jest.fn(),
    registerUser: jest.fn(),
    unregisterUser: jest.fn(),
  };

  const mockJwtGuard = {
    canActivate: jest.fn(() => true),
  };

  const mockRolesGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebinarController],
      providers: [
        {
          provide: WebinarService,
          useValue: mockWebinarService,
        },
      ],
    })
      .overrideGuard(JwtGuard)
      .useValue(mockJwtGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<WebinarController>(WebinarController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a webinar successfully', async () => {
      const createDto: CreateWebinarDto = {
        title: 'Test Webinar',
        description: 'Test Description',
        dateTime: new Date('2025-12-01T10:00:00Z'),
        duration: 60,
        legalTopic: 'Contract Law',
        maxCapacity: 100,
      };

      const createdWebinar = {
        id: '1',
        ...createDto,
        status: WebinarStatus.SCHEDULED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockWebinarService.create.mockResolvedValue(createdWebinar);

      const result = await controller.create(createDto);

      expect(mockWebinarService.create).toHaveBeenCalledWith(createDto);
      expect(result).toMatchObject({
        success: true,
        data: createdWebinar,
        message: 'Webinar created successfully',
        meta: undefined,
        status: HttpStatus.CREATED,
      });
      expect(result.timestamp).toEqual(expect.any(String));
    });

    it('should handle service errors', async () => {
      const createDto: CreateWebinarDto = {
        title: 'Test Webinar',
        description: 'Test Description',
        dateTime: new Date('2025-12-01T10:00:00Z'),
        duration: 60,
        legalTopic: 'Contract Law',
        maxCapacity: 100,
      };

      mockWebinarService.create.mockRejectedValue(
        new BadRequestException('Error creating webinar'),
      );

      await expect(controller.create(createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update a webinar successfully', async () => {
      const webinarId = '1';

      const updateDto: UpdateWebinarDto = {
        title: 'Updated Webinar',
        description: 'Updated Description',
      };

      const updatedWebinar = {
        id: webinarId,
        ...updateDto,
        status: WebinarStatus.SCHEDULED,
      };

      mockWebinarService.update.mockResolvedValue(updatedWebinar);

      const result = await controller.update(webinarId, updateDto);

      expect(mockWebinarService.update).toHaveBeenCalledWith(webinarId, updateDto);
      expect(result).toMatchObject(
        ResponseUtil.success(updatedWebinar, 'Webinar updated successfully'),
      );
    });

    it('should handle service errors during update', async () => {
      const webinarId = '1';

      const updateDto: UpdateWebinarDto = {
        title: 'Updated Webinar',
      };

      mockWebinarService.update.mockRejectedValue(new NotFoundException('Webinar not found'));

      await expect(controller.update(webinarId, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('handleStatus', () => {
    it('should handle webinar status successfully', async () => {
      const webinarId = '1';

      const statusDto: UpdateWebinarStatusDto = {
        status: WebinarStatus.ONGOING,
      };

      mockWebinarService.handleStatus.mockResolvedValue({
        id: webinarId,
        status: WebinarStatus.ONGOING,
      });

      const result = await controller.handleStatus(webinarId, statusDto);

      expect(mockWebinarService.handleStatus).toHaveBeenCalledWith(webinarId, statusDto.status);
      expect(result).toEqual(ResponseUtil.success(null, 'Webinar status handled successfully'));
    });

    it('should handle service errors during status update', async () => {
      const webinarId = '1';

      const statusDto: UpdateWebinarStatusDto = {
        status: WebinarStatus.ONGOING,
      };

      mockWebinarService.handleStatus.mockRejectedValue(new NotFoundException('Webinar not found'));

      await expect(controller.handleStatus(webinarId, statusDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a webinar successfully', async () => {
      const webinarId = '1';

      mockWebinarService.delete.mockResolvedValue({
        id: webinarId,
        status: WebinarStatus.SCHEDULED,
      });

      const result = await controller.delete(webinarId);

      expect(mockWebinarService.delete).toHaveBeenCalledWith(webinarId);
      expect(result).toEqual(ResponseUtil.success(null, 'Webinar deleted successfully'));
    });

    it('should handle service errors during deletion', async () => {
      const webinarId = '1';

      mockWebinarService.delete.mockRejectedValue(new NotFoundException('Webinar not found'));

      await expect(controller.delete(webinarId)).rejects.toThrow(NotFoundException);
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

      const mockResult = { data: mockWebinars, total: 2 };

      mockWebinarService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll({});

      expect(mockWebinarService.findAll).toHaveBeenCalledWith({});
      expect(result).toEqual(
        ResponseUtil.success(mockWebinars, 'Webinars retrieved successfully', {
          total: 2,
          page: 1,
          limit: 10,
        }),
      );
    });

    it('should return paginated webinars with custom pagination', async () => {
      const pagination = { page: 2, limit: 5 };

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

      const mockResult = { data: mockWebinars, total: 20 };

      mockWebinarService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(pagination);

      expect(mockWebinarService.findAll).toHaveBeenCalledWith(pagination);
      expect(result).toEqual(
        ResponseUtil.success(mockWebinars, 'Webinars retrieved successfully', {
          total: 20,
          page: 2,
          limit: 5,
        }),
      );
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

      const updatedWebinar = {
        id: webinarId,
        animatedById: assignDto.animatedById,
        moderatedById: assignDto.moderatedById,
        animatedBy: { id: 'user1', username: 'animator' },
        moderatedBy: { id: 'user2', username: 'moderator' },
        collaborators: [
          { id: 'user3', username: 'collab1' },
          { id: 'user4', username: 'collab2' },
        ],
      };

      mockWebinarService.assignActors.mockResolvedValue(updatedWebinar);

      const result = await controller.assignActors(webinarId, assignDto);

      expect(mockWebinarService.assignActors).toHaveBeenCalledWith(webinarId, assignDto);
      expect(result).toEqual(
        ResponseUtil.success(updatedWebinar, 'Assignment completed successfully'),
      );
    });

    it('should handle service errors during assignment', async () => {
      const webinarId = '1';

      const assignDto: AssignActorsDto = {
        animatedById: 'user1',
      };

      mockWebinarService.assignActors.mockRejectedValue(new NotFoundException('Webinar not found'));

      await expect(controller.assignActors(webinarId, assignDto)).rejects.toThrow(
        NotFoundException,
      );
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

      mockWebinarService.getAllRegistrations.mockResolvedValue(mockRegistrations);

      const result = await controller.getAllRegistrations();

      expect(mockWebinarService.getAllRegistrations).toHaveBeenCalled();
      expect(result).toEqual(
        ResponseUtil.success(mockRegistrations, 'Registrations retrieved successfully'),
      );
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

      mockWebinarService.getRegistrations.mockResolvedValue(mockRegistrations);

      const result = await controller.getRegistrations(webinarId);

      expect(mockWebinarService.getRegistrations).toHaveBeenCalledWith(webinarId);
      expect(result).toEqual(
        ResponseUtil.success(mockRegistrations, 'Registrations retrieved successfully'),
      );
    });
  });

  describe('register', () => {
    it('should register user for webinar successfully', async () => {
      const registrationDto: WebinarRegistrationDto = {
        webinarId: 'webinar1',
        userId: 'user1',
      };

      const mockRegistration = {
        id: 'reg1',
        webinarId: registrationDto.webinarId,
        userId: registrationDto.userId,
        status: RegistrationStatus.CONFIRMED,
      };

      mockWebinarService.registerUser.mockResolvedValue(mockRegistration);

      const result = await controller.register(registrationDto);

      expect(mockWebinarService.registerUser).toHaveBeenCalledWith(
        registrationDto.webinarId,
        registrationDto.userId,
      );
      expect(result).toMatchObject(
        ResponseUtil.success(
          mockRegistration,
          'Registration successful',
          undefined,
          HttpStatus.CREATED,
        ),
      );
    });

    it('should handle service errors during registration', async () => {
      const registrationDto: WebinarRegistrationDto = {
        webinarId: 'webinar1',
        userId: 'user1',
      };

      mockWebinarService.registerUser.mockRejectedValue(
        new BadRequestException('User is already registered'),
      );

      await expect(controller.register(registrationDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancelRegistration', () => {
    it('should cancel registration successfully', async () => {
      const cancellationDto: WebinarRegistrationDto = {
        webinarId: 'webinar1',
        userId: 'user1',
      };

      const mockRegistration = {
        id: 'reg1',
        webinarId: cancellationDto.webinarId,
        userId: cancellationDto.userId,
        status: RegistrationStatus.CANCELED,
      };

      mockWebinarService.unregisterUser.mockResolvedValue(mockRegistration);

      const result = await controller.cancelRegistration(cancellationDto);

      expect(mockWebinarService.unregisterUser).toHaveBeenCalledWith(
        cancellationDto.webinarId,
        cancellationDto.userId,
      );
      expect(result).toEqual(ResponseUtil.success(mockRegistration, 'Cancellation successful'));
    });

    it('should handle service errors during cancellation', async () => {
      const cancellationDto: WebinarRegistrationDto = {
        webinarId: 'webinar1',
        userId: 'user1',
      };

      mockWebinarService.unregisterUser.mockRejectedValue(
        new NotFoundException('Registration not found'),
      );

      await expect(controller.cancelRegistration(cancellationDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
