import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Admin@1234', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'emamur@orbit.io' },
    update: {},
    create: {
      name: 'Emamur Rashid',
      email: 'emamur@orbit.io',
      passwordHash,
      role: 'ADMIN',
      workspace: 'Orbit Workspace',
      monthlyGoal: 34000,
    },
  });

  const products = [
    {
      name: 'Orbit Starter SaaS',
      slug: 'orbit-starter-saas',
      sku: 'ORB-STR-01',
      description: 'Essential analytics and team workspace for early-stage startups.',
      category: 'Subscription',
      price: 2900,
      currency: 'BDT',
      billingInterval: 'MONTHLY' as const,
      stock: 999,
      status: 'ACTIVE' as const,
      features: ['Up to 5 Team Members', '10GB Storage', 'Email Support'],
      createdById: admin.id,
    },
    {
      name: 'Orbit Pro Growth',
      slug: 'orbit-pro-growth',
      sku: 'ORB-PRO-02',
      description: 'Advanced automation, API access, and custom billing pipelines.',
      category: 'Subscription',
      price: 7900,
      currency: 'BDT',
      billingInterval: 'MONTHLY' as const,
      stock: 999,
      status: 'ACTIVE' as const,
      features: ['Unlimited Projects', 'Full REST API Access', 'Priority Support'],
      createdById: admin.id,
    },
    {
      name: 'Orbit Enterprise Suite',
      slug: 'orbit-enterprise-suite',
      sku: 'ORB-ENT-03',
      description: 'Dedicated infrastructure, SLA guarantees, and custom SSLCommerz webhooks.',
      category: 'Enterprise',
      price: 19900,
      currency: 'BDT',
      billingInterval: 'YEARLY' as const,
      stock: 250,
      status: 'ACTIVE' as const,
      features: ['Dedicated DB Cluster', '99.99% Uptime SLA', '24/7 Account Manager'],
      createdById: admin.id,
    },
  ];

  const createdProducts = [];
  for (const p of products) {
    const prod = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
    createdProducts.push(prod);
  }

  const customersData = [
    {
      name: 'Tanvir Ahmed',
      email: 'tanvir@dhakatech.com',
      phone: '+8801711000111',
      company: 'DhakaTech Ltd',
      address: 'Banani, Road 11',
      city: 'Dhaka',
      country: 'Bangladesh',
      totalSpent: 15800,
      ordersCount: 2,
    },
    {
      name: 'Nusrat Jahan',
      email: 'nusrat@ctgcloud.io',
      phone: '+8801812000222',
      company: 'CTG Cloud Systems',
      address: 'Agrabad C/A',
      city: 'Chattogram',
      country: 'Bangladesh',
      totalSpent: 19900,
      ordersCount: 1,
    },
    {
      name: 'Rafiqul Islam',
      email: 'rafiq@nexgenbd.com',
      phone: '+8801913000333',
      company: 'NexGen Digital',
      address: 'Dhanmondi 27',
      city: 'Dhaka',
      country: 'Bangladesh',
      totalSpent: 2900,
      ordersCount: 1,
    },
  ];

  const createdCustomers = [];
  for (const c of customersData) {
    const cust = await prisma.customer.upsert({
      where: { email: c.email },
      update: {},
      create: c,
    });
    createdCustomers.push(cust);
  }

  const existingOrders = await prisma.order.count();
  if (existingOrders === 0) {
    await prisma.order.create({
      data: {
        orderNumber: 'ORD-2026-1001',
        tranId: 'ORB_TXN_SEED_1001',
        customerId: createdCustomers[0].id,
        subtotal: 7900,
        tax: 0,
        totalAmount: 7900,
        currency: 'BDT',
        status: 'COMPLETED',
        paymentStatus: 'PAID',
        paymentMethod: 'SSLCOMMERZ',
        valId: 'VAL_SEED_99812',
        bankTranId: 'BANK_SEED_7712',
        cardType: 'VISA-Dutch Bangla',
        paidAt: new Date(),
        items: {
          create: [
            {
              productId: createdProducts[1].id,
              productName: createdProducts[1].name,
              quantity: 1,
              unitPrice: 7900,
              totalPrice: 7900,
            },
          ],
        },
      },
    });

    await prisma.order.create({
      data: {
        orderNumber: 'ORD-2026-1002',
        tranId: 'ORB_TXN_SEED_1002',
        customerId: createdCustomers[1].id,
        subtotal: 19900,
        tax: 0,
        totalAmount: 19900,
        currency: 'BDT',
        status: 'COMPLETED',
        paymentStatus: 'PAID',
        paymentMethod: 'SSLCOMMERZ',
        valId: 'VAL_SEED_99813',
        bankTranId: 'BANK_SEED_7713',
        cardType: 'BKASH-BKash',
        paidAt: new Date(),
        items: {
          create: [
            {
              productId: createdProducts[2].id,
              productName: createdProducts[2].name,
              quantity: 1,
              unitPrice: 19900,
              totalPrice: 19900,
            },
          ],
        },
      },
    });
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
