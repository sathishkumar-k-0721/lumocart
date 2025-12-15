// Comprehensive database test with Prisma
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testDatabase() {
  try {
    console.log('🔄 Testing Prisma database connection...\n');
    
    // Test 1: Count documents
    console.log('📊 Counting documents...');
    const [userCount, productCount, categoryCount, orderCount] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.category.count(),
      prisma.order.count(),
    ]);
    
    console.log(`  ✓ Users: ${userCount}`);
    console.log(`  ✓ Products: ${productCount}`);
    console.log(`  ✓ Categories: ${categoryCount}`);
    console.log(`  ✓ Orders: ${orderCount}\n`);
    
    // Test 2: Fetch sample products
    console.log('🛍️  Fetching sample products...');
    const products = await prisma.product.findMany({
      take: 3,
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    for (const product of products) {
      console.log(`  ✓ ${product.name} - ₹${product.price} (${product.category?.name || 'No category'})`);
    }
    console.log();
    
    // Test 3: Fetch sample categories
    console.log('📁 Fetching categories...');
    const categories = await prisma.category.findMany({
      take: 5,
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
    
    for (const category of categories) {
      console.log(`  ✓ ${category.name} (${category._count.products} products)`);
    }
    console.log();
    
    // Test 4: Fetch recent orders
    console.log('📦 Fetching recent orders...');
    const orders = await prisma.order.findMany({
      take: 3,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    for (const order of orders) {
      console.log(`  ✓ Order #${order.orderNumber} - ₹${order.totalAmount} (${order.status}) - ${order.user.name}`);
    }
    
    console.log('\n✅ All database tests passed successfully!');
    
  } catch (error) {
    console.error('\n❌ Database test failed:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
