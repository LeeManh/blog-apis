import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JWTDecodedToken } from 'src/modules/token/types/token.type';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user: JWTDecodedToken }>();
    return request.user;
  },
);
