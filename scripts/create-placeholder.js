const fs = require('fs');
const path = require('path');

// Create a simple SVG placeholder
const placeholderSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
  <rect width="400" height="400" fill="#f0f0f0"/>
  <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="24" fill="#999">
    No Image Available
  </text>
</svg>`;

const imgDir = path.join(process.cwd(), 'public', 'img');
const placeholderPath = path.join(imgDir, 'product01.png');

// For SVG, we can just write it directly
fs.writeFileSync(placeholderPath.replace('.png', '.svg'), placeholderSVG);
console.log('✓ Created placeholder image: product01.svg');

// Also update products to use the placeholder
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updatePlaceholders() {
  const updated = await prisma.product.updateMany({
    where: { image: '/img/product01.png' },
    data: { image: '/img/product01.svg' }
  });
  
  console.log(`✓ Updated ${updated.count} products to use placeholder`);
  await prisma.$disconnect();
}

updatePlaceholders();
