import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Repository } from 'src/common/base/base.repository';

@Injectable()
export class RoleRepository extends Repository<'Role'> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'role');
  }
}
