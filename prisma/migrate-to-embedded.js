const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://lumo_user:Poiuytrewq97@cluster0.49tkxni.mongodb.net/lumocart?retryWrites=true&w=majority&appName=Cluster0";

async function migrate() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('lumocart');
    
    // Migrate Carts
    console.log('\n🔄 Migrating carts...');
    const carts = await db.collection('carts').find({}).toArray();
    
    for (const cart of carts) {
      const cartItems = await db.collection('cart_items').find({ cartId: cart._id }).toArray();
      
      const items = cartItems.map(item => ({
        productId: item.productId.toString(),
        quantity: item.quantity,
        price: item.price
      }));
      
      await db.collection('carts').updateOne(
        { _id: cart._id },
        { $set: { items: items } }
      );
      
      console.log(`✅ Migrated cart ${cart._id} with ${items.length} items`);
    }
    
    // Migrate Orders
    console.log('\n🔄 Migrating orders...');
    const orders = await db.collection('orders').find({}).toArray();
    
    for (const order of orders) {
      const orderItems = await db.collection('order_items').find({ orderId: order._id }).toArray();
      
      const items = orderItems.map(item => ({
        productId: item.productId.toString(),
        quantity: item.quantity,
        price: item.price
      }));
      
      await db.collection('orders').updateOne(
        { _id: order._id },
        { $set: { items: items } }
      );
      
      console.log(`✅ Migrated order ${order._id} with ${items.length} items`);
    }
    
    console.log('\n✅ Migration completed!');
    console.log('\n⚠️  Old collections (cart_items, order_items) are still present.');
    console.log('   After verifying everything works, you can drop them with:');
    console.log('   db.collection("cart_items").drop()');
    console.log('   db.collection("order_items").drop()');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await client.close();
  }
}

migrate();
