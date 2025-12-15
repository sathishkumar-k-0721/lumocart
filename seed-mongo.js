#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

// Get DATABASE_URL from .env.local
function getDatabaseUrl() {
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const dbUrlMatch = envContent.match(/DATABASE_URL=(.+)/);
    if (dbUrlMatch) {
      return dbUrlMatch[1].trim();
    }
  }
  throw new Error('DATABASE_URL not found in .env.local');
}

async function seedDatabase() {
  const databaseUrl = getDatabaseUrl();
  const client = new MongoClient(databaseUrl);

  try {
    console.log('🌱 Starting database seeding...\n');
    await client.connect();
    const db = client.db('lumocart');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await db.collection('users').deleteMany({});
    await db.collection('categories').deleteMany({});
    await db.collection('subcategories').deleteMany({});
    await db.collection('products').deleteMany({});
    await db.collection('carts').deleteMany({});

    // Create Users
    console.log('👥 Creating users...');
    
    const adminPassword = await bcrypt.hash('poipoi', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    const usersResult = await db.collection('users').insertMany([
      {
        name: 'Admin User',
        email: 'sat@lo.com',
        password: adminPassword,
        role: 'ADMIN',
        createdAt: new Date(),
      },
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: userPassword,
        role: 'USER',
        createdAt: new Date(),
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: userPassword,
        role: 'USER',
        createdAt: new Date(),
      },
    ]);

    const userIds = Object.values(usersResult.insertedIds);
    const [adminId, userId1, userId2] = userIds;
    console.log('✅ Users created');

    // Create Categories
    console.log('\n📂 Creating categories...');

    const categoriesResult = await db.collection('categories').insertMany([
      {
        name: 'Gift Collections',
        slug: 'gift-collections',
        description: 'Beautiful gift collections for every occasion',
        image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500&h=500&fit=crop',
        createdAt: new Date(),
      },
      {
        name: 'Electronics & Gadgets',
        slug: 'electronics-gadgets',
        description: 'Latest electronics and smart gadgets',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
        createdAt: new Date(),
      },
      {
        name: 'Personal Care',
        slug: 'personal-care',
        description: 'Premium personal care products',
        image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=500&fit=crop',
        createdAt: new Date(),
      },
      {
        name: 'Home & Decor',
        slug: 'home-decor',
        description: 'Beautiful home decoration items',
        image: 'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=500&h=500&fit=crop',
        createdAt: new Date(),
      },
    ]);

    const catIds = Object.values(categoriesResult.insertedIds);
    const [giftCatId, electronicsId, personalCareId, homeId] = catIds;
    console.log('✅ Categories created');

    // Create Subcategories
    console.log('\n📑 Creating subcategories...');

    const subcategoriesResult = await db.collection('subcategories').insertMany([
      {
        name: 'Birthday Gifts',
        slug: 'birthday-gifts',
        description: 'Special birthday gift collections',
        categoryId: giftCatId,
        createdAt: new Date(),
      },
      {
        name: 'Anniversary Gifts',
        slug: 'anniversary-gifts',
        description: 'Romantic anniversary gift ideas',
        categoryId: giftCatId,
        createdAt: new Date(),
      },
      {
        name: 'Wedding Gifts',
        slug: 'wedding-gifts',
        description: 'Premium wedding gift collections',
        categoryId: giftCatId,
        createdAt: new Date(),
      },
      {
        name: 'Accessories',
        slug: 'accessories',
        description: 'Tech accessories and more',
        categoryId: electronicsId,
        createdAt: new Date(),
      },
      {
        name: 'Skincare',
        slug: 'skincare',
        description: 'Premium skincare products',
        categoryId: personalCareId,
        createdAt: new Date(),
      },
      {
        name: 'Fragrances',
        slug: 'fragrances',
        description: 'Luxury perfumes and colognes',
        categoryId: personalCareId,
        createdAt: new Date(),
      },
      {
        name: 'Lighting',
        slug: 'lighting',
        description: 'Beautiful lighting solutions',
        categoryId: homeId,
        createdAt: new Date(),
      },
      {
        name: 'Rugs & Carpets',
        slug: 'rugs-carpets',
        description: 'Premium rugs and carpets',
        categoryId: homeId,
        createdAt: new Date(),
      },
    ]);

    const subIds = Object.values(subcategoriesResult.insertedIds);
    const [birthdaySubId, annivSubId, weddingSubId, accessoriesSubId, skincareSubId, fragranceSubId, lampSubId, rugsSubId] = subIds;
    console.log('✅ Subcategories created');

    // Create Products
    console.log('\n📦 Creating products...');

    await db.collection('products').insertMany([
      {
        name: 'Premium Gift Hamper',
        slug: 'premium-gift-hamper',
        description: 'Luxury gift hamper with premium items including chocolates, perfume, and more',
        price: 2499,
        originalPrice: 3499,
        image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500&h=500&fit=crop',
        images: ['https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500&h=500&fit=crop'],
        categoryId: giftCatId,
        subcategoryId: birthdaySubId,
        stock: 45,
        featured: true,
        isVisible: true,
        createdAt: new Date(),
      },
      {
        name: 'Anniversary Gift Set',
        slug: 'anniversary-gift-set',
        description: 'Beautiful anniversary gift set with romantic items',
        price: 1999,
        originalPrice: 2999,
        image: 'https://images.unsplash.com/photo-1549465220-eb63cc572188?w=500&h=500&fit=crop',
        images: ['https://images.unsplash.com/photo-1549465220-eb63cc572188?w=500&h=500&fit=crop'],
        categoryId: giftCatId,
        subcategoryId: annivSubId,
        stock: 32,
        featured: true,
        isVisible: true,
        createdAt: new Date(),
      },
      {
        name: 'Premium Wireless Earbuds',
        slug: 'premium-wireless-earbuds',
        description: 'High-quality wireless earbuds with noise cancellation',
        price: 4999,
        originalPrice: 7999,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop'],
        categoryId: electronicsId,
        subcategoryId: accessoriesSubId,
        stock: 60,
        featured: true,
        isVisible: true,
        createdAt: new Date(),
      },
      {
        name: 'USB-C Fast Charger',
        slug: 'usb-c-fast-charger',
        description: '65W USB-C fast charger for all devices',
        price: 1299,
        originalPrice: 1999,
        image: 'https://images.unsplash.com/photo-1591290621749-e564e15253e8?w=500&h=500&fit=crop',
        images: ['https://images.unsplash.com/photo-1591290621749-e564e15253e8?w=500&h=500&fit=crop'],
        categoryId: electronicsId,
        subcategoryId: accessoriesSubId,
        stock: 85,
        featured: true,
        isVisible: true,
        createdAt: new Date(),
      },
      {
        name: 'Premium Skincare Kit',
        slug: 'premium-skincare-kit',
        description: 'Complete skincare routine kit with 5 products',
        price: 2499,
        originalPrice: 3999,
        image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=500&fit=crop',
        images: ['https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=500&fit=crop'],
        categoryId: personalCareId,
        subcategoryId: skincareSubId,
        stock: 40,
        featured: true,
        isVisible: true,
        createdAt: new Date(),
      },
      {
        name: 'Luxury Perfume Collection',
        slug: 'luxury-perfume-collection',
        description: 'Set of 3 luxury perfumes from premium brands',
        price: 4999,
        originalPrice: 7499,
        image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=500&fit=crop',
        images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=500&fit=crop'],
        categoryId: personalCareId,
        subcategoryId: fragranceSubId,
        stock: 25,
        featured: true,
        isVisible: true,
        createdAt: new Date(),
      },
      {
        name: 'Modern LED Desk Lamp',
        slug: 'modern-led-desk-lamp',
        description: 'Smart LED desk lamp with touch control',
        price: 1999,
        originalPrice: 2999,
        image: 'https://images.unsplash.com/photo-1565636192335-14c46fa1120d?w=500&h=500&fit=crop',
        images: ['https://images.unsplash.com/photo-1565636192335-14c46fa1120d?w=500&h=500&fit=crop'],
        categoryId: homeId,
        subcategoryId: lampSubId,
        stock: 35,
        featured: true,
        isVisible: true,
        createdAt: new Date(),
      },
      {
        name: 'Premium Area Rug',
        slug: 'premium-area-rug',
        description: 'Hand-woven premium area rug - 5x7 feet',
        price: 5999,
        originalPrice: 8999,
        image: 'https://images.unsplash.com/photo-1594196488202-3431e387eaa2?w=500&h=500&fit=crop',
        images: ['https://images.unsplash.com/photo-1594196488202-3431e387eaa2?w=500&h=500&fit=crop'],
        categoryId: homeId,
        subcategoryId: rugsSubId,
        stock: 12,
        featured: false,
        isVisible: true,
        createdAt: new Date(),
      },
    ]);

    console.log('✅ 8 products created');

    // Create shopping carts
    console.log('\n🛒 Creating shopping carts...');

    await db.collection('carts').insertMany([
      {
        userId: userId1,
        createdAt: new Date(),
      },
      {
        userId: userId2,
        createdAt: new Date(),
      },
    ]);

    console.log('✅ Shopping carts created');

    console.log('\n✨ Database seeding completed successfully!\n');
    console.log('📋 Sample Credentials:');
    console.log('   Admin: sat@lo.com / poipoi');
    console.log('   User 1: john@example.com / user123');
    console.log('   User 2: jane@example.com / user123\n');

  } catch (error) {
    console.error('❌ Error during seeding:', error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seedDatabase();
