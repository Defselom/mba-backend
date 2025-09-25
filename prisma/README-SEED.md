# Database Seeding Script - MBA Platform

This document explains how to use the seeding script to populate the database with test data.

## 🎯 Objective

The seeding script automatically generates realistic test data for all MBA application models, including:

- **Users** with different roles (Admin, Speaker, Moderator, Collaborator, Participant, Partner)
- **Specialized profiles** for each user type
- **Webinars** with different statuses and associations
- **Legal documents** of various types
- **Training materials** associated with webinars
- **Webinar registrations**
- **Testimonials** and ratings
- **Personalized support requests**
- **Partner applications**

## 🚀 Usage

### Prerequisites

1. Functional PostgreSQL database
2. Configured environment variables (DATABASE_URL)
3. Applied Prisma migrations

### Available Commands

```bash
# Run seed directly
pnpm prisma:seed

# Run seed via Prisma (recommended)
pnpm prisma:seed:dev

# Complete reset: remove DB + recreate + migrate + seed
pnpm db:dev:reset
```

### Complete Command for Total Reset

```bash
# 1. Stop and remove the database
pnpm db:dev:rm

# 2. Restart the database
pnpm db:dev:up

# 3. Wait for DB to be ready and apply migrations
sleep 3 && pnpm prisma:dev:deploy

# 4. Run seeding
pnpm prisma:seed
```

## 📊 Generated Data

### Created Users

| Username     | Email                       | Role         | Password    |
| ------------ | --------------------------- | ------------ | ----------- |
| admin        | <admin@mba.com>             | ADMIN        | password123 |
| dr_martin    | <martin.dupuis@mba.com>     | SPEAKER      | password123 |
| prof_sophie  | <sophie.bernard@mba.com>    | SPEAKER      | password123 |
| mod_pierre   | <pierre.moreau@mba.com>     | MODERATOR    | password123 |
| collab_marie | <marie.rousseau@mba.com>    | COLLABORATOR | password123 |
| part_jean    | <jean.martin@example.com>   | PARTICIPANT  | password123 |
| part_claire  | <claire.dubois@example.com> | PARTICIPANT  | password123 |
| partner_law  | <contact@lawfirm.com>       | PARTNER      | password123 |

### Created Webinars

1. **Introduction to Banking Law** (Scheduled - 10/15/2025)
2. **Commercial Contracts in Practice** (Scheduled - 10/20/2025)
3. **Labor Law: 2025 Updates** (Completed - 09/25/2025)
4. **Corporate Taxation** (Scheduled - 11/05/2025)

### Legal Documents

- Commercial Code 2025
- Court of Cassation Decision on Banking Contracts
- Decree on Remote Work
- OHADA Uniform Act - Commercial Companies

## 🔧 Script Features

### Automatic Cleanup

The script automatically cleans all existing data before creating new data, respecting the order of foreign key constraints.

### Consistent Relational Data

- Webinars are automatically associated with speakers and moderators
- Registrations are created for participants
- Testimonials are associated with completed webinars
- Materials are linked to appropriate webinars

### Error Handling

The script includes comprehensive error handling and displays detailed progress messages.

## 🐛 Troubleshooting

### Error: "Database connection failed"

- Check that PostgreSQL is started: `pnpm db:dev:up`
- Check the DATABASE_URL environment variable

### Error: "Table does not exist"

- Apply migrations: `pnpm prisma:dev:deploy`
- Or use: `pnpm db:dev:restart`

### Error: "Unique constraint violation"

- The script normally cleans existing data
- If the problem persists, use: `pnpm db:dev:reset`

## 📝 Customization

To customize the seed data, modify the `prisma/seed.ts` file:

- Add or modify users in `seedUsers()`
- Change webinars in `seedWebinars()`
- Adapt documents in `seedDocuments()`

After modification, re-run the seeding with `pnpm prisma:seed`.

## 🔍 Verification

After seeding, you can verify the data with Prisma Studio:

```bash
pnpm prisma:studio
```

Or directly in your application by logging in with one of the generated accounts.
