const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkImages() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        images: true
      }
    });

    console.log('\n=== Product Image Paths ===\n');
    products.forEach(p => {
      console.log(`${p.name}:`);
      console.log(`  Main: ${p.image}`);
      console.log(`  Gallery: ${p.images.join(', ')}`);
      console.log('');
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkImages();
