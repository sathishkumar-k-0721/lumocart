// Fix missing slugs in products and categories before Prisma schema push
const { MongoClient } = require('mongodb');

const DATABASE_URL = 'mongodb+srv://plsathish0721_db_user:zFIBbJV1IjeOI3xj@cluster0.yjovwvc.mongodb.net/lumocart';

function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function fixSlugs() {
  console.log('🔄 Connecting to MongoDB...');
  const client = await MongoClient.connect(DATABASE_URL);
  const db = client.db('lumocart');
  
  try {
    // Fix Products without slugs
    console.log('\n📦 Fixing Product slugs...');
    const products = await db.collection('products').find({ 
      $or: [{ slug: null }, { slug: '' }, { slug: { $exists: false } }]
    }).toArray();
    
    console.log(`Found ${products.length} products without slugs`);
    
    for (const product of products) {
      const slug = generateSlug(product.name);
      const existingSlug = await db.collection('products').findOne({ slug });
      
      // If slug exists, append product ID to make it unique
      const finalSlug = existingSlug ? `${slug}-${product._id.toString().slice(-6)}` : slug;
      
      await db.collection('products').updateOne(
        { _id: product._id },
        { $set: { slug: finalSlug } }
      );
      console.log(`  ✓ Updated: ${product.name} → ${finalSlug}`);
    }
    
    // Fix Categories without slugs
    console.log('\n📁 Fixing Category slugs...');
    const categories = await db.collection('categories').find({ 
      $or: [{ slug: null }, { slug: '' }, { slug: { $exists: false } }]
    }).toArray();
    
    console.log(`Found ${categories.length} categories without slugs`);
    
    for (const category of categories) {
      const slug = generateSlug(category.name);
      const existingSlug = await db.collection('categories').findOne({ slug });
      
      // If slug exists, append category ID to make it unique
      const finalSlug = existingSlug ? `${slug}-${category._id.toString().slice(-6)}` : slug;
      
      await db.collection('categories').updateOne(
        { _id: category._id },
        { $set: { slug: finalSlug } }
      );
      console.log(`  ✓ Updated: ${category.name} → ${finalSlug}`);
    }
    
    console.log('\n✅ All slugs fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await client.close();
  }
}

fixSlugs()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
