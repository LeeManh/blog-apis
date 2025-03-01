import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Repository } from 'src/common/base/base.repository';

@Injectable()
export class JWTTokenRepository extends Repository<'RefreshToken'> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'refreshToken');
  }
}
