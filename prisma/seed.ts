import * as bcrypt from 'bcryptjs';

import { PrismaClient } from '../generated/prisma';
import {
  UserRole,
  UserStatus,
  WebinarStatus,
  DocumentType,
  PersonalizedSupportType,
  SupportType,
  ModerationStatus,
  RegistrationStatus,
  ApplicationStatus,
  UserAccount,
  Tag,
  Webinar,
  Document,
  Support,
  Registration,
  Testimonial,
  PersonalizedSupport,
  PartnerApplication,
} from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clean existing data (respecting relations order)
    await cleanDatabase();

    // Create users and their profiles
    const users = await seedUsers();

    console.log(`✅ Created ${users.length} users`);

    // Create tags
    const tags = await seedTags();

    console.log(`✅ Created ${tags.length} tags`);

    // Create webinars
    const webinars = await seedWebinars(users, tags);

    console.log(`✅ Created ${webinars.length} webinars`);

    // Create documents
    const documents = await seedDocuments();

    console.log(`✅ Created ${documents.length} documents`);

    // Create training materials
    const supports = await seedSupports(users, webinars);

    console.log(`✅ Created ${supports.length} supports`);

    // Create webinar registrations
    const registrations = await seedRegistrations(users, webinars);

    console.log(`✅ Created ${registrations.length} registrations`);

    // Create testimonials
    const testimonials = await seedTestimonials(users, webinars);

    console.log(`✅ Created ${testimonials.length} testimonials`);

    // Create personalized support requests
    const personalizedSupports = await seedPersonalizedSupports(users);

    console.log(`✅ Created ${personalizedSupports.length} personalized supports`);

    // Create partner applications
    const partnerApplications = await seedPartnerApplications();

    console.log(`✅ Created ${partnerApplications.length} partner applications`);

    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

async function cleanDatabase() {
  console.log('🧹 Cleaning database...');

  // Delete in reverse order of dependencies
  await prisma.testimonial.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.support.deleteMany();
  await prisma.personalizedSupport.deleteMany();
  await prisma.partnerApplication.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.session.deleteMany();

  // Remove many-to-many relations
  await prisma.webinar.updateMany({
    data: {
      animatedById: null,
      moderatedById: null,
    },
  });

  await prisma.webinar.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.document.deleteMany();

  // Delete profiles
  await prisma.adminProfile.deleteMany();
  await prisma.speakerProfile.deleteMany();
  await prisma.moderatorProfile.deleteMany();
  await prisma.collaboratorProfile.deleteMany();
  await prisma.participantProfile.deleteMany();

  // Delete users
  await prisma.userAccount.deleteMany();
}

async function seedUsers(): Promise<UserAccount[]> {
  const hashedPassword = await bcrypt.hash('password123', 10);

  const usersData = [
    // Admin
    {
      username: 'admin',
      email: 'admin@mba.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Main',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      phone: '+33123456789',
    },

    // Speakers
    {
      username: 'dr_martin',
      email: 'martin.dupuis@mba.com',
      password: hashedPassword,
      firstName: 'Martin',
      lastName: 'Dupuis',
      role: UserRole.SPEAKER,
      status: UserStatus.ACTIVE,
      phone: '+33123456790',
      birthDate: new Date('1975-03-15'),
    },
    {
      username: 'prof_sophie',
      email: 'sophie.bernard@mba.com',
      password: hashedPassword,
      firstName: 'Sophie',
      lastName: 'Bernard',
      role: UserRole.SPEAKER,
      status: UserStatus.ACTIVE,
      phone: '+33123456791',
      birthDate: new Date('1980-07-22'),
    },

    // Moderators
    {
      username: 'mod_pierre',
      email: 'pierre.moreau@mba.com',
      password: hashedPassword,
      firstName: 'Pierre',
      lastName: 'Moreau',
      role: UserRole.MODERATOR,
      status: UserStatus.ACTIVE,
      phone: '+33123456792',
      birthDate: new Date('1985-11-10'),
    },

    // Collaborators
    {
      username: 'collab_marie',
      email: 'marie.rousseau@mba.com',
      password: hashedPassword,
      firstName: 'Marie',
      lastName: 'Rousseau',
      role: UserRole.COLLABORATOR,
      status: UserStatus.ACTIVE,
      phone: '+33123456793',
      birthDate: new Date('1990-05-18'),
    },

    // Participants
    {
      username: 'part_jean',
      email: 'jean.martin@example.com',
      password: hashedPassword,
      firstName: 'Jean',
      lastName: 'Martin',
      role: UserRole.PARTICIPANT,
      status: UserStatus.ACTIVE,
      phone: '+33123456794',
      birthDate: new Date('1992-09-03'),
    },
    {
      username: 'part_claire',
      email: 'claire.dubois@example.com',
      password: hashedPassword,
      firstName: 'Claire',
      lastName: 'Dubois',
      role: UserRole.PARTICIPANT,
      status: UserStatus.ACTIVE,
      phone: '+33123456795',
      birthDate: new Date('1988-12-25'),
    },

    // Partners
    {
      username: 'partner_law',
      email: 'contact@lawfirm.com',
      password: hashedPassword,
      firstName: 'Laurent',
      lastName: 'Legrand',
      role: UserRole.PARTNER,
      status: UserStatus.ACTIVE,
      phone: '+33123456796',
    },
  ];

  const users: UserAccount[] = [];

  for (const userData of usersData) {
    const user = await prisma.userAccount.create({
      data: userData,
    });

    // Create specific profiles based on role
    await createUserProfiles(user);
    users.push(user);
  }

  return users;
}

