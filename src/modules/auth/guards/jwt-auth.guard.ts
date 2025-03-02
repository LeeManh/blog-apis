import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator';
import { TokenService } from 'src/modules/token/token.service';
import { JWTDecodedToken } from 'src/modules/token/types/token.type';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private readonly tokenService: TokenService,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (isPublic) {
      if (authHeader) {
        try {
          const token = authHeader.split(' ')[1];
          const decodedToken = this.tokenService.verifyAccessToken(token);
          request.user = decodedToken;
        } catch {
          request.user = null;
        }
      }

      return true;
    }

    return super.canActivate(context);
  }

  handleRequest<TUser = JWTDecodedToken>(err: any, user: TUser): TUser {
    if (err || !user) {
      if (!user) {
        throw new UnauthorizedException('Token expired or invalid');
      }

      throw new UnauthorizedException('Missing or invalid token');
    }

    return user;
  }
}
