import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create default agent account
  const passwordHash = await bcrypt.hash('WealthPro2024!', 10);

  const agent = await prisma.agent.upsert({
    where: { email: 'sony@wealthpro.com' },
    update: {},
    create: {
      email: 'sony@wealthpro.com',
      passwordHash,
      firstName: 'Sony',
      lastName: 'Ho',
      phone: '(808) 555-0123',
      licenseNumber: 'WP-001'
    }
  });

  console.log('Created agent:', agent.email);

  // Create a sample prospect for testing
  const prospect = await prisma.prospect.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      firstName: 'John',
      lastName: 'Demo',
      phone: '(808) 555-1234',
      status: 'QUALIFIED',
      financialProfile: {
        create: {
          annualIncome: 85000,
          spouseIncome: 45000,
          monthlyExpenses: 5000,
          housingCost: 2000,
          debtPayments: 800,
          savings: 15000,
          investments: 35000,
          retirement401k: 75000,
          homeEquity: 100000,
          otherAssets: 10000,
          mortgage: 280000,
          carLoans: 18000,
          studentLoans: 25000,
          creditCards: 8000,
          otherDebts: 0,
          age: 38,
          spouseAge: 36,
          dependents: 2,
          retirementAge: 65,
          netWorth: -96000,
          monthlyGap: 833,
          protectionGap: 450000,
          currentLifeInsurance: 100000,
          currentDisability: 0
        }
      }
    }
  });

  console.log('Created demo prospect:', prospect.email);

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
