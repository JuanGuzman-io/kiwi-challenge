import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create test user
  const user = await prisma.user.upsert({
    where: { email: 'test@rewards.com' },
    update: {},
    create: {
      id: 'test-user-001',
      email: 'test@rewards.com',
      name: 'Test User',
    },
  });

  console.log(`✓ Created user: ${user.email}`);

  // Create test bank accounts
  await prisma.bankAccount.upsert({
    where: { id: 'bank-account-001' },
    update: {},
    create: {
      id: 'bank-account-001',
      userId: user.id,
      accountNumber: '1234567890',
      lastFourDigits: '7890',
      accountType: 'Checking',
    },
  });

  await prisma.bankAccount.upsert({
    where: { id: 'bank-account-002' },
    update: {},
    create: {
      id: 'bank-account-002',
      userId: user.id,
      accountNumber: '0987654321',
      lastFourDigits: '4321',
      accountType: 'Savings',
    },
  });

  console.log('✓ Created 2 bank accounts');

  // Create test transactions
  const transactionCount = await prisma.rewardTransaction.count({
    where: { userId: user.id },
  });

  if (transactionCount === 0) {
    await prisma.rewardTransaction.createMany({
      data: [
        {
          userId: user.id,
          type: 'CASHBACK',
          amount: 25.50,
          description: 'Cashback from purchase at Store A',
        },
        {
          userId: user.id,
          type: 'REFERRAL_BONUS',
          amount: 10.00,
          description: 'Referral bonus for friend signup',
        },
        {
          userId: user.id,
          type: 'CASHBACK',
          amount: 15.75,
          description: 'Cashback from purchase at Store B',
        },
      ],
    });

    console.log('✓ Created 3 test transactions');
  } else {
    console.log(`✓ Transactions already exist (${transactionCount} total)`);
  }

  // Calculate and display balance
  const balance = await prisma.rewardTransaction.aggregate({
    where: { userId: user.id },
    _sum: { amount: true },
  });

  console.log('\n✅ Seed data created successfully');
  console.log(`💰 Test user balance: $${balance._sum.amount?.toFixed(2) || '0.00'}`);
  console.log(`👤 Test user ID: ${user.id}`);
  console.log(`📧 Test user email: ${user.email}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
