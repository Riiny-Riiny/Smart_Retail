import { PrismaClient, Segment, Status } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();

  // Create products first
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Laptop Pro X1',
        description: 'High-performance laptop with 32GB RAM and 1TB SSD',
        price: 1499.99,
        stock: 50,
        category: 'Electronics',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Wireless Earbuds Pro',
        description: 'Premium wireless earbuds with active noise cancellation',
        price: 249.99,
        stock: 100,
        category: 'Electronics',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Smart Watch Elite',
        description: 'Advanced fitness and health tracking smartwatch',
        price: 399.99,
        stock: 75,
        category: 'Electronics',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Phone 15 Pro',
        description: 'Latest smartphone with advanced camera system',
        price: 999.99,
        stock: 60,
        category: 'Electronics',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Tablet Air',
        description: '10.9-inch tablet with latest processor',
        price: 599.99,
        stock: 40,
        category: 'Electronics',
      },
    }),
  ]);

  // Create customers with orders
  const customerData = [
    {
      name: 'John Smith',
      email: 'john.smith@example.com',
      segment: Segment.VIP,
      orders: [
        {
          products: [
            { productId: products[0].id, quantity: 1, price: products[0].price },
            { productId: products[1].id, quantity: 2, price: products[1].price },
          ],
          date: new Date('2024-03-15T10:00:00Z'),
          status: Status.Completed,
        },
        {
          products: [
            { productId: products[3].id, quantity: 1, price: products[3].price },
          ],
          date: new Date('2024-03-01T14:30:00Z'),
          status: Status.Completed,
        },
      ],
    },
    {
      name: 'Emma Wilson',
      email: 'emma.w@example.com',
      segment: Segment.Regular,
      orders: [
        {
          products: [
            { productId: products[1].id, quantity: 1, price: products[1].price },
            { productId: products[2].id, quantity: 1, price: products[2].price },
          ],
          date: new Date('2024-03-10T15:30:00Z'),
          status: Status.Completed,
        },
      ],
    },
    {
      name: 'Michael Brown',
      email: 'm.brown@example.com',
      segment: Segment.New,
      orders: [
        {
          products: [
            { productId: products[1].id, quantity: 1, price: products[1].price },
          ],
          date: new Date('2024-03-18T09:15:00Z'),
          status: Status.Processing,
        },
      ],
    },
    {
      name: 'Sarah Davis',
      email: 'sarah.d@example.com',
      segment: Segment.VIP,
      orders: [
        {
          products: [
            { productId: products[0].id, quantity: 1, price: products[0].price },
            { productId: products[4].id, quantity: 1, price: products[4].price },
          ],
          date: new Date('2024-03-12T14:20:00Z'),
          status: Status.Completed,
        },
        {
          products: [
            { productId: products[3].id, quantity: 1, price: products[3].price },
          ],
          date: new Date('2024-02-28T11:45:00Z'),
          status: Status.Completed,
        },
      ],
    },
    {
      name: 'Lisa Anderson',
      email: 'lisa.a@example.com',
      segment: Segment.Regular,
      orders: [
        {
          products: [
            { productId: products[2].id, quantity: 1, price: products[2].price },
          ],
          date: new Date('2024-03-05T16:20:00Z'),
          status: Status.Completed,
        },
      ],
    },
  ];

  // Create customers and their orders
  for (const customerInfo of customerData) {
    let totalSpent = 0;

    // Calculate total spent
    for (const orderInfo of customerInfo.orders) {
      const orderTotal = orderInfo.products.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      totalSpent += orderTotal;
    }

    // Create customer first
    const customer = await prisma.customer.create({
      data: {
        name: customerInfo.name,
        email: customerInfo.email,
        segment: customerInfo.segment,
        totalSpent: totalSpent,
        orderCount: customerInfo.orders.length,
        lastPurchase: customerInfo.orders[0].date,
      },
    });

    // Create orders for the customer
    for (const orderInfo of customerInfo.orders) {
      await prisma.order.create({
        data: {
          total: orderInfo.products.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          status: orderInfo.status,
          createdAt: orderInfo.date,
          customer: {
            connect: { id: customer.id }
          },
          items: {
            create: orderInfo.products.map(item => ({
              quantity: item.quantity,
              price: item.price,
              productId: item.productId,
            })),
          },
        },
      });
    }
  }

  console.log('Database has been seeded with customers, products, and orders! 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 