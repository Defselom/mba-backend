import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { UserRole } from '@/../generated/prisma';
import { LoggedInUser } from '@/auth/dto';

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

    if (!requiredRoles.includes(user.role)) {
      // Lève une ForbiddenException si le rôle n'est pas suffisant
      throw new ForbiddenException(
        `Access denied: You need one of these roles: [${requiredRoles.join(', ')}]`,
      );
    }

    return true;
  }
}
