import { DEFAULT_FROM } from '@/email/email.constants';

export interface EmailConfig {
  defaultFrom: string;
  mailgun: {
    apiKey: string;
    domain: string;
    baseUrl?: string;
  };
}

export const loadEmailConfig = (): EmailConfig => ({
  defaultFrom: process.env.EMAIL_DEFAULT_FROM || DEFAULT_FROM,
  mailgun: {
    apiKey: process.env.MAILGUN_API_KEY!,
    domain: process.env.MAILGUN_DOMAIN!,
    baseUrl: process.env.MAILGUN_BASE_URL, // optionnel (EU/US)
  },
});
