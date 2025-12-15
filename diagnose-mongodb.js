#!/usr/bin/env node

/**
 * MongoDB Connection Diagnostic Tool
 * Helps identify and fix MongoDB authentication issues
 */

const { MongoClient } = require('mongodb');
const path = require('path');

console.log('🔍 MongoDB Connection Diagnostic Tool');
console.log('=====================================\n');

// Test various connection strings
const testConnections = [
  {
    name: 'Current .env.local URL',
    url: 'mongodb+srv://plsathish0721_db_user:zFIBbJV1IjeOI3xj@cluster0.yjovwvc.mongodb.net/lumocart?retryWrites=true&w=majority'
  },
  {
    name: 'Current URL without query params',
    url: 'mongodb+srv://plsathish0721_db_user:zFIBbJV1IjeOI3xj@cluster0.yjovwvc.mongodb.net/lumocart'
  },
  {
    name: 'Test with admin database',
    url: 'mongodb+srv://plsathish0721_db_user:zFIBbJV1IjeOI3xj@cluster0.yjovwvc.mongodb.net/admin?retryWrites=true&w=majority'
  }
];

async function testConnection(name, connectionString) {
  return new Promise((resolve) => {
    console.log(`Testing: ${name}`);
    console.log(`URL: ${connectionString.replace(/:[^@]*@/, ':****@')}`);
    
    const client = new MongoClient(connectionString, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });

    const timer = setTimeout(() => {
      client.close();
      console.log('❌ Connection timeout\n');
      resolve({ success: false, error: 'Timeout' });
    }, 6000);

    client.connect()
      .then(async () => {
        clearTimeout(timer);
        try {
          // Try to get database info
          const adminDb = client.db('admin');
          const serverInfo = await adminDb.admin().serverStatus();
          console.log('✅ Connected successfully!');
          console.log(`   MongoDB Version: ${serverInfo.version}\n`);
          await client.close();
          resolve({ success: true, error: null });
        } catch (err) {
          console.log(`✅ Connected but admin access denied (expected)\n`);
          await client.close();
          resolve({ success: true, error: null });
        }
      })
      .catch((err) => {
        clearTimeout(timer);
        console.log(`❌ Connection failed`);
        console.log(`   Error: ${err.message}\n`);
        resolve({ success: false, error: err.message });
      });
  });
}

async function runDiagnostics() {
  console.log('Testing connection strings...\n');
  
  for (const test of testConnections) {
    await testConnection(test.name, test.url);
  }

  console.log('\n📋 DIAGNOSIS SUMMARY');
  console.log('====================\n');
  console.log('If all tests failed with "SCRAM failure: bad auth":\n');
  console.log('1. ❌ MongoDB credentials are INVALID');
  console.log('   - Username: plsathish0721_db_user');
  console.log('   - Password: zFIBbJV1IjeOI3xj');
  console.log('   - Database: lumocart');
  console.log('   - Cluster: cluster0.yjovwvc.mongodb.net\n');
  
  console.log('🔧 SOLUTIONS:\n');
  console.log('Option 1: Update MongoDB Credentials');
  console.log('-'.repeat(50));
  console.log('1. Go to MongoDB Atlas: https://cloud.mongodb.com');
  console.log('2. Login with your credentials');
  console.log('3. Navigate to Database > Users');
  console.log('4. Reset the password or create a new user');
  console.log('5. Update .env.local with correct credentials');
  console.log('6. Restart the dev server: npm run dev\n');
  
  console.log('Option 2: Use Local MongoDB');
  console.log('-'.repeat(50));
  console.log('1. Install MongoDB Community Edition');
  console.log('2. Start MongoDB: mongod');
  console.log('3. Update .env.local:');
  console.log('   DATABASE_URL=mongodb://localhost:27017/lumocart');
  console.log('4. Restart the dev server\n');
  
  console.log('Option 3: Use MongoDB Atlas Test Cluster');
  console.log('-'.repeat(50));
  console.log('1. Create new MongoDB Atlas cluster (free tier)');
  console.log('2. Create new database user');
  console.log('3. Get connection string');
  console.log('4. Update .env.local with new URL');
  console.log('5. Restart the dev server\n');

  console.log('📝 CURRENT .env.local:');
  console.log('-'.repeat(50));
  console.log('Check c:\\Projects\\lumocart\\.env.local');
  console.log('DATABASE_URL must be valid MongoDB connection string\n');
}

runDiagnostics().catch(console.error);
