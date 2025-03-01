import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { RoleModule } from 'src/modules/role/role.module';
import { UserRepository } from './user.repository';
import { PrismaClient } from '@prisma/client';

@Module({
  imports: [RoleModule],
  providers: [UserService, UserRepository, PrismaClient],
  exports: [UserService],
})
export class UserModule {}
