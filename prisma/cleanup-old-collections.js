const { MongoClient } = require('mongodb');
require('dotenv').config();

async function cleanupOldCollections() {
  const client = new MongoClient(process.env.DATABASE_URL);

  try {
    await client.connect();
    console.log('Connected to MongoDB...');

    const db = client.db();

    // Check if old collections exist
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    console.log('\nCurrent collections:', collectionNames);

    const oldCollections = ['cart_items', 'order_items'];
    const collectionsToDelete = oldCollections.filter(name => 
      collectionNames.includes(name)
    );

    if (collectionsToDelete.length === 0) {
      console.log('\n✅ No old collections to clean up!');
      return;
    }

    console.log('\n⚠️  Found old collections to delete:', collectionsToDelete);

    // Count documents before deletion
    for (const collectionName of collectionsToDelete) {
      const count = await db.collection(collectionName).countDocuments();
      console.log(`   ${collectionName}: ${count} documents`);
    }

    console.log('\n⚠️  WARNING: This will permanently delete these collections!');
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');

    // Wait 5 seconds before deletion
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Delete old collections
    for (const collectionName of collectionsToDelete) {
      await db.collection(collectionName).drop();
      console.log(`✅ Dropped collection: ${collectionName}`);
    }

    console.log('\n✅ Cleanup completed successfully!');
    console.log('\nRemaining collections:', 
      (await db.listCollections().toArray()).map(c => c.name)
    );

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\nDisconnected from MongoDB.');
  }
}

// Run the cleanup
cleanupOldCollections();
