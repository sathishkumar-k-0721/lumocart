// Clean up orphaned cart records before Prisma schema push
const { MongoClient, ObjectId } = require('mongodb');

const DATABASE_URL = 'mongodb+srv://plsathish0721_db_user:zFIBbJV1IjeOI3xj@cluster0.yjovwvc.mongodb.net/lumocart';

async function cleanupCarts() {
  console.log('🔄 Connecting to MongoDB...');
  const client = await MongoClient.connect(DATABASE_URL);
  const db = client.db('lumocart');
  
  try {
    // Find carts with null or missing userId
    console.log('\n🛒 Finding orphaned carts...');
    const orphanedCarts = await db.collection('carts').find({ 
      $or: [
        { userId: null }, 
        { userId: '' }, 
        { userId: { $exists: false } }
      ]
    }).toArray();
    
    console.log(`Found ${orphanedCarts.length} orphaned carts`);
    
    if (orphanedCarts.length > 0) {
      // Delete orphaned carts (they're abandoned/invalid anyway)
      const result = await db.collection('carts').deleteMany({
        $or: [
          { userId: null },
          { userId: '' },
          { userId: { $exists: false } }
        ]
      });
      console.log(`  ✓ Deleted ${result.deletedCount} orphaned carts`);
    }
    
    // Check for duplicate userId in remaining carts
    console.log('\n🔍 Checking for duplicate user carts...');
    const duplicates = await db.collection('carts').aggregate([
      { $group: { 
          _id: '$userId', 
          count: { $sum: 1 },
          carts: { $push: { _id: '$_id', updatedAt: '$updatedAt' } }
        }
      },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();
    
    console.log(`Found ${duplicates.length} users with multiple carts`);
    
    for (const dup of duplicates) {
      // Keep the most recently updated cart, delete others
      const sortedCarts = dup.carts.sort((a, b) => 
        (b.updatedAt || new Date(0)) - (a.updatedAt || new Date(0))
      );
      
      const keepCart = sortedCarts[0];
      const deleteCarts = sortedCarts.slice(1);
      
      for (const cart of deleteCarts) {
        await db.collection('carts').deleteOne({ _id: cart._id });
        console.log(`  ✓ Deleted duplicate cart ${cart._id} for user ${dup._id}`);
      }
    }
    
    console.log('\n✅ Cart cleanup completed successfully!');
    
    // Show final stats
    const finalCount = await db.collection('carts').countDocuments();
    console.log(`\n📊 Final cart count: ${finalCount}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await client.close();
  }
}

cleanupCarts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
