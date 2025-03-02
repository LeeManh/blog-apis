import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Repository } from 'src/common/base/base.repository';

@Injectable()
export class PostRepository extends Repository<'Post'> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'post');
  }
}