async function createUserProfiles(user: UserAccount) {
  switch (user.role) {
    case UserRole.ADMIN:
      await prisma.adminProfile.create({
        data: {
          userId: user.id,
          adminRights: JSON.stringify(['manage_users', 'manage_webinars', 'manage_documents']),
        },
      });
      break;

    case UserRole.SPEAKER:
      await prisma.speakerProfile.create({
        data: {
          userId: user.id,
          academicLevel: 'PhD in Law',
          currentPosition: 'Law Professor',
          motivation: 'Share my legal knowledge with students and professionals',
          legalDomains: JSON.stringify(['Business Law', 'Banking Law', 'Commercial Law']),
          biography: 'Business law expert with over 15 years of experience',
          scheduleConstraints: 'Available Tuesday and Thursday afternoons',
          animationExperience: 'Over 50 conferences hosted',
        },
      });
      break;

    case UserRole.MODERATOR:
      await prisma.moderatorProfile.create({
        data: {
          userId: user.id,
          currentJob: 'Senior Lawyer',
          academicLevel: 'Master in Law',
          moderationExperience: 'Conference moderation for 5 years',
          coordinationAvailability: 'Flexible, available on demand',
          biography: 'Lawyer specialized in legal debate moderation',
          comfortDomains: JSON.stringify(['Civil Law', 'Criminal Law', 'Administrative Law']),
        },
      });
      break;

    case UserRole.COLLABORATOR:
      await prisma.collaboratorProfile.create({
        data: {
          userId: user.id,
          academicLevel: 'Master in Law',
          currentStatus: 'Corporate Legal Counsel',
          collaborationType: 'Technical and logistical support',
          motivations: 'Contribute to legal education development',
          otherCommitments: 'Volunteer work in legal association',
        },
      });
      break;

    case UserRole.PARTICIPANT:
      await prisma.participantProfile.create({
        data: {
          userId: user.id,
          academicLevel: 'Bachelor in Law',
          discoveryChannel: 'Social media',
          participationMotivation: 'Deepen my legal knowledge',
          otherPlatforms: 'Coursera, edX',
          wishedLegalThemes: JSON.stringify(['Labor Law', 'Family Law', 'Tax Law']),
        },
      });
      break;
  }
}

async function seedTags(): Promise<Tag[]> {
  const tagsData = [
    { name: 'Banking Law', slug: 'banking-law' },
    { name: 'Business Law', slug: 'business-law' },
    { name: 'Commercial Law', slug: 'commercial-law' },
    { name: 'Labor Law', slug: 'labor-law' },
    { name: 'Tax Law', slug: 'tax-law' },
    { name: 'Civil Law', slug: 'civil-law' },
    { name: 'Criminal Law', slug: 'criminal-law' },
    { name: 'Administrative Law', slug: 'administrative-law' },
    { name: 'International Law', slug: 'international-law' },
    { name: 'Family Law', slug: 'family-law' },
  ];

  const tags: Tag[] = [];

  for (const tagData of tagsData) {
    const tag = await prisma.tag.create({
      data: tagData,
    });

    tags.push(tag);
  }

  return tags;
}

