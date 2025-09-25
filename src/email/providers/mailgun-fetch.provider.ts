/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { EmailProvider } from '@/email/providers/mail.provider';

export class MailgunFetchProvider implements EmailProvider {
  private apiKey: string;
  private domain: string;
  private baseUrl: string;

  constructor(opts: { apiKey: string; domain: string; baseUrl?: string }) {
    this.apiKey = opts.apiKey;
    this.domain = opts.domain;
    this.baseUrl = opts.baseUrl || 'https://api.mailgun.net';

    console.log('MailgunFetchProvider configuration:', {
      domain: this.domain,
      baseUrl: this.baseUrl,
      apiKeyLength: this.apiKey?.length || 0,
    });
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

    const url = `${this.baseUrl}/v3/${this.domain}/messages`;

    // Préparer les données du formulaire
    const formData = new URLSearchParams();

    formData.append('from', from);
    formData.append('to', Array.isArray(to) ? to.join(',') : to);
    formData.append('subject', subject);

    if (html) {
      formData.append('html', html);
    }

    if (text) {
      formData.append('text', text);
    }

    if (headers?.['Reply-To']) {
      formData.append('h:Reply-To', headers['Reply-To']);
    }

    console.log('Sending email via Mailgun Fetch:', {
      url,
      domain: this.domain,
      to,
      subject,
      from,
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`api:${this.apiKey}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(`Mailgun API error: ${response.status} ${errorText}`);
      }

      const result = await response.json();

      console.log('Email sent successfully:', result);
    } catch (error) {
      console.error('Mailgun Fetch error:', error);
      throw error;
    }
  }
}
