import formData from 'form-data';
import Mailgun from 'mailgun.js';

import { EmailProvider } from '@/email/providers/mail.provider';

// Use the built-in types from mailgun.js when available
interface MailgunMessageData {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from: string;
  'h:Reply-To'?: string;
}

interface MailgunMessages {
  create: (domain: string, data: MailgunMessageData) => Promise<unknown>;
}

interface MailgunClient {
  messages: MailgunMessages;
}

export class MailgunProvider implements EmailProvider {
  private client: MailgunClient;
  private domain: string;

  constructor(opts: { apiKey: string; domain: string; baseUrl?: string }) {
    // Utiliser l'URL par défaut si baseUrl n'est pas fournie
    const baseUrl = opts.baseUrl || 'https://api.mailgun.net';
    
    console.log('Mailgun configuration:', {
      domain: opts.domain,
      baseUrl,
      apiKeyLength: opts.apiKey?.length || 0,
    });

    // Solution 1: Use proper constructor without any casting
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const mailgun = new Mailgun(formData);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    this.client = mailgun.client({
      username: 'api',
      key: opts.apiKey,
      url: baseUrl,
    }) as MailgunClient;

    this.domain = opts.domain;
  }

  async sendMail({
    to,
    subject,
    html,
    text,
    from,
    headers,
  }: Parameters<EmailProvider['sendMail']>[0]): Promise<void> {
    if (!from) {
      throw new Error('From address is required');
    }

    const messageData = {
      to,
      subject,
      html,
      text,
      from,
      'h:Reply-To': headers?.['Reply-To'],
    };

    console.log('Sending email via Mailgun:', {
      domain: this.domain,
      to,
      subject,
      from,
    });

    try {
      const result = await this.client.messages.create(this.domain, messageData);

      console.log('Email sent successfully:', result);
    } catch (error) {
      console.error('Mailgun error:', error);
      throw error;
    }
  }
}
