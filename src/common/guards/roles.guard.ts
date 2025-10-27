import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) return true; // no roles required

    const request = context.switchToHttp().getRequest();
    const user = request.user; // comes from JWT payload

    // console.log('Allowed roles:', roles, 'User role:', user.role);
    // console.log(user);

    if (!roles.includes(user.role)) {
      throw new ForbiddenException(
        `You do not have permission to perform this action`,
      );
    }

    return true;
  }
}
