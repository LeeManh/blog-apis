import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Repository } from 'src/common/base/base.repository';

@Injectable()
export class UserRepository extends Repository<'User'> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'user');
  }
}
