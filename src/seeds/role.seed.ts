import { PrismaClient } from '@prisma/client';
import { ROLE_NAMES } from '../modules/role/types/role.type';

const prisma = new PrismaClient();

async function seedRole() {
  const roles = Object.values(ROLE_NAMES);

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role },
      update: {},
      create: {
        name: role,
      },
    });
  }

  console.log('🌱 Roles seeded successfully!');
}

export default seedRole;
