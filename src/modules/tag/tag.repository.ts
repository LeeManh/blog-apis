import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Repository } from 'src/common/base/base.repository';

@Injectable()
export class TagRepository extends Repository<'Tag'> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'tag');
  }
}
