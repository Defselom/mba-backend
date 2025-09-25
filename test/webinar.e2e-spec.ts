import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import * as pactum from 'pactum';

import { RegistrationStatus, UserRole, UserStatus, WebinarStatus } from '@/../generated/prisma';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';

describe('Webinar (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testUserId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );

    await app.init();
    await app.listen(3334);

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3334');

    // Create test admin user and login
    const adminUser = {
      email: 'admin@webinar-test.com',
      username: 'admin-webinar',
      password: 'securePass123',
      firstName: 'Admin',
      lastName: 'Webinar',
      birthDay: '1990-01-01',
      phoneNumber: '123-456-7890',
    };

    await pactum.spec().post('/auth/register').withBody(adminUser).expectStatus(201);

    await pactum
      .spec()
      .post('/auth/login')
      .withBody({
        email: adminUser.email,
        password: adminUser.password,
      })
      .expectStatus(200)
      .stores('adminToken', 'access_token');

    // Create test user for registrations
    const testUser = await prisma.userAccount.create({
      data: {
        username: 'user-test-webinar',
        email: 'user@webinar-test.com',
        password: '$2b$10$hashedpassword',
        role: UserRole.PARTICIPANT,
        status: UserStatus.ACTIVE,
        firstName: 'User',
        lastName: 'Test',
      },
    });

    testUserId = testUser.id;
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.registration.deleteMany({});
    await prisma.webinar.deleteMany({});
    await prisma.userAccount.deleteMany({
      where: {
        email: {
          in: ['admin@webinar-test.com', 'user@webinar-test.com'],
        },
      },
    });

    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /webinars', () => {
    it('should create a webinar', () => {
      const createWebinarDto = {
        title: 'Test Webinar E2E',
        description: 'A comprehensive test webinar for e2e testing',
        dateTime: new Date('2025-12-01T10:00:00Z').toISOString(),
        duration: 120,
        legalTopic: 'Contract Law',
        maxCapacity: 50,
        accessLink: 'https://zoom.us/test-webinar',
      };

      return pactum
        .spec()
        .post('/webinars')
        .withHeaders({
          Authorization: 'Bearer $S{adminToken}',
        })
        .withBody(createWebinarDto)
        .expectStatus(HttpStatus.CREATED)
        .expectJsonMatch({
          success: true,
          message: 'Webinar created successfully',
          data: {
            title: createWebinarDto.title,
            description: createWebinarDto.description,
            duration: createWebinarDto.duration,
            legalTopic: createWebinarDto.legalTopic,
            maxCapacity: createWebinarDto.maxCapacity,
            status: WebinarStatus.SCHEDULED,
          },
        })
        .stores('testWebinarId', 'data.id');
    });

    it('should fail to create webinar with invalid data', () => {
      const invalidDto = {
        title: '', // Invalid: empty title
        description: 'Test',
        dateTime: 'invalid-date',
        duration: -1, // Invalid: negative duration
        legalTopic: '',
        maxCapacity: 0, // Invalid: zero capacity
      };

      return pactum
        .spec()
        .post('/webinars')
        .withHeaders({
          Authorization: 'Bearer $S{adminToken}',
        })
        .withBody(invalidDto)
        .expectStatus(HttpStatus.BAD_REQUEST);
    });
  });

  describe('GET /webinars', () => {
    it('should get all webinars with pagination', () => {
      return pactum
        .spec()
        .get('/webinars')
        .withHeaders({
          Authorization: 'Bearer $S{adminToken}',
        })
        .withQueryParams({ page: 1, limit: 10 })
        .expectStatus(HttpStatus.OK)
        .expectBodyContains('success')
        .expectBodyContains('data')
        .expectBodyContains('meta');
    });
  });

  describe('PUT /webinars/:id', () => {
    it('should update a webinar', () => {
      const updateDto = {
        title: 'Updated Test Webinar E2E',
        description: 'Updated description for e2e testing',
        duration: 90,
      };

      return pactum
        .spec()
        .put('/webinars/$S{testWebinarId}')
        .withHeaders({
          Authorization: 'Bearer $S{adminToken}',
        })
        .withBody(updateDto)
        .expectStatus(HttpStatus.OK)
        .expectJsonMatch({
          success: true,
          message: 'Webinar updated successfully',
          data: {
            id: '$S{testWebinarId}',
            title: updateDto.title,
            description: updateDto.description,
            duration: updateDto.duration,
          },
        });
    });

    it('should fail to update non-existent webinar', () => {
      const updateDto = {
        title: 'Non-existent Webinar',
      };

      return pactum
        .spec()
        .put('/webinars/non-existent-id')
        .withHeaders({
          Authorization: 'Bearer $S{adminToken}',
        })
        .withBody(updateDto)
        .expectStatus(HttpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /webinars/:id/handle-status', () => {
    it('should update webinar status', () => {
      const statusDto = {
        status: WebinarStatus.ONGOING,
      };

      return pactum
        .spec()
        .patch('/webinars/$S{testWebinarId}/handle-status')
        .withHeaders({
          Authorization: 'Bearer $S{adminToken}',
        })
        .withBody(statusDto)
        .expectStatus(HttpStatus.OK)
        .expectJsonMatch({
          success: true,
          message: 'Webinar status handled successfully',
        });
    });
  });

  describe('PATCH /webinars/:id/assign', () => {
    it('should assign actors to webinar', () => {
      const assignDto = {
        animatedById: testUserId,
        moderatedById: testUserId,
        collaboratorIds: [testUserId],
      };

      return pactum
        .spec()
        .patch('/webinars/$S{testWebinarId}/assign')
        .withHeaders({
          Authorization: 'Bearer $S{adminToken}',
        })
        .withBody(assignDto)
        .expectStatus(HttpStatus.OK)
        .expectJsonMatch({
          success: true,
          message: 'Assignment completed successfully',
          data: {
            animatedById: testUserId,
            moderatedById: testUserId,
          },
        });
    });
  });

  describe('Registration Management', () => {
    beforeEach(async () => {
      // Reset webinar status to SCHEDULED for registration tests
      // Note: In a real test, you might want to use a proper mechanism to retrieve the webinar ID
      const webinars = await prisma.webinar.findMany({
        where: {
          title: 'Test Webinar E2E',
        },
      });

      if (webinars.length > 0) {
        await prisma.webinar.update({
          where: { id: webinars[0].id },
          data: { status: WebinarStatus.SCHEDULED },
        });
      }
    });

    describe('POST /webinars/register', () => {
      it('should register user for webinar', () => {
        const registrationDto = {
          webinarId: '$S{testWebinarId}',
          userId: testUserId,
        };

        return pactum
          .spec()
          .post('/webinars/register')
          .withHeaders({
            Authorization: 'Bearer $S{adminToken}',
          })
          .withBody(registrationDto)
          .expectStatus(HttpStatus.CREATED)
          .expectJsonMatch({
            success: true,
            message: 'Registration successful',
            data: {
              webinarId: '$S{testWebinarId}',
              userId: testUserId,
              status: RegistrationStatus.CONFIRMED,
            },
          });
      });

      it('should fail to register same user twice', () => {
        const registrationDto = {
          webinarId: '$S{testWebinarId}',
          userId: testUserId,
        };

        return pactum
          .spec()
          .post('/webinars/register')
          .withHeaders({
            Authorization: 'Bearer $S{adminToken}',
          })
          .withBody(registrationDto)
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
    });

    describe('GET /webinars/registrations', () => {
      it('should get all registrations', () => {
        return pactum
          .spec()
          .get('/webinars/registrations')
          .withHeaders({
            Authorization: 'Bearer $S{adminToken}',
          })
          .expectStatus(HttpStatus.OK)
          .expectJsonMatch({
            success: true,
            message: 'Registrations retrieved successfully',
          })
          .expectBodyContains('data');
      });
    });

    describe('GET /webinars/:id/registrations', () => {
      it('should get registrations for specific webinar', () => {
        return pactum
          .spec()
          .get('/webinars/$S{testWebinarId}/registrations')
          .withHeaders({
            Authorization: 'Bearer $S{adminToken}',
          })
          .expectStatus(HttpStatus.OK)
          .expectJsonMatch({
            success: true,
            message: 'Registrations retrieved successfully',
          })
          .expectBodyContains('data');
      });
    });

    describe('PATCH /webinars/cancel-registration', () => {
      it('should cancel user registration', () => {
        const cancellationDto = {
          webinarId: '$S{testWebinarId}',
          userId: testUserId,
        };

        return pactum
          .spec()
          .patch('/webinars/cancel-registration')
          .withHeaders({
            Authorization: 'Bearer $S{adminToken}',
          })
          .withBody(cancellationDto)
          .expectStatus(HttpStatus.OK)
          .expectJsonMatch({
            success: true,
            message: 'Cancellation successful',
            data: {
              status: RegistrationStatus.CANCELED,
            },
          });
      });

      it('should fail to cancel non-existent registration', () => {
        const cancellationDto = {
          webinarId: 'non-existent-webinar-id',
          userId: testUserId,
        };

        return pactum
          .spec()
          .patch('/webinars/cancel-registration')
          .withHeaders({
            Authorization: 'Bearer $S{adminToken}',
          })
          .withBody(cancellationDto)
          .expectStatus(HttpStatus.NOT_FOUND);
      });
    });
  });

  describe('DELETE /webinars/:id', () => {
    it('should fail to delete ongoing webinar', async () => {
      // Set webinar status to ONGOING
      const webinars = await prisma.webinar.findMany({
        where: {
          title: 'Test Webinar E2E',
        },
      });

      if (webinars.length > 0) {
        await prisma.webinar.update({
          where: { id: webinars[0].id },
          data: { status: WebinarStatus.ONGOING },
        });

        return pactum
          .spec()
          .delete(`/webinars/${webinars[0].id}`)
          .withHeaders({
            Authorization: 'Bearer $S{adminToken}',
          })
          .expectStatus(HttpStatus.BAD_REQUEST);
      }
    });

    it('should delete a scheduled webinar', async () => {
      // Create a new webinar for deletion test
      const webinarToDelete = await prisma.webinar.create({
        data: {
          title: 'Webinar to Delete',
          description: 'This webinar will be deleted',
          dateTime: new Date('2025-12-01T15:00:00Z'),
          duration: 60,
          legalTopic: 'Test Topic',
          maxCapacity: 30,
          status: WebinarStatus.SCHEDULED,
        },
      });

      return pactum
        .spec()
        .delete(`/webinars/${webinarToDelete.id}`)
        .withHeaders({
          Authorization: 'Bearer $S{adminToken}',
        })
        .expectStatus(HttpStatus.OK)
        .expectJsonMatch({
          success: true,
          message: 'Webinar deleted successfully',
        });
    });

    it('should fail to delete non-existent webinar', () => {
      return pactum
        .spec()
        .delete('/webinars/non-existent-id')
        .withHeaders({
          Authorization: 'Bearer $S{adminToken}',
        })
        .expectStatus(HttpStatus.NOT_FOUND);
    });
  });
});
