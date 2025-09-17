import fs from 'node:fs';
import path from 'node:path';

import Handlebars from 'handlebars';

export class TemplateRenderer {
  private templatesDir: string;

  constructor() {
    // Pour le développement, utiliser le chemin source
    const isDev = process.env.NODE_ENV !== 'production';

    if (isDev) {
      // En développement, partir de src/
      this.templatesDir = path.join(process.cwd(), 'src', 'email', 'templates');
    } else {
      // En production, partir de dist/
      this.templatesDir = path.join(__dirname, '..', 'templates');
    }

    console.log('Templates directory:', this.templatesDir);
    console.log('Directory exists:', fs.existsSync(this.templatesDir));

    if (fs.existsSync(this.templatesDir)) {
      console.log('Templates found:', fs.readdirSync(this.templatesDir));
    }

    this.registerHelpers();
    this.registerPartials();
  }

  private registerHelpers(): void {
    // Helper pour formater les dates
    Handlebars.registerHelper('formatDate', (date: Date) => {
      return new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    });

    // Helper pour créer une nouvelle date
    Handlebars.registerHelper('now', () => {
      return new Date();
    });

    // Helper pour formater la date actuelle
    Handlebars.registerHelper('formatNow', () => {
      return new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date());
    });

    // Helper pour l'année actuelle
    Handlebars.registerHelper('currentYear', () => {
      return new Date().getFullYear();
    });

    // Helper pour les URLs
    Handlebars.registerHelper('url', (path: string) => {
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

      return `${baseUrl}${path}`;
    });

    // Helper conditionnel
    Handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      return arg1 === arg2 ? options.fn(this) : options.inverse(this);
    });
  }

  private registerPartials(): void {
    const partialsDir = path.join(this.templatesDir, 'partials');

    if (fs.existsSync(partialsDir)) {
      const partialFiles = fs.readdirSync(partialsDir).filter(file => file.endsWith('.hbs'));

      for (const file of partialFiles) {
        const name = path.parse(file).name;
        const content = fs.readFileSync(path.join(partialsDir, file), 'utf8');

        Handlebars.registerPartial(name, content);
      }
    }
  }

  render(templateName: string, context: Record<string, unknown>): string {
    const templateFile = path.join(this.templatesDir, `${templateName}.hbs`);
    const layoutFile = path.join(this.templatesDir, 'layouts', 'base.hbs');

    console.log('Looking for template:', templateFile);
    console.log('Template exists:', fs.existsSync(templateFile));

    if (!fs.existsSync(templateFile)) {
      console.log('Available templates:', fs.readdirSync(this.templatesDir));
      throw new Error(`Template not found: ${templateName} at ${templateFile}`);
    }

    // Compiler le template principal
    const templateContent = fs.readFileSync(templateFile, 'utf8');
    const template = Handlebars.compile(templateContent);
    const body = template(context);

    // Appliquer le layout si il existe
    if (fs.existsSync(layoutFile)) {
      const layoutContent = fs.readFileSync(layoutFile, 'utf8');
      const layout = Handlebars.compile(layoutContent);

      return layout({ body, ...context });
    }

    return body;
  }

  renderTemplate(
    templateName: string,
    context: Record<string, unknown>,
  ): { html: string; text: string } {
    // Rendu HTML
    const html = this.render(templateName, context);

    // Version texte simple (supprime les balises HTML)
    const text = html
      .replace(/<[^>]*>/g, '') // Supprime les balises HTML
      .replace(/\s+/g, ' ') // Remplace les espaces multiples par un seul
      .trim();

    return { html, text };
  }
}
