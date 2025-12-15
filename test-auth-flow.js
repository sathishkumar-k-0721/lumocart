const http = require('http');

// Test data
const testUser = {
  name: 'Test User',
  email: `test-${Date.now()}@example.com`,
  password: 'TestPassword123'
};

console.log('🧪 Testing Authentication Flow');
console.log('================================\n');

// Function to make HTTP requests
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', (e) => {
      console.error('Request error:', e.message);
      reject(e);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function runTests() {
  try {
    // Test 1: Register a new user
    console.log('Test 1: Register a new user');
    console.log('---------------------------');
    const registerRes = await makeRequest('POST', '/api/auth/register', testUser);
    console.log(`Status: ${registerRes.status}`);
    console.log(`Response:`, registerRes.data);
    console.log();

    if (registerRes.status !== 201) {
      console.error('❌ Registration failed!');
      return;
    }

    console.log('✅ Registration successful!');
    console.log(`Email: ${testUser.email}`);
    console.log(`Password: ${testUser.password}\n`);

    // Test 2: Try to register with same email (should fail)
    console.log('Test 2: Try to register with duplicate email');
    console.log('-------------------------------------------');
    const duplicateRes = await makeRequest('POST', '/api/auth/register', testUser);
    console.log(`Status: ${duplicateRes.status}`);
    console.log(`Response:`, duplicateRes.data);
    console.log();

    if (duplicateRes.status === 400) {
      console.log('✅ Correctly rejected duplicate email!');
    }
    console.log();

    // Test 3: Test invalid email
    console.log('Test 3: Try to register with invalid email');
    console.log('-----------------------------------------');
    const invalidEmailRes = await makeRequest('POST', '/api/auth/register', {
      name: 'Invalid User',
      email: 'not-an-email',
      password: 'Password123'
    });
    console.log(`Status: ${invalidEmailRes.status}`);
    console.log(`Response:`, invalidEmailRes.data);
    console.log();

    if (invalidEmailRes.status === 400) {
      console.log('✅ Correctly rejected invalid email!');
    }
    console.log();

    // Test 4: Test short password
    console.log('Test 4: Try to register with short password');
    console.log('-------------------------------------------');
    const shortPassRes = await makeRequest('POST', '/api/auth/register', {
      name: 'Short Pass User',
      email: `test-short-${Date.now()}@example.com`,
      password: '123'
    });
    console.log(`Status: ${shortPassRes.status}`);
    console.log(`Response:`, shortPassRes.data);
    console.log();

    if (shortPassRes.status === 400) {
      console.log('✅ Correctly rejected short password!');
    }
    console.log();

    console.log('================================');
    console.log('✅ All tests completed!');
    console.log(`\nYou can now test login with:`);
    console.log(`Email: ${testUser.email}`);
    console.log(`Password: ${testUser.password}`);
    console.log(`\nVisit: http://localhost:3000/login`);

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Details:', error.message);
    console.error('Stack:', error.stack);
  }
}

runTests();
