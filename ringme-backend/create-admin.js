const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@notifyme.com';
  const password = 'password123';
  const hashedPassword = await argon2.hash(password);

  const existingAdmin = await prisma.user.findUnique({ where: { email } });

  if (existingAdmin) {
      await prisma.user.update({
          where: { email },
          data: { role: 'MASTER_ADMIN', password: hashedPassword }
      });
      console.log('Admin user updated!');
  } else {
      await prisma.user.create({
        data: {
          email,
          name: 'Master',
          lastName: 'Admin',
          password: hashedPassword,
          role: 'MASTER_ADMIN'
        }
      });
      console.log('Admin user created!');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
