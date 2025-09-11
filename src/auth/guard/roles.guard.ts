import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { LoggedInUser } from '@/auth/dto';

import { UserRole } from 'generated/prisma';

export const ROLES_KEY = 'role';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<{ user: LoggedInUser }>();

    // Add null/undefined check
    if (!user) {
      console.log('No user found in request - authentication may have failed');

      return false;
    }

    return requiredRoles.includes(user.role);
  }
}
