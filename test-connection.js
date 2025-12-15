const https = require('https');

https.get('https://cluster0.yjovwvc.mongodb.net', (res) => {
  console.log('✅ MongoDB Atlas is accessible');
  console.log(`Status: ${res.statusCode}`);
}).on('error', (err) => {
  console.log('❌ Cannot reach MongoDB Atlas:', err.message);
});
