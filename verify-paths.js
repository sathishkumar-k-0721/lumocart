const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyPaths() {
  const products = await prisma.product.findMany({
    select: { name: true, image: true, images: true }
  });

  console.log('\n📊 IMAGE PATHS AFTER EXTRACTION:\n');
  
  products.forEach(prod => {
    console.log(`${prod.name}:`);
    console.log(`  Main: ${prod.image}`);
    if (prod.images && prod.images.length > 0) {
      console.log(`  Gallery: ${prod.images.join(', ')}`);
    }
    console.log('');
  });

  await prisma.$disconnect();
}

verifyPaths();
