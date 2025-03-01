import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/common/decorators/roles.decorator';
import { USER_ROLES } from 'src/modules/role/constant/role.constant';
import { JWTDecodedToken } from 'src/modules/token/types/token.type';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<USER_ROLES[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context
      .switchToHttp()
      .getRequest<{ user: JWTDecodedToken }>();
    const user: JWTDecodedToken = request.user;

    if (!user || !user.roleId) {
      throw new ForbiddenException('You do not have permission');
    }

    const hasRole = requiredRoles.includes(user.roleId);
    if (!hasRole) {
      throw new ForbiddenException('You do not have permission');
    }

    return true;
  }
}
