const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://lumo_user:Poiuytrewq97@cluster0.49tkxni.mongodb.net/lumocart?retryWrites=true&w=majority";

async function testConnection() {
  console.log('Testing MongoDB connection...');
  const startTime = Date.now();
  
  try {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    
    console.log('Connecting...');
    await client.connect();
    const connectTime = Date.now();
    console.log(`✓ Connected in ${connectTime - startTime}ms`);
    
    console.log('Testing query...');
    const db = client.db('lumocart');
    const products = await db.collection('products').find().limit(1).toArray();
    const queryTime = Date.now();
    console.log(`✓ Query completed in ${queryTime - connectTime}ms`);
    console.log(`✓ Total time: ${queryTime - startTime}ms`);
    console.log(`✓ Found ${products.length} product(s)`);
    
    await client.close();
    process.exit(0);
  } catch (error) {
    const errorTime = Date.now();
    console.error(`✗ Error after ${errorTime - startTime}ms:`, error.message);
    process.exit(1);
  }
}

testConnection();
