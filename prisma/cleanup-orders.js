// Clean up orphaned orders without userId
const { MongoClient } = require('mongodb');

const DATABASE_URL = 'mongodb+srv://plsathish0721_db_user:zFIBbJV1IjeOI3xj@cluster0.yjovwvc.mongodb.net/lumocart';

async function cleanupOrders() {
  console.log('🔄 Connecting to MongoDB...');
  const client = await MongoClient.connect(DATABASE_URL);
  const db = client.db('lumocart');
  
  try {
    // Find orders with null userId
    console.log('\n📦 Finding orphaned orders...');
    const orphanedOrders = await db.collection('orders').find({ 
      $or: [
        { userId: null }, 
        { userId: '' }, 
        { userId: { $exists: false } }
      ]
    }).toArray();
    
    console.log(`Found ${orphanedOrders.length} orphaned orders`);
    
    if (orphanedOrders.length > 0) {
      console.log('\n⚠️  Options:');
      console.log('  1. Delete these orders (recommended for test data)');
      console.log('  2. Keep them for manual review');
      
      // For now, just delete them since this is migration/test data
      const result = await db.collection('orders').deleteMany({
        $or: [
          { userId: null },
          { userId: '' },
          { userId: { $exists: false } }
        ]
      });
      console.log(`\n  ✓ Deleted ${result.deletedCount} orphaned orders`);
    }
    
    console.log('\n✅ Order cleanup completed successfully!');
    
    // Show final stats
    const finalCount = await db.collection('orders').countDocuments();
    console.log(`\n📊 Final order count: ${finalCount}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await client.close();
  }
}

cleanupOrders()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
