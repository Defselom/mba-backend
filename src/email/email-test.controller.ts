import { Body, Controller, Post, Get, HttpStatus, HttpCode } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

import {
  SendAccountStatusEmailDto,
  SendAccountValidationEmailDto,
  SendCredentialsEmailDto,
  SendNotificationEmailDto,
  SendPasswordResetEmailDto,
  SendTestEmailDto,
  SendTemplatedEmailDto,
  SendWelcomeEmailDto,
} from './dto/send-test-email.dto';
import { EmailConfig } from '@/email/config/email.config';
import { EmailService } from '@/email/email.service';

interface TestResult {
  template: string;
  status: 'success' | 'error';
  error?: string;
}

@ApiTags('Email Test')
@Controller('test/email')
export class EmailTestController {
  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService<EmailConfig>,
  ) {}

  @Get('config')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Vérifier la configuration email' })
  @ApiResponse({ status: 200, description: 'Configuration email' })
  checkEmailConfig() {
    const mailgunConfig = this.configService.get('mailgun', { infer: true });
    const defaultFrom = this.configService.get('defaultFrom', { infer: true });

    return {
      success: true,
      message: 'Configuration email',
      data: {
        defaultFrom,
        mailgun: {
          domain: mailgunConfig?.domain,
          baseUrl: mailgunConfig?.baseUrl || 'https://api.mailgun.net',
          hasApiKey: !!mailgunConfig?.apiKey,
          apiKeyLength: mailgunConfig?.apiKey?.length || 0,
        },
        environment: {
          MAILGUN_API_KEY: !!process.env.MAILGUN_API_KEY,
          MAILGUN_DOMAIN: !!process.env.MAILGUN_DOMAIN,
          MAILGUN_BASE_URL: !!process.env.MAILGUN_BASE_URL,
          EMAIL_DEFAULT_FROM: !!process.env.EMAIL_DEFAULT_FROM,
          FRONTEND_URL: !!process.env.FRONTEND_URL,
        },
      },
    };
  }

  @Post('send-basic')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Envoyer un email basique de test' })
  @ApiResponse({ status: 200, description: 'Email envoyé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 500, description: "Erreur lors de l'envoi" })
  @ApiBody({ type: SendTestEmailDto })
  async sendBasicTestEmail(@Body() sendTestEmailDto: SendTestEmailDto) {
    try {
      await this.emailService.sendMail({
        to: sendTestEmailDto.to,
        subject: sendTestEmailDto.subject,
        html:
          sendTestEmailDto.html ||
          "<h1>Email de test</h1><p>Ceci est un email de test envoyé depuis l'API MBA.</p>",
        text:
          sendTestEmailDto.text ||
          "Email de test - Ceci est un email de test envoyé depuis l'API MBA.",
      });

      return {
        success: true,
        message: 'Email envoyé avec succès',
        data: {
          to: sendTestEmailDto.to,
          subject: sendTestEmailDto.subject,
        },
      };
    } catch (error) {
      console.log(error);

      return {
        success: false,
        message: "Erreur lors de l'envoi de l'email",
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }

  @Post('send-welcome')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Envoyer un email de bienvenue' })
  @ApiResponse({ status: 200, description: 'Email de bienvenue envoyé' })
  @ApiBody({ type: SendWelcomeEmailDto })
  async sendWelcomeEmail(@Body() sendWelcomeEmailDto: SendWelcomeEmailDto) {
    try {
      await this.emailService.sendWelcomeEmail(
        sendWelcomeEmailDto.to,
        sendWelcomeEmailDto.userName,
      );

      return {
        success: true,
        message: 'Email de bienvenue envoyé avec succès',
        data: {
          to: sendWelcomeEmailDto.to,
          userName: sendWelcomeEmailDto.userName,
        },
      };
    } catch (error) {
      console.log(error);

      return {
        success: false,
        message: "Erreur lors de l'envoi de l'email de bienvenue",
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }

  @Post('send-password-reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Envoyer un email de réinitialisation de mot de passe' })
  @ApiResponse({ status: 200, description: 'Email de réinitialisation envoyé' })
  @ApiBody({ type: SendPasswordResetEmailDto })
  async sendPasswordResetEmail(@Body() sendPasswordResetEmailDto: SendPasswordResetEmailDto) {
    try {
      await this.emailService.sendPasswordResetEmail(
        sendPasswordResetEmailDto.to,
        sendPasswordResetEmailDto.resetToken,
      );

      return {
        success: true,
        message: 'Email de réinitialisation envoyé avec succès',
        data: {
          to: sendPasswordResetEmailDto.to,
          resetToken: sendPasswordResetEmailDto.resetToken,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: "Erreur lors de l'envoi de l'email de réinitialisation",
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }

  @Post('send-notification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Envoyer un email de notification' })
  @ApiResponse({ status: 200, description: 'Email de notification envoyé' })
  @ApiBody({ type: SendNotificationEmailDto })
  async sendNotificationEmail(@Body() sendNotificationEmailDto: SendNotificationEmailDto) {
    try {
      await this.emailService.sendNotificationEmail({
        to: sendNotificationEmailDto.to,
        subject: sendNotificationEmailDto.subject,
        message: sendNotificationEmailDto.message,
        userName: sendNotificationEmailDto.userName,
        actionUrl: sendNotificationEmailDto.actionUrl,
        actionText: sendNotificationEmailDto.actionText,
      });

      return {
        success: true,
        message: 'Email de notification envoyé avec succès',
        data: {
          to: sendNotificationEmailDto.to,
          subject: sendNotificationEmailDto.subject,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: "Erreur lors de l'envoi de l'email de notification",
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }

  @Post('send-templated')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Envoyer un email avec template personnalisé' })
  @ApiResponse({ status: 200, description: 'Email avec template envoyé' })
  @ApiBody({ type: SendTemplatedEmailDto })
  async sendTemplatedEmail(@Body() sendTemplatedEmailDto: SendTemplatedEmailDto) {
    try {
      await this.emailService.sendTemplatedEmail({
        to: sendTemplatedEmailDto.to,
        subject: sendTemplatedEmailDto.subject,
        template: sendTemplatedEmailDto.template,
        context: sendTemplatedEmailDto.context || {},
      });

      return {
        success: true,
        message: 'Email avec template envoyé avec succès',
        data: {
          to: sendTemplatedEmailDto.to,
          subject: sendTemplatedEmailDto.subject,
          template: sendTemplatedEmailDto.template,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: "Erreur lors de l'envoi de l'email avec template",
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }

  @Post('test-all-templates')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tester tous les templates disponibles' })
  @ApiResponse({ status: 200, description: 'Tous les templates testés' })
  async testAllTemplates(@Body('to') to: string) {
    if (!to) {
      return {
        success: false,
        message: "L'adresse email de destination est requise",
      };
    }

    const results: TestResult[] = [];

    try {
      // Test welcome template
      await this.emailService.sendWelcomeEmail(to, 'Utilisateur Test');
      results.push({ template: 'welcome', status: 'success' });
    } catch (error) {
      results.push({
        template: 'welcome',
        status: 'error',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }

    try {
      // Test password reset template
      await this.emailService.sendPasswordResetEmail(to, 'test-token-123456');
      results.push({ template: 'reset-password', status: 'success' });
    } catch (error) {
      results.push({
        template: 'reset-password',
        status: 'error',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }

    try {
      // Test notification template
      await this.emailService.sendNotificationEmail({
        to,
        subject: 'Test de notification',
        message: '<p>Ceci est un <strong>test</strong> de notification avec du contenu HTML.</p>',
        userName: 'Utilisateur Test',
        actionUrl: 'https://example.com/action',
        actionText: 'Voir les détails',
      });
      results.push({ template: 'notification', status: 'success' });
    } catch (error) {
      results.push({
        template: 'notification',
        status: 'error',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    return {
      success: errorCount === 0,
      message: `Test terminé: ${successCount} succès, ${errorCount} erreurs`,
      data: {
        to,
        results,
        summary: {
          total: results.length,
          success: successCount,
          errors: errorCount,
        },
      },
    };
  }

  @Post('send-credentials')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Envoyer les identifiants de connexion par email' })
  @ApiResponse({ status: 200, description: 'Email des identifiants envoyé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 500, description: "Erreur lors de l'envoi de l'email" })
  @ApiBody({ type: SendCredentialsEmailDto })
  async sendCredentialsEmail(@Body() sendCredentialsEmailDto: SendCredentialsEmailDto) {
    try {
      await this.emailService.sendCredentialsEmail({
        to: sendCredentialsEmailDto.to,
        email: sendCredentialsEmailDto.email,
        username: sendCredentialsEmailDto.username,
        password: sendCredentialsEmailDto.password,
      });

      return {
        success: true,
        message: 'Email des identifiants envoyé avec succès',
        data: {
          to: sendCredentialsEmailDto.to,
          userName: sendCredentialsEmailDto.userName,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: "Erreur lors de l'envoi de l'email des identifiants",
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }

  @Post('send-account-validation')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Envoyer une notification de validation de compte' })
  @ApiResponse({ status: 200, description: 'Email de validation de compte envoyé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 500, description: "Erreur lors de l'envoi de l'email" })
  @ApiBody({ type: SendAccountValidationEmailDto })
  async sendAccountValidationEmail(
    @Body() sendAccountValidationEmailDto: SendAccountValidationEmailDto,
  ) {
    try {
      await this.emailService.sendAccountValidationEmail({
        to: sendAccountValidationEmailDto.to,
        userName: sendAccountValidationEmailDto.userName,
        isApproved: sendAccountValidationEmailDto.isApproved,
        rejectionReason: sendAccountValidationEmailDto.rejectionReason,
        additionalNotes: sendAccountValidationEmailDto.additionalNotes,
        canReapply: sendAccountValidationEmailDto.canReapply,
      });

      return {
        success: true,
        message: 'Email de validation de compte envoyé avec succès',
        data: {
          to: sendAccountValidationEmailDto.to,
          userName: sendAccountValidationEmailDto.userName,
          isApproved: sendAccountValidationEmailDto.isApproved,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: "Erreur lors de l'envoi de l'email de validation de compte",
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }

  @Post('send-account-status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Envoyer une notification de statut de compte (activé/désactivé)' })
  @ApiResponse({ status: 200, description: 'Email de statut de compte envoyé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 500, description: "Erreur lors de l'envoi de l'email" })
  @ApiBody({ type: SendAccountStatusEmailDto })
  async sendAccountStatusEmail(@Body() sendAccountStatusEmailDto: SendAccountStatusEmailDto) {
    try {
      await this.emailService.sendAccountStatusEmail({
        to: sendAccountStatusEmailDto.to,
        userName: sendAccountStatusEmailDto.userName,
        isActive: sendAccountStatusEmailDto.isActive,
        reason: sendAccountStatusEmailDto.reason,
        additionalNotes: sendAccountStatusEmailDto.additionalNotes,
        canReactivate: sendAccountStatusEmailDto.canReactivate,
        canContact: sendAccountStatusEmailDto.canContact,
      });

      return {
        success: true,
        message: 'Email de statut de compte envoyé avec succès',
        data: {
          to: sendAccountStatusEmailDto.to,
          userName: sendAccountStatusEmailDto.userName,
          isActive: sendAccountStatusEmailDto.isActive,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: "Erreur lors de l'envoi de l'email de statut de compte",
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }
}
