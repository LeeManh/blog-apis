import { PrismaClient } from '@prisma/client';
import { USER_ROLES } from '../modules/role/constant/role.constant';
import * as dotenv from 'dotenv';
import { PERMISSIONS } from '../modules/auth/constants/permissions.constant';
dotenv.config();

const prisma = new PrismaClient();

const permissions = [
  PERMISSIONS.POST.CREATE,
  PERMISSIONS.POST.READ,
  PERMISSIONS.POST.UPDATE,
  PERMISSIONS.POST.DELETE,
];

async function seedPermissions() {
  console.log('🌱 Seeding Permissions...');

  // Tạo Permission
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: {
        action_resource: {
          action: permission.action,
          resource: permission.resource,
        },
      },
      update: {},
      create: permission,
    });
  }

  // Assign Permissions to Roles
  const adminPermissions = permissions.map((p) => ({
    action: p.action,
    resource: p.resource,
  }));
  const userPermissions = permissions.filter((p) => p.action === 'read');
  const guestPermissions = permissions.filter((p) => p.action === 'read');

  const roles = [
    { roleId: USER_ROLES.ADMIN, permissions: adminPermissions },
    { roleId: USER_ROLES.USER, permissions: userPermissions },
    { roleId: USER_ROLES.GUEST, permissions: guestPermissions },
  ];

  for (const { roleId, permissions } of roles) {
    for (const permission of permissions) {
      const foundPermission = await prisma.permission.findUnique({
        where: {
          action_resource: {
            action: permission.action,
            resource: permission.resource,
          },
        },
      });

      if (foundPermission) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: roleId,
              permissionId: foundPermission.id,
            },
          },
          update: {},
          create: {
            roleId: roleId,
            permissionId: foundPermission.id,
          },
        });
      }
    }
  }

  console.log('✅ Permissions seeded successfully!');
}

export default seedPermissions;
