const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    let basicPlan = await prisma.subscriptionPlan.findUnique({ where: { name: 'Basic' } });
    
    if (!basicPlan) {
        basicPlan = await prisma.subscriptionPlan.create({
            data: {
                name: 'Basic',
                price: 0,
                maxQrCodes: 1,
                benefits: JSON.stringify(['1 QR Code Allowed', 'Basic Support']),
                isActive: true
            }
        });
        console.log('Basic Plan Seeded:', basicPlan);
    } else {
        console.log('Basic Plan already exists.');
    }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
