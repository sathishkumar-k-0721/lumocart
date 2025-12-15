// Fix missing orderNumbers in orders before Prisma schema push
const { MongoClient } = require('mongodb');

const DATABASE_URL = 'mongodb+srv://plsathish0721_db_user:zFIBbJV1IjeOI3xj@cluster0.yjovwvc.mongodb.net/giftwebsite';

function generateOrderNumber() {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD${timestamp}${random}`;
}

async function fixOrderNumbers() {
  console.log('🔄 Connecting to MongoDB...');
  const client = await MongoClient.connect(DATABASE_URL);
  const db = client.db('giftwebsite');
  
  try {
    // Find orders without orderNumber
    console.log('\n📦 Finding orders without orderNumbers...');
    const ordersWithoutNumber = await db.collection('orders').find({ 
      $or: [
        { orderNumber: null }, 
        { orderNumber: '' }, 
        { orderNumber: { $exists: false } }
      ]
    }).toArray();
    
    console.log(`Found ${ordersWithoutNumber.length} orders without orderNumbers`);
    
    for (const order of ordersWithoutNumber) {
      let orderNumber;
      let isUnique = false;
      
      // Generate unique orderNumber
      while (!isUnique) {
        orderNumber = generateOrderNumber();
        const existing = await db.collection('orders').findOne({ orderNumber });
        if (!existing) {
          isUnique = true;
        }
      }
      
      await db.collection('orders').updateOne(
        { _id: order._id },
        { $set: { orderNumber } }
      );
      console.log(`  ✓ Updated order ${order._id} → ${orderNumber}`);
    }
    
    // Check for duplicate orderNumbers
    console.log('\n🔍 Checking for duplicate orderNumbers...');
    const duplicates = await db.collection('orders').aggregate([
      { $group: { 
          _id: '$orderNumber', 
          count: { $sum: 1 },
          orders: { $push: '$_id' }
        }
      },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();
    
    console.log(`Found ${duplicates.length} duplicate orderNumbers`);
    
    for (const dup of duplicates) {
      // Keep first order, regenerate orderNumbers for others
      const ordersToUpdate = dup.orders.slice(1);
      
      for (const orderId of ordersToUpdate) {
        let newOrderNumber;
        let isUnique = false;
        
        while (!isUnique) {
          newOrderNumber = generateOrderNumber();
          const existing = await db.collection('orders').findOne({ orderNumber: newOrderNumber });
          if (!existing) {
            isUnique = true;
          }
        }
        
        await db.collection('orders').updateOne(
          { _id: orderId },
          { $set: { orderNumber: newOrderNumber } }
        );
        console.log(`  ✓ Fixed duplicate: order ${orderId} → ${newOrderNumber}`);
      }
    }
    
    console.log('\n✅ All orderNumbers fixed successfully!');
    
    // Show final stats
    const totalOrders = await db.collection('orders').countDocuments();
    const uniqueOrderNumbers = await db.collection('orders').distinct('orderNumber');
    console.log(`\n📊 Total orders: ${totalOrders}`);
    console.log(`📊 Unique orderNumbers: ${uniqueOrderNumbers.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await client.close();
  }
}

fixOrderNumbers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
