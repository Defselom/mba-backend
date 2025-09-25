import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { EmailModule } from '@/email/email.module';
import { EmailService } from '@/email/email.service';

describe('EmailService Integration Test', () => {
  let service: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env.test',
        }),
        EmailModule,
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Test à décommenter quand vous avez configuré vos variables d'environnement
  /*
  it('should send welcome email', async () => {
    await service.sendWelcomeEmail('test@example.com', 'John Doe');
  });

  it('should send password reset email', async () => {
    await service.sendPasswordResetEmail('test@example.com', 'test-token-123');
  });

  it('should send notification email', async () => {
    await service.sendNotificationEmail({
      to: 'test@example.com',
      subject: 'Test Notification',
      message: '<p>Ceci est un message de test avec du <strong>HTML</strong>.</p>',
      userName: 'John Doe',
      actionUrl: 'https://example.com/action',
      actionText: 'Voir les détails',
    });
  });
  */
});
