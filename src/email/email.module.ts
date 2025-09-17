import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { EmailConfig, loadEmailConfig } from '@/email/config/email.config';
import { EmailService } from '@/email/email.service';
import { EMAIL_PROVIDER } from '@/email/email.tokens';
import type { EmailProvider } from '@/email/providers/mail.provider';
import { MailgunFetchProvider } from '@/email/providers/mailgun-fetch.provider';

@Module({
  imports: [ConfigModule.forFeature(loadEmailConfig)],
  providers: [
    EmailService,
    {
      provide: EMAIL_PROVIDER,
      useFactory: (configService: ConfigService<EmailConfig>): EmailProvider => {
        const mailgunConfig = configService.get('mailgun', { infer: true });

        if (!mailgunConfig?.apiKey || !mailgunConfig?.domain) {
          throw new Error(
            'Mailgun configuration is missing. Please provide MAILGUN_API_KEY and MAILGUN_DOMAIN.',
          );
        }

        return new MailgunFetchProvider(mailgunConfig);
      },
      inject: [ConfigService],
    },
  ],
  exports: [EmailService],
})
export class EmailModule {}
