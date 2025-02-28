import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoleService {
  private cache = new Map<string, Role>();

  constructor(private readonly prismaService: PrismaService) {}

  async getRoleByRoleName(roleName: string): Promise<Role> {
    if (this.cache.has(roleName)) {
      return this.cache.get(roleName) as Role;
    }

    const role = await this.prismaService.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      throw new NotFoundException(`Role ${roleName} not found`);
    }

    this.cache.set(roleName, role);
    return role;
  }
}
