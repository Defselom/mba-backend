# Email Service

Ce module fournit un service d'envoi d'emails avec support des templates Handlebars et intégration Mailgun.

## Configuration

### Variables d'environnement

Ajoutez ces variables à votre fichier `.env` :

```bash
# Email Configuration
EMAIL_DEFAULT_FROM="MBA <no-reply@your-domain.com>"

# Mailgun Configuration
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your-domain.com
# MAILGUN_BASE_URL=https://api.eu.mailgun.net (pour l'EU, optionnel)

# Frontend URL (pour les liens dans les emails)
FRONTEND_URL=http://localhost:3000
```

### Configuration Mailgun

1. Créez un compte sur [Mailgun](https://www.mailgun.com/)
2. Obtenez votre API Key et votre domaine
3. Si vous êtes en Europe, utilisez `MAILGUN_BASE_URL=https://api.eu.mailgun.net`

## Utilisation

### Service d'email de base

```typescript
import { EmailService } from '@/email/email.service';

@Injectable()
export class YourService {
  constructor(private readonly emailService: EmailService) {}

  async sendSimpleEmail() {
    await this.emailService.sendMail({
      to: 'user@example.com',
      subject: 'Hello World',
      html: '<h1>Hello!</h1><p>This is a test email.</p>',
      text: 'Hello! This is a test email.',
    });
  }
}
```

### Emails avec templates

```typescript
// Email de bienvenue
await this.emailService.sendWelcomeEmail('user@example.com', 'John Doe');

// Email de réinitialisation de mot de passe
await this.emailService.sendPasswordResetEmail('user@example.com', 'reset-token-123');

// Email de notification personnalisé
await this.emailService.sendNotificationEmail({
  to: 'user@example.com',
  subject: 'Nouvelle notification',
  message: '<p>Vous avez une nouvelle notification importante.</p>',
  userName: 'John Doe',
  actionUrl: 'https://myapp.com/notifications',
  actionText: 'Voir les notifications',
});
```

### Templates personnalisés

```typescript
await this.emailService.sendTemplatedEmail({
  to: 'user@example.com',
  subject: 'Custom Template',
  template: 'my-custom-template', // fichier: src/email/templates/my-custom-template.hbs
  context: {
    userName: 'John Doe',
    customData: 'Any data you need',
  },
});
```

## Templates

### Structure des fichiers

```
src/email/templates/
├── layouts/
│   └── base.hbs          # Layout principal
├── partials/
│   ├── button.hbs        # Partial pour les boutons
│   └── alert.hbs         # Partial pour les alertes
├── welcome.hbs           # Template de bienvenue
├── reset-password.hbs    # Template de réinitialisation
└── notification.hbs      # Template de notification générique
```

### Création d'un nouveau template

1. Créez un fichier `.hbs` dans `src/email/templates/`
2. Utilisez la syntaxe Handlebars avec les helpers disponibles

```handlebars
<h1>Hello {{userName}}!</h1>

<p>Aujourd'hui c'est le {{formatDate (new Date)}}.</p>

{{#if showButton}}
  {{> button url=(url '/dashboard') text='Accéder au dashboard'}}
{{/if}}

{{> alert title='Important' message='Ceci est un message important.'}}
```

### Helpers disponibles

- `{{formatDate date}}` - Formate une date en français
- `{{url path}}` - Génère une URL complète avec le FRONTEND_URL
- `{{ifEquals arg1 arg2}}` - Condition d'égalité
- `{{> partialName}}` - Inclusion de partials

### Partials disponibles

- `{{> button url='...' text='...' style='...'}}` - Bouton stylisé
- `{{> alert title='...' message='...'}}` - Alerte avec icône

## Testing

```typescript
// Test unitaire
describe('EmailService', () => {
  // Assurez-vous d'avoir un fichier .env.test avec les variables de test

  it('should send welcome email', async () => {
    await emailService.sendWelcomeEmail('test@example.com', 'Test User');
  });
});
```

## Dépendances

- `handlebars` - Moteur de templates
- `mailgun.js` - Client Mailgun
- `form-data` - Support pour Mailgun

```bash
npm install handlebars mailgun.js form-data
npm install -D @types/node
```
