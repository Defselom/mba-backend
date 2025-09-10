import type { User } from '@/../generated/prisma';

export class JwtPayload {
  sub: string;
  username: string;
  email: string;
  iat?: number;
  exp?: number;
}
export type LoggedInUser = Omit<User, 'password'> & {
  iat?: number;
  exp?: number;
};
