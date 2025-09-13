import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

import { UserRole } from '@/../generated/prisma';
import { RegisterDto } from '@/auth/dto';

@ValidatorConstraint({ name: 'RoleProfileRegister', async: false })
export class RoleProfileRegisterConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const obj = args.object as RegisterDto;

    if (obj.role === UserRole.ADMIN) {
      return true;
    }

    return !!(obj.participantProfile || obj.speakerProfile || obj.moderatorProfile);
  }
  defaultMessage() {
    return 'Provide at least one profile: participantProfile, speakerProfile, or moderatorProfile.';
  }
}
