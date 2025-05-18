import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding the database...');

  // Clean up existing data
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.yogurt.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Deleted existing data');

  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@yogurtshop.com',
        phone: '+1234567890',
        role: 'admin'
      }
    }),
    prisma.user.create({
      data: {
        email: 'customer1@example.com',
        phone: '+1987654321',
        role: 'customer'
      }
    }),
    prisma.user.create({
      data: {
        email: 'customer2@example.com',
        phone: '+1555555555',
        role: 'customer'
      }
    })
  ]);

  console.log(`Created ${users.length} users`);

  // Create yogurts
  const yogurts = await Promise.all([
    prisma.yogurt.create({
      data: {
        name: 'Strawberry Delight',
        description: 'Sweet and tangy strawberry yogurt with real fruit pieces',
        price: 4.99,
        imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        stock: 50
      }
    }),
    prisma.yogurt.create({
      data: {
        name: 'Blueberry Blast',
        description: 'Rich and creamy blueberry yogurt packed with antioxidants',
        price: 5.49,
        imageUrl: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        stock: 35
      }
    }),
    prisma.yogurt.create({
      data: {
        name: 'Vanilla Bean',
        description: 'Classic vanilla yogurt with real vanilla bean specks',
        price: 3.99,
        imageUrl: 'https://images.unsplash.com/photo-1488477304112-4944851de03d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        stock: 60
      }
    }),
    prisma.yogurt.create({
      data: {
        name: 'Chocolate Dream',
        description: 'Decadent chocolate yogurt for the ultimate dessert experience',
        price: 5.99,
        imageUrl: 'https://images.unsplash.com/photo-1582913130063-8318329a94a3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        stock: 40
      }
    }),
    prisma.yogurt.create({
      data: {
        name: 'Mango Tango',
        description: 'Tropical mango yogurt that brings sunshine to your day',
        price: 5.29,
        imageUrl: 'https://images.unsplash.com/photo-1546548970-71785318a17b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        stock: 25
      }
    }),
    prisma.yogurt.create({
      data: {
        name: 'Greek Plain',
        description: 'High-protein Greek yogurt with a smooth texture',
        price: 4.49,
        imageUrl: 'https://images.unsplash.com/photo-1488477304112-4944851de03d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        stock: 70
      }
    }),
    prisma.yogurt.create({
      data: {
        name: 'Honey Almond',
        description: 'Creamy yogurt with natural honey and crunchy almonds',
        price: 6.49,
        imageUrl: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        stock: 15
      }
    }),
    prisma.yogurt.create({
      data: {
        name: 'Coconut Paradise',
        description: 'Tropical coconut yogurt that transports you to the beach',
        price: 5.99,
        imageUrl: 'https://images.unsplash.com/photo-1559622214-f4a29c302d73?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        stock: 10
      }
    })
  ]);

  console.log(`Created ${yogurts.length} yogurts`);

  // Create orders and order items
  // Completed order for customer1
  const order1 = await prisma.order.create({
    data: {
      userId: users[1].id,
      status: 'completed',
      total: yogurts[0].price * 2 + yogurts[1].price,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
    }
  });

  await Promise.all([
    prisma.orderItem.create({
      data: {
        orderId: order1.id,
        yogurtId: yogurts[0].id,
        quantity: 2,
        price: yogurts[0].price
      }
    }),
    prisma.orderItem.create({
      data: {
        orderId: order1.id,
        yogurtId: yogurts[1].id,
        quantity: 1,
        price: yogurts[1].price
      }
    })
  ]);

  // Pending order for customer2
  const order2 = await prisma.order.create({
    data: {
      userId: users[2].id,
      status: 'pending',
      total: yogurts[2].price * 3 + yogurts[3].price * 2,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    }
  });

  await Promise.all([
    prisma.orderItem.create({
      data: {
        orderId: order2.id,
        yogurtId: yogurts[2].id,
        quantity: 3,
        price: yogurts[2].price
      }
    }),
    prisma.orderItem.create({
      data: {
        orderId: order2.id,
        yogurtId: yogurts[3].id,
        quantity: 2,
        price: yogurts[3].price
      }
    })
  ]);

  // Cancelled order for customer1
  const order3 = await prisma.order.create({
    data: {
      userId: users[1].id,
      status: 'cancelled',
      total: yogurts[4].price * 1 + yogurts[5].price * 2,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // 14 days ago
    }
  });

  await Promise.all([
    prisma.orderItem.create({
      data: {
        orderId: order3.id,
        yogurtId: yogurts[4].id,
        quantity: 1,
        price: yogurts[4].price
      }
    }),
    prisma.orderItem.create({
      data: {
        orderId: order3.id,
        yogurtId: yogurts[5].id,
        quantity: 2,
        price: yogurts[5].price
      }
    })
  ]);

  // Recent completed order
  const order4 = await prisma.order.create({
    data: {
      userId: users[2].id,
      status: 'completed',
      total: yogurts[6].price * 4 + yogurts[7].price * 2,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    }
  });

  await Promise.all([
    prisma.orderItem.create({
      data: {
        orderId: order4.id,
        yogurtId: yogurts[6].id,
        quantity: 4,
        price: yogurts[6].price
      }
    }),
    prisma.orderItem.create({
      data: {
        orderId: order4.id,
        yogurtId: yogurts[7].id,
        quantity: 2,
        price: yogurts[7].price
      }
    })
  ]);

  // Guest order (no user ID)
  const order5 = await prisma.order.create({
    data: {
      status: 'completed',
      total: yogurts[0].price * 1 + yogurts[3].price * 1,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
    }
  });

  await Promise.all([
    prisma.orderItem.create({
      data: {
        orderId: order5.id,
        yogurtId: yogurts[0].id,
        quantity: 1,
        price: yogurts[0].price
      }
    }),
    prisma.orderItem.create({
      data: {
        orderId: order5.id,
        yogurtId: yogurts[3].id,
        quantity: 1,
        price: yogurts[3].price
      }
    })
  ]);

  console.log(`Created 5 orders with order items`);
  console.log('Seeding completed successfully');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
