import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permission.decorator';
import { JWTDecodedToken } from 'src/modules/token/types/token.type';
import { UserService } from 'src/modules/user/user.service';
import { Permission } from '@prisma/client';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permission = this.reflector.get<{ resource: string; action: string }>(
      PERMISSIONS_KEY,
      context.getHandler(),
    );

    if (!permission) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user as JWTDecodedToken;

    const userPermissions = (await this.userService.getPermissionsByUserId(
      user.userId,
    )) as Permission[];

    const isHavePermission = userPermissions?.some(
      (up) =>
        up.resource === permission.resource && up.action === permission.action,
    );

    if (!isHavePermission)
      throw new ForbiddenException('You do not have permission');

    return true;
  }
}
