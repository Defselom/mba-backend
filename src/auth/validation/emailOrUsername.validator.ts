import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

import { RegisterDto } from '@/auth/dto';

@ValidatorConstraint({ name: 'EmailOrUsername', async: false })
export class EmailOrUsernameConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const obj = args.object as RegisterDto;

    return !!(obj.email || obj.username);
  }
  defaultMessage() {
    return 'Either email or username must be provided';
  }
}
