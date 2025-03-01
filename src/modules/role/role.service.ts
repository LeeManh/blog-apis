import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { RoleRepository } from './role.repository';

@Injectable()
export class RoleService {
  private cache = new Map<string, Role>();

  constructor(private readonly roleRepository: RoleRepository) {}

  async getRoleByRoleName(roleName: string) {
    if (this.cache.has(roleName)) {
      return this.cache.get(roleName) as Role;
    }

    const role = await this.roleRepository.findOneOrThrow(
      {
        where: { name: roleName },
      },
      `Role ${roleName} not found`,
    );

    this.cache.set(roleName, role as unknown as Role);
    return role;
  }

  async getRoleById(roleId: number) {
    if (this.cache.has(roleId.toString())) {
      return this.cache.get(roleId.toString()) as Role;
    }

    const role = await this.roleRepository.findOneOrThrow(
      {
        where: { id: roleId },
      },
      `Role with id ${roleId} not found`,
    );

    this.cache.set(roleId.toString(), role as unknown as Role);
    return role;
  }
}
