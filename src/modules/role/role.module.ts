import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleRepository } from './role.repository';
import { PrismaClient } from '@prisma/client';

@Module({
  providers: [RoleService, RoleRepository, PrismaClient],
  exports: [RoleService],
})
export class RoleModule {}
