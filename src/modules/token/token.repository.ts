import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Repository } from 'src/common/base/base.repository';
import { TokenType } from './types/token.type';

@Injectable()
export class TokenRepository extends Repository<'Token'> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'token');
  }

  async findValidToken(token: string, tokenType: TokenType) {
    return this.findOne({
      where: { token, type: tokenType, isRevoked: false, isUsed: false },
    });
  }
}
