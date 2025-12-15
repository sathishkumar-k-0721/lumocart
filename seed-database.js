#!/usr/bin/env node

// Set DATABASE_URL from environment or .env.local
if (!process.env.DATABASE_URL) {
  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const dbUrlMatch = envContent.match(/DATABASE_URL=(.+)/);
    if (dbUrlMatch) {
      process.env.DATABASE_URL = dbUrlMatch[1];
    }
  }
}

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.cartItem.deleteMany({});
    await prisma.cart.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.subcategory.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.user.deleteMany({});

    // Create Users
    console.log('👥 Creating users...');
    
    const adminPassword = await bcrypt.hash('poipoi', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    const admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'sat@lo.com',
        password: adminPassword,
        role: 'ADMIN',
      },
    });

    const user1 = await prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        password: userPassword,
        role: 'USER',
      },
    });

    const user2 = await prisma.user.create({
      data: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: userPassword,
        role: 'USER',
      },
    });

    console.log('✅ Users created:', [admin.email, user1.email, user2.email]);

    // Create Categories
    console.log('\n📂 Creating categories...');

    const giftCategory = await prisma.category.create({
      data: {
        name: 'Gift Collections',
        slug: 'gift-collections',
        description: 'Beautiful gift collections for every occasion',
        image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500&h=500&fit=crop',
      },
    });

    const electronicsCategory = await prisma.category.create({
      data: {
        name: 'Electronics & Gadgets',
        slug: 'electronics-gadgets',
        description: 'Latest electronics and smart gadgets',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
      },
    });

    const personalCareCategory = await prisma.category.create({
      data: {
        name: 'Personal Care',
        slug: 'personal-care',
        description: 'Premium personal care products',
        image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=500&fit=crop',
      },
    });

    const homeCategory = await prisma.category.create({
      data: {
        name: 'Home & Decor',
        slug: 'home-decor',
        description: 'Beautiful home decoration items',
        image: 'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=500&h=500&fit=crop',
      },
    });

    console.log('✅ Categories created');

    // Create Subcategories
    console.log('\n📑 Creating subcategories...');

    const birthdaySubcategory = await prisma.subcategory.create({
      data: {
        name: 'Birthday Gifts',
        slug: 'birthday-gifts',
        description: 'Special birthday gift collections',
        categoryId: giftCategory.id,
      },
    });

    const anniversarySubcategory = await prisma.subcategory.create({
      data: {
        name: 'Anniversary Gifts',
        slug: 'anniversary-gifts',
        description: 'Romantic anniversary gift ideas',
        categoryId: giftCategory.id,
      },
    });

    const weddingSubcategory = await prisma.subcategory.create({
      data: {
        name: 'Wedding Gifts',
        slug: 'wedding-gifts',
        description: 'Premium wedding gift collections',
        categoryId: giftCategory.id,
      },
    });

    const accessoriesSubcategory = await prisma.subcategory.create({
      data: {
        name: 'Accessories',
        slug: 'accessories',
        description: 'Tech accessories and more',
        categoryId: electronicsCategory.id,
      },
    });

    const skincareSubcategory = await prisma.subcategory.create({
      data: {
        name: 'Skincare',
        slug: 'skincare',
        description: 'Premium skincare products',
        categoryId: personalCareCategory.id,
      },
    });

    const fragranceSubcategory = await prisma.subcategory.create({
      data: {
        name: 'Fragrances',
        slug: 'fragrances',
        description: 'Luxury perfumes and colognes',
        categoryId: personalCareCategory.id,
      },
    });

    const lampSubcategory = await prisma.subcategory.create({
      data: {
        name: 'Lighting',
        slug: 'lighting',
        description: 'Beautiful lighting solutions',
        categoryId: homeCategory.id,
      },
    });

    const rugsSubcategory = await prisma.subcategory.create({
      data: {
        name: 'Rugs & Carpets',
        slug: 'rugs-carpets',
        description: 'Premium rugs and carpets',
        categoryId: homeCategory.id,
      },
    });

    console.log('✅ Subcategories created');

    // Create Products
    console.log('\n📦 Creating products...');

    const products = [
      // Gift Collections
      {
        name: 'Premium Gift Hamper',
        slug: 'premium-gift-hamper',
        description: 'Luxury gift hamper with premium items including chocolates, perfume, and more',
        price: 2499,
        originalPrice: 3499,
        image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500&h=500&fit=crop',
        images: ['https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500&h=500&fit=crop'],
        categoryId: giftCategory.id,
        subcategoryId: birthdaySubcategory.id,
        stock: 45,
        featured: true,
        isVisible: true,
      },
      {
        name: 'Anniversary Gift Set',
        slug: 'anniversary-gift-set',
        description: 'Beautiful anniversary gift set with romantic items',
        price: 1999,
        originalPrice: 2999,
        image: 'https://images.unsplash.com/photo-1549465220-eb63cc572188?w=500&h=500&fit=crop',
        images: ['https://images.unsplash.com/photo-1549465220-eb63cc572188?w=500&h=500&fit=crop'],
        categoryId: giftCategory.id,
        subcategoryId: anniversarySubcategory.id,
        stock: 32,
        featured: true,
        isVisible: true,
      },
      {
        name: 'Premium Wireless Earbuds',
        slug: 'premium-wireless-earbuds',
        description: 'High-quality wireless earbuds with noise cancellation',
        price: 4999,
        originalPrice: 7999,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop'],
        categoryId: electronicsCategory.id,
        subcategoryId: accessoriesSubcategory.id,
        stock: 60,
        featured: true,
        isVisible: true,
      },
      {
        name: 'USB-C Fast Charger',
        slug: 'usb-c-fast-charger',
        description: '65W USB-C fast charger for all devices',
        price: 1299,
        originalPrice: 1999,
        image: 'https://images.unsplash.com/photo-1591290621749-e564e15253e8?w=500&h=500&fit=crop',
        images: ['https://images.unsplash.com/photo-1591290621749-e564e15253e8?w=500&h=500&fit=crop'],
        categoryId: electronicsCategory.id,
        subcategoryId: accessoriesSubcategory.id,
        stock: 85,
        featured: true,
        isVisible: true,
      },
      {
        name: 'Premium Skincare Kit',
        slug: 'premium-skincare-kit',
        description: 'Complete skincare routine kit with 5 products',
        price: 2499,
        originalPrice: 3999,
        image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=500&fit=crop',
        images: ['https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=500&fit=crop'],
        categoryId: personalCareCategory.id,
        subcategoryId: skincareSubcategory.id,
        stock: 40,
        featured: true,
        isVisible: true,
      },
      {
        name: 'Luxury Perfume Collection',
        slug: 'luxury-perfume-collection',
        description: 'Set of 3 luxury perfumes from premium brands',
        price: 4999,
        originalPrice: 7499,
        image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=500&fit=crop',
        images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=500&fit=crop'],
        categoryId: personalCareCategory.id,
        subcategoryId: fragranceSubcategory.id,
        stock: 25,
        featured: true,
        isVisible: true,
      },
      {
        name: 'Modern LED Desk Lamp',
        slug: 'modern-led-desk-lamp',
        description: 'Smart LED desk lamp with touch control',
        price: 1999,
        originalPrice: 2999,
        image: 'https://images.unsplash.com/photo-1565636192335-14c46fa1120d?w=500&h=500&fit=crop',
        images: ['https://images.unsplash.com/photo-1565636192335-14c46fa1120d?w=500&h=500&fit=crop'],
        categoryId: homeCategory.id,
        subcategoryId: lampSubcategory.id,
        stock: 35,
        featured: true,
        isVisible: true,
      },
    ];

    for (const product of products) {
      await prisma.product.create({ data: product });
    }

    console.log(`✅ ${products.length} products created`);

    // Create shopping carts
    console.log('\n🛒 Creating shopping carts...');

    await prisma.cart.create({
      data: {
        userId: user1.id,
      },
    });

    await prisma.cart.create({
      data: {
        userId: user2.id,
      },
    });

    console.log('✅ Shopping carts created');

    console.log('\n✨ Database seeding completed successfully!\n');
    console.log('📋 Sample Credentials:');
    console.log('   Admin: sat@lo.com / poipoi');
    console.log('   User 1: john@example.com / user123');
    console.log('   User 2: jane@example.com / user123\n');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
