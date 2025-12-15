const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function extractImages() {
  try {
    console.log('Fetching products from database...');
    const products = await prisma.product.findMany({
      select: { id: true, name: true, image: true, images: true }
    });

    console.log(`Found ${products.length} products\n`);

    // Ensure public/img directory exists
    const imgDir = path.join(process.cwd(), 'public', 'img');
    if (!fs.existsSync(imgDir)) {
      fs.mkdirSync(imgDir, { recursive: true });
      console.log('Created public/img directory');
    }

    let updatedCount = 0;

    for (const product of products) {
      console.log(`\nProcessing: ${product.name}`);
      
      // Process main image
      let newMainImage = product.image;
      if (product.image && product.image.startsWith('/data:image')) {
        const filename = `product-${product.id}-main.jpg`;
        const filepath = path.join(imgDir, filename);
        
        try {
          // Extract base64 data
          const base64Match = product.image.match(/^\/data:image\/[a-z]+;base64,(.*)$/);
          if (base64Match) {
            const base64Data = base64Match[1];
            const buffer = Buffer.from(base64Data, 'base64');
            fs.writeFileSync(filepath, buffer);
            newMainImage = `/img/${filename}`;
            console.log(`  ✓ Extracted main image: ${filename}`);
          }
        } catch (error) {
          console.error(`  ✗ Failed to extract main image: ${error.message}`);
        }
      }

      // Process gallery images
      const newGalleryImages = [];
      if (product.images && product.images.length > 0) {
        for (let i = 0; i < product.images.length; i++) {
          const imgData = product.images[i];
          
          if (imgData && imgData.startsWith('/data:image')) {
            const filename = `product-${product.id}-${i}.jpg`;
            const filepath = path.join(imgDir, filename);
            
            try {
              const base64Match = imgData.match(/^\/data:image\/[a-z]+;base64,(.*)$/);
              if (base64Match) {
                const base64Data = base64Match[1];
                const buffer = Buffer.from(base64Data, 'base64');
                fs.writeFileSync(filepath, buffer);
                newGalleryImages.push(`/img/${filename}`);
                console.log(`  ✓ Extracted gallery image: ${filename}`);
              }
            } catch (error) {
              console.error(`  ✗ Failed to extract gallery image ${i}: ${error.message}`);
            }
          } else {
            // Keep non-base64 images as is
            newGalleryImages.push(imgData);
          }
        }
      }

      // Update database only if we extracted images
      if (newMainImage !== product.image || newGalleryImages.length > 0) {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            image: newMainImage,
            images: newGalleryImages.length > 0 ? newGalleryImages : product.images
          }
        });
        updatedCount++;
        console.log(`  ✓ Updated database record`);
      }
    }

    console.log(`\n\n✅ Complete!`);
    console.log(`   Extracted images from ${updatedCount} products`);
    console.log(`   Images saved to: ${imgDir}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

extractImages();
