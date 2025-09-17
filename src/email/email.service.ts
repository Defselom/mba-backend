import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { EmailConfig } from '@/email/config/email.config';
import { EMAIL_PROVIDER } from '@/email/email.tokens';
import type { EmailProvider } from '@/email/providers/mail.provider';
import { TemplateRenderer } from '@/email/renderer/template.renderer';

@Injectable()
export class EmailService {
  private templateRenderer: TemplateRenderer;

  constructor(
    @Inject(EMAIL_PROVIDER) private readonly emailProvider: EmailProvider,
    private readonly configService: ConfigService<EmailConfig>,
  ) {
    this.templateRenderer = new TemplateRenderer();
  }

  async sendMail({
    to,
    subject,
    html,
    text,
    from,
    headers,
  }: {
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
    from?: string;
    headers?: Record<string, string>;
  }): Promise<void> {
    const defaultFrom = this.configService.get('defaultFrom', { infer: true });

    await this.emailProvider.sendMail({
      to,
      subject,
      html,
      text,
      from: from || defaultFrom,
      headers,
    });
  }

  async sendTemplatedEmail({
    to,
    subject,
    template,
    context,
    from,
    headers,
  }: {
    to: string | string[];
    subject: string;
    template: string;
    context: Record<string, unknown>;
    from?: string;
    headers?: Record<string, string>;
  }): Promise<void> {
    const { html, text } = this.templateRenderer.renderTemplate(template, {
      title: subject,
      currentDate: new Date(),
      currentYear: new Date().getFullYear(),
      ...context,
    });

    await this.sendMail({
      to,
      subject,
      html,
      text,
      from,
      headers,
    });
  }

  async sendWelcomeEmail(to: string, userName: string): Promise<void> {
    await this.sendTemplatedEmail({
      to,
      subject: 'Bienvenue dans MBA !',
      template: 'welcome',
      context: {
        userName,
      },
    });
  }

  async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await this.sendTemplatedEmail({
      to,
      subject: 'Réinitialisation de votre mot de passe',
      template: 'reset-password',
      context: {
        resetUrl,
      },
    });
  }

  async sendNotificationEmail({
    to,
    subject,
    message,
    userName,
    actionUrl,
    actionText,
  }: {
    to: string | string[];
    subject: string;
    message: string;
    userName?: string;
    actionUrl?: string;
    actionText?: string;
  }): Promise<void> {
    await this.sendTemplatedEmail({
      to,
      subject,
      template: 'notification',
      context: {
        userName: userName || 'Utilisateur',
        message,
        actionUrl,
        actionText: actionText || 'Cliquez ici',
      },
    });
  }

  async sendCredentialsEmail({
    to,
    email,
    username,
    password,
  }: {
    to: string;
    email: string;
    username: string;
    password: string;
  }): Promise<void> {
    await this.sendTemplatedEmail({
      to,
      subject: 'Vos identifiants de connexion MBA',
      template: 'send-credentials',
      context: {
        email,
        username,
        password,
      },
    });
  }
}
