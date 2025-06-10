import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Delete existing records
  await prisma.user.deleteMany();

  // Create support agent user
  const supportPassword = await bcrypt.hash('support123', 10);
  await prisma.user.create({
    data: {
      email: 'support@omnisahayak.com',
      password: supportPassword,
      firstName: 'Support',
      lastName: 'Agent',
      role: 'SUPPORT_AGENT',
    },
  });

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      email: 'admin@omnisahayak.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });

  // Create demo customer
  const customerPassword = await bcrypt.hash('customer123', 10);
  await prisma.user.create({
    data: {
      email: 'customer@example.com',
      password: customerPassword,
      firstName: 'Demo',
      lastName: 'Customer',
      role: 'CUSTOMER',
      client: 'Example Corp',
      clientId: 'EXAMPLE001',
    },
  });

  console.log('Database has been seeded. 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 