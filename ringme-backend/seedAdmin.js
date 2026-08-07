const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@notifyme.com';
  const password = await argon2.hash('admin123');

  const existingAdmin = await prisma.user.findUnique({ where: { email } });
  
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: 'Master',
        lastName: 'Admin',
        email,
        password,
        role: 'MASTER_ADMIN'
      }
    });
    console.log('Master Admin created: admin@notifyme.com / admin123');
  } else {
    // Force role and password update just in case
    await prisma.user.update({
        where: { email },
        data: {
            role: 'MASTER_ADMIN',
            password
        }
    });
    console.log('Master Admin updated: admin@notifyme.com / admin123');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
