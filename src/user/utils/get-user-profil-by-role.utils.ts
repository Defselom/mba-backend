import { UserRole } from '@/../generated/prisma';

/**
 * Returns the Prisma model name for a given user role.
 * @param role UserRole
 * @returns Prisma profile model name as a string
 */
export function getProfileModelByRole(role: UserRole): string {
  switch (role) {
    case UserRole.ADMIN:
      return 'adminProfile';
    case UserRole.SPEAKER:
      return 'speakerProfile';
    case UserRole.MODERATOR:
      return 'moderatorProfile';
    case UserRole.COLLABORATOR:
      return 'collaboratorProfile';
    case UserRole.PARTICIPANT:
      return 'participantProfile';
    case UserRole.PARTNER:
      return 'partnerProfile';

    default:
      return 'unknownProfile';
  }
}
