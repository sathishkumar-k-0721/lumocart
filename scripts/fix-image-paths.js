const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixImagePaths() {
  try {
    console.log('🔍 Checking product image paths...\n');

    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        images: true,
      },
    });

    console.log(`Found ${products.length} products\n`);

    let fixedCount = 0;

    for (const product of products) {
      let needsUpdate = false;
      const updateData = {};
      
      // Fix main image field
      if (product.image && (product.image.startsWith('./') || (!product.image.startsWith('/') && !product.image.startsWith('http')))) {
        needsUpdate = true;
        const cleanPath = product.image.replace(/^\.\//, '');
        updateData.image = `/${cleanPath}`;
        console.log(`Fixing main image for: ${product.name}`);
        console.log(`  Old: ${product.image}`);
        console.log(`  New: ${updateData.image}`);
      }
      
      // Fix images array
      const fixedImages = product.images.map(img => {
        // Check if image path starts with ./ or doesn't start with /
        if (img.startsWith('./') || (!img.startsWith('/') && !img.startsWith('http'))) {
          needsUpdate = true;
          // Remove ./ prefix and add leading /
          const cleanPath = img.replace(/^\.\//, '');
          return `/${cleanPath}`;
        }
        return img;
      });

      if (needsUpdate) {
        if (fixedImages.some((img, i) => img !== product.images[i])) {
          updateData.images = fixedImages;
          console.log(`Fixing gallery images for: ${product.name}`);
          console.log(`  Old: ${JSON.stringify(product.images)}`);
          console.log(`  New: ${JSON.stringify(fixedImages)}`);
        }

        await prisma.product.update({
          where: { id: product.id },
          data: updateData,
        });

        fixedCount++;
      }
    }

    console.log(`\n✅ Fixed ${fixedCount} products`);
    console.log(`✅ ${products.length - fixedCount} products already had correct paths`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixImagePaths();