async function seedWebinars(users: UserAccount[], tags: Tag[]): Promise<Webinar[]> {
  const speakers = users.filter(u => u.role === UserRole.SPEAKER);
  const moderators = users.filter(u => u.role === UserRole.MODERATOR);
  const collaborators = users.filter(u => u.role === UserRole.COLLABORATOR);

  const webinarsData = [
    {
      title: 'Introduction to Banking Law',
      description: 'A complete introduction to the fundamental principles of modern banking law',
      dateTime: new Date('2025-10-15T14:00:00Z'),
      duration: 120,
      legalTopic: 'Banking Law',
      maxCapacity: 50,
      status: WebinarStatus.SCHEDULED,
      accessLink: 'https://zoom.us/j/123456789',
      animatedById: speakers[0]?.id,
      moderatedById: moderators[0]?.id,
      tagIds: [0, 1], // Tag indices
    },
    {
      title: 'Commercial Contracts in Practice',
      description: 'Analysis of practical and legal aspects of commercial contracts',
      dateTime: new Date('2025-10-20T16:00:00Z'),
      duration: 90,
      legalTopic: 'Commercial Law',
      maxCapacity: 75,
      status: WebinarStatus.SCHEDULED,
      accessLink: 'https://zoom.us/j/987654321',
      animatedById: speakers[1]?.id,
      moderatedById: moderators[0]?.id,
      tagIds: [2, 1],
    },
    {
      title: 'Labor Law: 2025 Updates',
      description: 'Latest developments in labor law and their impact on businesses',
      dateTime: new Date('2025-09-25T10:00:00Z'),
      duration: 180,
      legalTopic: 'Labor Law',
      maxCapacity: 100,
      status: WebinarStatus.COMPLETED,
      animatedById: speakers[0]?.id,
      moderatedById: moderators[0]?.id,
      tagIds: [3],
    },
    {
      title: 'Corporate Taxation',
      description: 'Complete guide to taxation applicable to businesses',
      dateTime: new Date('2025-11-05T15:00:00Z'),
      duration: 150,
      legalTopic: 'Tax Law',
      maxCapacity: 60,
      status: WebinarStatus.SCHEDULED,
      accessLink: 'https://zoom.us/j/555666777',
      animatedById: speakers[1]?.id,
      tagIds: [4],
    },
  ];

  const webinars: Webinar[] = [];

  for (const webinarData of webinarsData) {
    const { tagIds, ...webinarCreateData } = webinarData;

    const webinar = await prisma.webinar.create({
      data: {
        ...webinarCreateData,
        tags: {
          connect: tagIds.map(index => ({ id: tags[index].id })),
        },
        collaborators: {
          connect: collaborators.slice(0, 2).map(c => ({ id: c.id })),
        },
      },
    });

    webinars.push(webinar);
  }

  return webinars;
}

async function seedDocuments(): Promise<Document[]> {
  const documentsData = [
    {
      title: 'Commercial Code 2025',
      type: DocumentType.LAW,
      file: '/documents/commercial-code-2025.pdf',
      publicationDate: new Date('2025-01-01'),
      legalDomain: 'Commercial Law',
      description: 'Updated version of the commercial code',
      sizeBytes: 2048000,
    },
    {
      title: 'Court of Cassation Decision - Banking Contracts',
      type: DocumentType.COURT_DECISION,
      file: '/documents/cassation-banking-decision.pdf',
      publicationDate: new Date('2025-03-15'),
      legalDomain: 'Banking Law',
      description: 'Important case law on banking contracts',
      sizeBytes: 512000,
    },
    {
      title: 'Decree on Remote Work',
      type: DocumentType.DECREE,
      file: '/documents/remote-work-decree.pdf',
      publicationDate: new Date('2025-02-10'),
      legalDomain: 'Labor Law',
      description: 'New rules concerning remote work',
      sizeBytes: 1024000,
    },
    {
      title: 'OHADA Uniform Act - Commercial Companies',
      type: DocumentType.UNIFORM_ACT,
      file: '/documents/ohada-companies.pdf',
      publicationDate: new Date('2024-12-01'),
      legalDomain: 'Business Law',
      description: 'Uniform act relating to commercial company law',
      sizeBytes: 3072000,
    },
  ];

  const documents: Document[] = [];

  for (const documentData of documentsData) {
    const document = await prisma.document.create({
      data: documentData,
    });

    documents.push(document);
  }

  return documents;
}

async function seedSupports(users: UserAccount[], webinars: Webinar[]): Promise<Support[]> {
  const speakers = users.filter(u => u.role === UserRole.SPEAKER);

  const supportsData = [
    {
      title: 'Presentation - Introduction to Banking Law',
      file: '/supports/banking-law-presentation.pdf',
      type: SupportType.PRESENTATION,
      webinarId: webinars[0]?.id,
      uploadedById: speakers[0]?.id,
    },
    {
      title: 'Reference Document - Commercial Contracts',
      file: '/supports/commercial-contracts-reference.pdf',
      type: SupportType.REFERENCE_DOCUMENT,
      webinarId: webinars[1]?.id,
      uploadedById: speakers[1]?.id,
    },
    {
      title: 'Explanatory Video - Labor Law',
      file: '/supports/labor-law-video.mp4',
      type: SupportType.VIDEO,
      webinarId: webinars[2]?.id,
      uploadedById: speakers[0]?.id,
    },
    {
      title: 'Practical Guide - Taxation',
      file: '/supports/taxation-guide.pdf',
      type: SupportType.OTHER,
      webinarId: webinars[3]?.id,
      uploadedById: speakers[1]?.id,
    },
  ];

  const supports: Support[] = [];

  for (const supportData of supportsData) {
    const support = await prisma.support.create({
      data: supportData,
    });

    supports.push(support);
  }

  return supports;
}

