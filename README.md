# MBA Backend - Legal Education Platform

## 📖 Project Overview

MBA Backend is a comprehensive **legal education webinar platform** built with modern technologies. The platform enables users to participate in legal education sessions, manage webinars, access legal documents, and collaborate through a structured role-based system.

### Key Concepts

- **Educational Platform**: Focused on legal education and professional development
- **Webinar Management**: Complete lifecycle management of legal webinars with scheduling, registration, and content delivery
- **Role-Based Access**: Multi-tier user system (Admin, Speaker, Moderator, Collaborator, Participant, Partner)
- **Document Library**: Legal document management and sharing system
- **Support System**: Personalized legal consultation and support services
- **Partner Network**: Integration with legal professionals and institutions

## 🏗️ Technology Stack

### Backend Framework

- **NestJS** - Modern Node.js framework with TypeScript
- **TypeScript** - Type-safe development
- **Node.js** - Runtime environment

### Database & ORM

- **PostgreSQL** - Primary database
- **Prisma** - Modern database toolkit and ORM
- **Docker** - Database containerization

### Authentication & Security

- **JWT (JSON Web Tokens)** - Authentication system
- **Passport.js** - Authentication middleware
- **bcryptjs** - Password hashing
- **Helmet** - Security headers
- **Cookie Parser** - Cookie handling

### File Management

- **AWS S3** - File storage and management
- **Multer** - File upload handling
- **Multer S3** - Direct S3 integration

### API & Documentation

- **Swagger/OpenAPI** - API documentation
- **REST API** - RESTful architecture
- **Class Validator** - Input validation
- **Class Transformer** - Data transformation

### Communication

- **Mailgun** - Email service integration
- **Handlebars** - Email templating

### Development & Testing

- **Jest** - Testing framework
- **Pactum** - E2E API testing
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **PNPM** - Package manager

### DevOps & Monitoring

- **Docker Compose** - Multi-container deployment
- **Cache Manager** - Response caching
- **CORS** - Cross-origin resource sharing

## 🚀 Quick Start

### Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **PNPM** (recommended package manager)
- **Docker** & **Docker Compose**
- **PostgreSQL** (or use Docker container)

### Environment Setup

1. **Clone the repository**

```bash
git clone <repository-url>
cd mba-backend
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Environment Configuration**
   Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://appuser:apppass@localhost:5432/appdb"
TEST_DATABASE_URL="postgresql://testuser:testpass@localhost:55432/testdb"

# App Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=your-aws-region
AWS_S3_BUCKET=your-s3-bucket-name

# Email Configuration (Mailgun)
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=your-mailgun-domain
FROM_EMAIL=noreply@yourdomain.com

# Database Docker Configuration
DB_NAME=appdb
DB_USER=appuser
DB_PASSWORD=apppass
PROD_DB_PORT=5432

TEST_DB_NAME=testdb
TEST_DB_USER=testuser
TEST_DB_PASSWORD=testpass
TEST_DB_PORT=55432
```

4. **Database Setup**

```bash
# Start PostgreSQL containers
pnpm db:dev:up

# Run database migrations
pnpm prisma:dev:deploy

# Seed the database with initial data
pnpm prisma:seed:dev
```

### Running the Application

#### Development Mode

```bash
# Start the development server with hot reload
pnpm start:dev

# Start with debug mode
pnpm start:debug
```

#### Production Mode

```bash
# Build the application
pnpm build

# Start production server
pnpm start:prod
```

### API Documentation

Once the server is running, access the interactive API documentation:

- **Swagger UI**: `http://localhost:3000/api`

### Database Management

```bash
# View database in Prisma Studio
pnpm prisma:studio

# Reset database (development only)
pnpm db:dev:reset

# Run migrations
pnpm prisma:dev:deploy
```

## 📋 Available Scripts

### Development

```bash
pnpm start:dev          # Start development server
pnpm start:debug        # Start with debugging
pnpm build              # Build for production
pnpm start:prod         # Start production server
```

### Database Management

```bash
pnpm db:dev:up          # Start development database
pnpm db:dev:restart     # Restart and migrate database
pnpm db:dev:reset       # Reset database with seed data
pnpm prisma:studio      # Open Prisma Studio
pnpm prisma:seed        # Seed database
```

### Testing

```bash
pnpm test               # Run unit tests
pnpm test:watch         # Run tests in watch mode
pnpm test:cov           # Run tests with coverage
pnpm test:e2e           # Run end-to-end tests
pnpm test:service       # Run service tests only
pnpm test:controller    # Run controller tests only
```

### Code Quality

```bash
pnpm lint               # Run ESLint
pnpm format             # Format code with Prettier
```

## 🏛️ Architecture Overview

### Core Modules

- **Auth Module** - Authentication and authorization
- **User Module** - User management and profiles
- **Webinar Module** - Webinar lifecycle management
- **Document Module** - Legal document management
- **Support Module** - User support and file management
- **Testimonial Module** - User feedback system
- **Partner Applications Module** - Partnership management
- **Email Module** - Email communication system
- **Upload Module** - File upload and storage

### Database Schema

The platform uses a comprehensive PostgreSQL schema with the following key entities:

- **Users & Profiles** - Multi-role user system
- **Webinars** - Event management and scheduling
- **Documents** - Legal document library
- **Registrations** - Webinar attendance tracking
- **Testimonials** - User feedback and ratings
- **Support** - File and resource management
- **Sessions** - User session management

### API Endpoints

The API follows RESTful conventions with the following main endpoints:

- `POST /api/v1/auth/*` - Authentication endpoints
- `GET|POST|PUT|DELETE /api/v1/users/*` - User management
- `GET|POST|PUT|DELETE /api/v1/webinars/*` - Webinar operations
- `GET|POST /api/v1/documents/*` - Document access
- `GET|POST /api/v1/testimonials/*` - Feedback management

## 🔐 Authentication & Authorization

The platform implements a JWT-based authentication system with role-based access control:

### User Roles

- **ADMIN** - Full system access
- **SPEAKER** - Webinar presentation capabilities
- **MODERATOR** - Webinar moderation features
- **COLLABORATOR** - Content collaboration
- **PARTICIPANT** - Basic participation rights
- **PARTNER** - Partnership-specific access

### Security Features

- JWT token authentication
- Password hashing with bcrypt
- Session management
- CORS protection
- Security headers with Helmet
- Input validation and sanitization

## 🧪 Testing

The project includes comprehensive testing:

- **Unit Tests** - Individual component testing
- **Integration Tests** - Service integration testing
- **E2E Tests** - Complete workflow testing
- **Test Coverage** - Code coverage reporting

## 📁 Project Structure

```
src/
├── auth/                 # Authentication module
├── user/                 # User management
├── webinaire/           # Webinar management
├── document/            # Document handling
├── support/             # Support system
├── testimonial/         # Testimonials
├── partner-applications/# Partnership management
├── email/               # Email services
├── upload/              # File upload
├── prisma/              # Database service
├── shared/              # Shared utilities
└── decorator/           # Custom decorators

prisma/
├── schema.prisma        # Database schema
└── seed.ts              # Database seeding

test/
├── app.e2e-spec.ts      # Application E2E tests
└── webinar.e2e-spec.ts  # Webinar E2E tests
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the UNLICENSED License - see the package.json file for details.

## 👨‍💻 Author

**Defselom** - [GitHub Profile](https://github.com/defselom)

---

For more information about specific modules or API endpoints, please refer to the [API Documentation](http://localhost:3000/api) when the server is running.

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
pnpm install -g @nestjs/mau
mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).
