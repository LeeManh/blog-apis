import { PrismaClient } from '@prisma/client';
import { NAME_ROLES, USER_ROLES } from '../modules/role/constant/role.constant';

const prisma = new PrismaClient();

async function seedRole() {
  const roles = Object.keys(USER_ROLES).filter((key) => isNaN(Number(key)));

  for (const role of roles) {
    const id = USER_ROLES[role as keyof typeof USER_ROLES];
    const name = NAME_ROLES[role as keyof typeof NAME_ROLES];

    if (name) {
      await prisma.role.upsert({
        where: { id },
        update: {},
        create: {
          id,
          name,
        },
      });
    }
  }

  console.log('🌱 Roles seeded successfully!');
}

export default seedRole;