async function seedRegistrations(
  users: UserAccount[],
  webinars: Webinar[],
): Promise<Registration[]> {
  const participants = users.filter(u => u.role === UserRole.PARTICIPANT);
  const registrations: Registration[] = [];

  // Create registrations for each participant on multiple webinars
  for (const participant of participants) {
    for (let i = 0; i < Math.min(3, webinars.length); i++) {
      const registration = await prisma.registration.create({
        data: {
          userId: participant.id,
          webinarId: webinars[i].id,
          status: i === 2 ? RegistrationStatus.CANCELED : RegistrationStatus.CONFIRMED,
          registrationDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Within the last 30 days
        },
      });

      registrations.push(registration);
    }
  }

  return registrations;
}

async function seedTestimonials(users: UserAccount[], webinars: Webinar[]): Promise<Testimonial[]> {
  const participants = users.filter(u => u.role === UserRole.PARTICIPANT);

  const testimonialsData = [
    {
      content: 'Excellent webinar! The explanations were clear and precise.',
      status: ModerationStatus.APPROVED,
      rating: 5,
      userId: participants[0]?.id,
      webinarId: webinars[2]?.id, // Completed webinar
    },
    {
      content: 'Very informative, I learned a lot about banking law.',
      status: ModerationStatus.APPROVED,
      rating: 4,
      userId: participants[1]?.id,
      webinarId: webinars[2]?.id,
    },
    {
      content: 'Quality content but a bit dense for a beginner.',
      status: ModerationStatus.PENDING,
      rating: 3,
      userId: participants[0]?.id,
      webinarId: webinars[0]?.id,
    },
  ];

  const testimonials: Testimonial[] = [];

  for (const testimonialData of testimonialsData) {
    const testimonial = await prisma.testimonial.create({
      data: testimonialData,
    });

    testimonials.push(testimonial);
  }

  return testimonials;
}

async function seedPersonalizedSupports(users: UserAccount[]): Promise<PersonalizedSupport[]> {
  const participants = users.filter(u => u.role === UserRole.PARTICIPANT);

  const supportsData = [
    {
      type: PersonalizedSupportType.LEGAL,
      legalDomains: JSON.stringify(['Commercial Law', 'Corporate Law']),
      frequency: 'Weekly',
      scheduleConstraints: 'Preference for afternoons',
      communicationStyle: 'Video conference',
      status: ModerationStatus.PENDING,
      estimatedCost: 150.0,
      userId: participants[0]?.id,
    },
    {
      type: PersonalizedSupportType.SCIENTIFIC,
      legalDomains: JSON.stringify(['Tax Law']),
      frequency: 'Bi-weekly',
      scheduleConstraints: 'Flexible',
      communicationStyle: 'Email and phone',
      status: ModerationStatus.APPROVED,
      estimatedCost: 200.0,
      userId: participants[1]?.id,
    },
  ];

  const personalizedSupports: PersonalizedSupport[] = [];

  for (const supportData of supportsData) {
    const support = await prisma.personalizedSupport.create({
      data: supportData,
    });

    personalizedSupports.push(support);
  }

  return personalizedSupports;
}

async function seedPartnerApplications(): Promise<PartnerApplication[]> {
  const applicationsData = [
    {
      responsibleFirstName: 'Michel',
      responsibleLastName: 'Durand',
      responsibleEmail: 'michel.durand@cabinetjuridique.fr',
      structureName: 'Durand & Associates Law Firm',
      occupiedPosition: 'Partner Lawyer',
      partnershipType: 'Academic partnership',
      providedExpertise: 'Business law and taxation',
      collaborationExperience: '10 years of experience in legal education',
      phone: '+33145678901',
      status: ApplicationStatus.PENDING,
    },
    {
      responsibleFirstName: 'Isabelle',
      responsibleLastName: 'Legrand',
      responsibleEmail: 'i.legrand@etudejuridique.com',
      structureName: 'Legrand Law Office',
      occupiedPosition: 'Notary',
      partnershipType: 'Occasional collaboration',
      providedExpertise: 'Real estate and inheritance law',
      collaborationExperience: 'First collaboration in education',
      phone: '+33156789012',
      status: ApplicationStatus.ACCEPTED,
      adminComment: 'Very interesting profile, complementary expertise',
    },
  ];

  const applications: PartnerApplication[] = [];

  for (const applicationData of applicationsData) {
    const application = await prisma.partnerApplication.create({
      data: applicationData,
    });

    applications.push(application);
  }

  return applications;
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
