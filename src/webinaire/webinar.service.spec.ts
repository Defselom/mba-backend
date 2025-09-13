import { BadRequestException, HttpStatus, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PaginationDto } from '@/shared/dto';
import {
  AssignActorsDto,
  CreateWebinarDto,
  UpdateWebinarDto,
  UpdateWebinarStatusDto,
  WebinarRegistrationDto,
} from '@/webinaire/dto/index.dto';
import { WebinarController } from '@/webinaire/webinar.controller';
import { WebinarService } from '@/webinaire/webinar.service';

describe('WebinarController', () => {
  let controller: WebinarController;
  let service: WebinarService;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebinarController],
      providers: [
        {
          provide: WebinarService,
          useValue: mockWebinarService,
        },
      ],
    }).compile();

    controller = module.get<WebinarController>(WebinarController);
    service = module.get<WebinarService>(WebinarService);
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

      mockWebinarService.create.mockResolvedValue(expectedWebinar);

      const result = await controller.create(createWebinarDto);

      expect(service.create).toHaveBeenCalledWith(createWebinarDto);
      expect(result).toMatchObject({
        success: true,
        data: expectedWebinar,
        message: 'Webinar created successfully',
        statusCode: HttpStatus.CREATED,
      });
    });
  });

  describe('update', () => {
    it('should update a webinar successfully', async () => {
      const webinarId = '1';

      const updateWebinarDto: UpdateWebinarDto = {
        title: 'Updated Webinar',
        description: 'Updated Description',
      };

      const updatedWebinar = {
        id: webinarId,
        ...updateWebinarDto,
        status: 'SCHEDULED',
      };

      mockWebinarService.update.mockResolvedValue(updatedWebinar);

      const result = await controller.update(webinarId, updateWebinarDto);

      expect(service.update).toHaveBeenCalledWith(webinarId, updateWebinarDto);
      expect(result).toMatchObject({
        success: true,
        data: updatedWebinar,
        message: 'Webinar updated successfully',
        statusCode: HttpStatus.OK,
      });
    });
  });

  describe('handleStatus', () => {
    it('should handle webinar status successfully', async () => {
      const webinarId = '1';

      const updateStatusDto: UpdateWebinarStatusDto = {
        status: 'ONGOING',
      };

      mockWebinarService.handleStatus.mockResolvedValue(undefined);

      const result = await controller.handleStatus(webinarId, updateStatusDto);

      expect(service.handleStatus).toHaveBeenCalledWith(webinarId, updateStatusDto.status);
      expect(result).toMatchObject({
        success: true,
        data: null,
        message: 'Webinar status handled successfully',
        statusCode: HttpStatus.OK,
      });
    });
  });

  describe('delete', () => {
    it('should delete a webinar successfully', async () => {
      const webinarId = '1';

      mockWebinarService.delete.mockResolvedValue(undefined);

      const result = await controller.delete(webinarId);

      expect(service.delete).toHaveBeenCalledWith(webinarId);
      expect(result).toMatchObject({
        success: true,
        data: null,
        message: 'Webinar deleted successfully',
        statusCode: HttpStatus.OK,
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated webinars', async () => {
      const paginationDto: PaginationDto = {
        page: 1,
        limit: 10,
      };

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

      const mockResponse = {
        data: mockWebinars,
        total: 2,
      };

      mockWebinarService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(paginationDto);

      expect(service.findAll).toHaveBeenCalledWith(paginationDto);
      expect(result).toMatchObject({
        success: true,
        data: mockWebinars,
        message: 'Webinars retrieved successfully',
        meta: {
          total: 2,
          page: 1,
          limit: 10,
        },
        statusCode: HttpStatus.OK,
      });
    });

    it('should return paginated webinars with default pagination', async () => {
      const paginationDto: PaginationDto = {};

      const mockWebinars = [
        {
          id: '1',
          title: 'Webinar 1',
          status: 'SCHEDULED',
        },
      ];

      const mockResponse = {
        data: mockWebinars,
        total: 1,
      };

      mockWebinarService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(paginationDto);

      expect(service.findAll).toHaveBeenCalledWith(paginationDto);
      expect(result).toMatchObject({
        success: true,
        data: mockWebinars,
        message: 'Webinars retrieved successfully',
        meta: {
          total: 1,
          page: 1,
          limit: 10,
        },
        statusCode: HttpStatus.OK,
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

      const updatedWebinar = {
        id: webinarId,
        title: 'Test Webinar',
        animatedBy: 'user1',
        moderatedBy: 'user2',
        collaborators: ['user3', 'user4'],
      };

      mockWebinarService.assignActors.mockResolvedValue(updatedWebinar);

      const result = await controller.assignActors(webinarId, assignActorsDto);

      expect(service.assignActors).toHaveBeenCalledWith(webinarId, assignActorsDto);
      expect(result).toMatchObject({
        success: true,
        data: updatedWebinar,
        message: 'Assignment completed successfully',
        statusCode: HttpStatus.OK,
      });
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
        },
        {
          id: 'reg2',
          webinarId: 'webinar2',
          userId: 'user2',
          status: 'CONFIRMED',
        },
      ];

      mockWebinarService.getAllRegistrations.mockResolvedValue(mockRegistrations);

      const result = await controller.getAllRegistrations();

      expect(service.getAllRegistrations).toHaveBeenCalled();
      expect(result).toMatchObject({
        success: true,
        data: mockRegistrations,
        message: 'Registrations retrieved successfully',
        statusCode: HttpStatus.OK,
      });
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
        },
        {
          id: 'reg2',
          webinarId: webinarId,
          userId: 'user2',
          status: 'CONFIRMED',
        },
      ];

      mockWebinarService.getRegistrations.mockResolvedValue(mockRegistrations);

      const result = await controller.getRegistrations(webinarId);

      expect(service.getRegistrations).toHaveBeenCalledWith(webinarId);
      expect(result).toMatchObject({
        success: true,
        data: mockRegistrations,
        message: 'Registrations retrieved successfully',
        statusCode: HttpStatus.OK,
      });
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
        webinarId: 'webinar1',
        userId: 'user1',
        status: 'CONFIRMED',
      };

      mockWebinarService.registerUser.mockResolvedValue(mockRegistration);

      const result = await controller.register(registrationDto);

      expect(service.registerUser).toHaveBeenCalledWith(
        registrationDto.webinarId,
        registrationDto.userId,
      );
      expect(result).toMatchObject({
        success: true,
        data: mockRegistration,
        message: 'Registration successful',
        statusCode: HttpStatus.CREATED,
      });
    });

    it('should throw NotFoundException when webinar does not exist', async () => {
      const registrationDto: WebinarRegistrationDto = {
        webinarId: 'nonexistent',
        userId: 'user1',
      };

      mockWebinarService.registerUser.mockRejectedValue(new NotFoundException());

      await expect(controller.register(registrationDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when webinar is full', async () => {
      const registrationDto: WebinarRegistrationDto = {
        webinarId: 'webinar1',
        userId: 'user1',
      };

      mockWebinarService.registerUser.mockRejectedValue(new BadRequestException());

      await expect(controller.register(registrationDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancelRegistration', () => {
    it('should cancel user registration successfully', async () => {
      const registrationDto: WebinarRegistrationDto = {
        webinarId: 'webinar1',
        userId: 'user1',
      };

      const mockCanceledRegistration = {
        id: 'reg1',
        webinarId: 'webinar1',
        userId: 'user1',
        status: 'CANCELED',
      };

      mockWebinarService.unregisterUser.mockResolvedValue(mockCanceledRegistration);

      const result = await controller.cancelRegistration(registrationDto);

      expect(service.unregisterUser).toHaveBeenCalledWith(
        registrationDto.webinarId,
        registrationDto.userId,
      );
      expect(result).toMatchObject({
        success: true,
        data: mockCanceledRegistration,
        message: 'Cancellation successful',
        statusCode: HttpStatus.OK,
      });
    });

    it('should throw NotFoundException when registration does not exist', async () => {
      const registrationDto: WebinarRegistrationDto = {
        webinarId: 'webinar1',
        userId: 'user1',
      };

      mockWebinarService.unregisterUser.mockRejectedValue(new NotFoundException());

      await expect(controller.cancelRegistration(registrationDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when registration is already canceled', async () => {
      const registrationDto: WebinarRegistrationDto = {
        webinarId: 'webinar1',
        userId: 'user1',
      };

      mockWebinarService.unregisterUser.mockRejectedValue(new BadRequestException());

      await expect(controller.cancelRegistration(registrationDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
