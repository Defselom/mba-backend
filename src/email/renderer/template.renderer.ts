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
    Handlebars.registerHelper('formatDate', (date: Date | string, format?: string) => {
      // Convertir la date si c'est une string
      let dateObj: Date;

      if (typeof date === 'string') {
        dateObj = new Date(date);
      } else if (date instanceof Date) {
        dateObj = date;
      } else {
        // if date is invalid, use current date
        dateObj = new Date();
      }

      // check if date is valid
      if (isNaN(dateObj.getTime())) {
        dateObj = new Date(); // use current date if invalid
      }

      // if a specific format is provided, handle it
      if (format) {
        // Mapping simple formats
        if (format.includes('DD/MM/YYYY à HH:mm')) {
          return new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }).format(dateObj);
        }

        if (format.includes('DD/MM/YYYY')) {
          return new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }).format(dateObj);
        }
      }

      // Default format
      return new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(dateObj);
    });

    // Helper to create a new date
    Handlebars.registerHelper('now', () => {
      return new Date();
    });

    // Helper to format the current date
    Handlebars.registerHelper('formatNow', () => {
      return new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date());
    });

    // Helper for current year
    Handlebars.registerHelper('currentYear', () => {
      return new Date().getFullYear();
    });

    // Helper for URLs
    Handlebars.registerHelper('url', (path: string) => {
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

      return `${baseUrl}${path}`;
    });

    // Helper to compare two values
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

    // Compile the main template
    const templateContent = fs.readFileSync(templateFile, 'utf8');
    const template = Handlebars.compile(templateContent);
    const body = template(context);

    // Apply the layout if it exists
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
    // Render HTML
    const html = this.render(templateName, context);

    // Simple text version (strip HTML tags)
    const text = html
      .replace(/<[^>]*>/g, '') // Strip HTML tags
      .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
      .trim();

    return { html, text };
  }
}
