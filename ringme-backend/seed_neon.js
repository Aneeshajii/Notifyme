const { neon } = require('@neondatabase/serverless'); 
const sql = neon('postgresql://neondb_owner:npg_E2FwprRN7ldY@ep-gentle-sun-aye2pbu6-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require'); 

async function main() { 
  await sql`
    INSERT INTO "SubscriptionPlan" (id, name, price, "maxQrCodes", benefits, "isActive", "createdAt", "updatedAt") 
    VALUES 
    ('cll123456789', 'Basic', 0, 1, '["1 QR Code Allowed", "Basic Support"]', true, NOW(), NOW()), 
    ('cll123456790', 'Standard', 99, 5, '["5 QR Codes Allowed", "Priority Support", "Custom Tags"]', true, NOW(), NOW()), 
    ('cll123456791', 'Premium', 199, 20, '["20 QR Codes Allowed", "24/7 Support", "Analytics"]', true, NOW(), NOW()) 
    ON CONFLICT DO NOTHING;
  `; 
  console.log('Seeded via HTTP!'); 
} 

main().catch(console.error);
