import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import * as pactum from 'pactum';

import { AppModule } from '../src/app.module';
import { PrismaService } from '@/prisma/prisma.service';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    const registerDto = {
      email: 'john.doe@example.com',
      username: 'johnny',
      password: 'securePass123',
      firstName: 'John',
      lastName: 'Doe',
      birthDay: '1990-01-01',
      phoneNumber: '123-456-7890',
    };

    const loginDto = {
      email: 'john.doe@example.com',
      password: 'securePass123',
    };

    describe('Register', () => {
      it('should register new user', () => {
        return pactum
          .spec()
          .post('/auth/register')
          .withBody(registerDto)
          .expectStatus(201)
          .expectBodyContains(registerDto.email)
          .expectBodyContains(registerDto.username);
      });

      it('should throw if user already exists', () => {
        return pactum
          .spec()
          .post('/auth/register')
          .withBody(registerDto)
          .expectStatus(409)
          .expectBodyContains('User already exists');
      });
    });

    describe('Login', () => {
      it('should login with email', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({
            email: loginDto.email,
            password: loginDto.password,
          })
          .expectStatus(200)
          .stores('accessToken', 'access_token')
          .stores('refreshCookies', 'res.cookies.refresh_token')
          .expectBodyContains('access_token')
          .expectBodyContains('user')
          .inspect();
      });

      it('should login with username', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({
            username: registerDto.username,
            password: registerDto.password,
          })
          .expectStatus(200);
      });

      it('should throw if credentials are invalid', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({
            email: loginDto.email,
            password: 'wrongPassword123',
          })
          .expectStatus(401);
      });

      it('should throw if email and username are missing', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({
            password: loginDto.password,
          })
          .expectStatus(400)
          .expectBodyContains('error');
      });
    });

    describe('Token Management', () => {
      describe('Refresh Token', () => {
        it('should fail with missing refresh token', () => {
          return pactum
            .spec()
            .post('/auth/refresh')
            .expectStatus(401)
            .expectBodyContains('Refresh token not found');
        });

        it('should fail with invalid refresh token', () => {
          return pactum
            .spec()
            .post('/auth/refresh')
            .withCookies(['refresh_token=invalid_token; Path=/; HttpOnly'])
            .expectStatus(401);
        });
      });

      describe('Token Expiration', () => {
        it('should fail with expired/invalid access token', () => {
          return pactum
            .spec()
            .get('/users/me')
            .withHeaders({
              Authorization: 'Bearer invalid_token',
            })
            .expectStatus(401);
        });

        it('should handle token expiration gracefully', () => {
          const expiredToken =
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZXhwIjoxfQ.invalid';

          return pactum
            .spec()
            .get('/users/me')
            .withHeaders({
              Authorization: `Bearer ${expiredToken}`,
            })
            .expectStatus(401);
        });
      });

      describe('Token Security', () => {
        it('should not accept malformed tokens', () => {
          return pactum
            .spec()
            .get('/users/me')
            .withHeaders({
              Authorization: 'Bearer malformed.token.here',
            })
            .expectStatus(401);
        });

        it('should not accept empty authorization header', () => {
          return pactum
            .spec()
            .get('/users/me')
            .withHeaders({
              Authorization: '',
            })
            .expectStatus(401);
        });

        it('should not accept token without Bearer prefix', () => {
          return pactum
            .spec()
            .get('/users/me')
            .withHeaders({
              Authorization: '$S{accessToken}',
            })
            .expectStatus(401);
        });
      });
    });

    describe('Logout', () => {
      it('should logout successfully', () => {
        return pactum
          .spec()
          .post('/auth/logout')
          .expectStatus(200)
          .expectBodyContains('Logout successful');
      });
    });

    // Tests supplémentaires pour les tokens avec de nouveaux utilisateurs
    describe('Additional Token Tests', () => {
      const tokenTestUser = {
        email: 'token.test@example.com',
        username: 'tokentest',
        password: 'securePass123',
        firstName: 'Token',
        lastName: 'Test',
        birthDay: '1990-01-01',
        phoneNumber: '123-456-7890',
      };

      it('should register token test user', () => {
        return pactum.spec().post('/auth/register').withBody(tokenTestUser).expectStatus(201);
      });

      it('should login token test user and store tokens', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({
            email: tokenTestUser.email,
            password: tokenTestUser.password,
          })
          .expectStatus(200)
          .stores('tokenTestAccessToken', 'access_token')
          .stores('tokenTestCookies', 'res.headers.set-cookie')
          .expectBodyContains('access_token')
          .expectBodyContains('user');
      });
    });
  });

  describe('User', () => {
    describe('GetMe', () => {
      it('should return current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{accessToken}',
          })
          .expectStatus(200)
          .expectBodyContains('email')
          .expectBodyContains('username');
      });
    });
  });
});
