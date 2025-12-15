// Comprehensive API Endpoint Test Script
const BASE_URL = 'http://localhost:3000';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`)
};

let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

async function testEndpoint(name, method, url, body = null, expectedStatus = 200) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${url}`, options);
    const data = await response.json().catch(() => null);

    if (response.status === expectedStatus) {
      log.success(`${name}: ${response.status}`);
      testResults.passed++;
      testResults.tests.push({ name, status: 'PASS', code: response.status });
      return { success: true, data, response };
    } else {
      log.error(`${name}: Expected ${expectedStatus}, got ${response.status}`);
      testResults.failed++;
      testResults.tests.push({ name, status: 'FAIL', code: response.status });
      return { success: false, data, response };
    }
  } catch (error) {
    log.error(`${name}: ${error.message}`);
    testResults.failed++;
    testResults.tests.push({ name, status: 'ERROR', error: error.message });
    return { success: false, error };
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 LUMO E-COMMERCE API FUNCTIONAL TESTS');
  console.log('='.repeat(60) + '\n');

  // Test 1: Products API
  log.info('Test 1: Products API');
  const productsTest = await testEndpoint(
    'GET /api/products',
    'GET',
    '/api/products'
  );
  
  let testProductId = null;
  if (productsTest.success && productsTest.data?.products?.length > 0) {
    testProductId = productsTest.data.products[0].id;
    log.info(`  Found ${productsTest.data.products.length} products`);
    log.info(`  Using product ID: ${testProductId} for further tests`);
  }

  // Test 2: Single Product API
  if (testProductId) {
    log.info('\nTest 2: Single Product API');
    await testEndpoint(
      'GET /api/products/[id]',
      'GET',
      `/api/products/${testProductId}`
    );
  } else {
    log.warn('\nTest 2: Skipped (no product ID available)');
  }

  // Test 3: Categories API
  log.info('\nTest 3: Categories API');
  await testEndpoint(
    'GET /api/categories',
    'GET',
    '/api/categories'
  );

  // Test 4: Register API
  log.info('\nTest 4: User Registration API');
  const randomEmail = `test${Date.now()}@test.com`;
  const registerTest = await testEndpoint(
    'POST /api/auth/register',
    'POST',
    '/api/auth/register',
    {
      name: 'Test User',
      email: randomEmail,
      password: 'Test123!@#'
    },
    201
  );

  let authToken = null;
  if (registerTest.success && registerTest.data?.token) {
    authToken = registerTest.data.token;
    log.info(`  Token received: ${authToken.substring(0, 20)}...`);
  }

  // Test 5: Login API
  log.info('\nTest 5: User Login API');
  const loginTest = await testEndpoint(
    'POST /api/auth/login',
    'POST',
    '/api/auth/login',
    {
      email: randomEmail,
      password: 'Test123!@#'
    }
  );

  if (loginTest.success && loginTest.data?.token) {
    authToken = loginTest.data.token;
  }

  // Test 6: Cart API - Add Item
  if (testProductId) {
    log.info('\nTest 6: Add to Cart API');
    await testEndpoint(
      'POST /api/cart/add',
      'POST',
      '/api/cart/add',
      {
        productId: testProductId,
        quantity: 2
      }
    );
  }

  // Test 7: Cart API - Get Cart
  log.info('\nTest 7: Get Cart API');
  await testEndpoint(
    'GET /api/cart',
    'GET',
    '/api/cart'
  );

  // Test 8: Cart API - Update Quantity
  if (testProductId) {
    log.info('\nTest 8: Update Cart Quantity API');
    await testEndpoint(
      'PUT /api/cart/update',
      'PUT',
      '/api/cart/update',
      {
        productId: testProductId,
        quantity: 3
      }
    );
  }

  // Test 9: Cart API - Remove Item
  if (testProductId) {
    log.info('\nTest 9: Remove from Cart API');
    await testEndpoint(
      'DELETE /api/cart/remove',
      'DELETE',
      '/api/cart/remove',
      {
        productId: testProductId
      }
    );
  }

  // Test 10: Orders API - Create Order
  log.info('\nTest 10: Create Order API');
  await testEndpoint(
    'POST /api/orders',
    'POST',
    '/api/orders',
    {
      shippingAddress: {
        fullName: 'Test User',
        address: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456',
        phone: '1234567890'
      },
      billingAddress: {
        fullName: 'Test User',
        address: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456',
        phone: '1234567890'
      },
      paymentMethod: 'razorpay'
    }
  );

  // Test 11: Orders API - Get Orders
  log.info('\nTest 11: Get Orders API');
  await testEndpoint(
    'GET /api/orders',
    'GET',
    '/api/orders'
  );

  // Print Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`${colors.green}Passed: ${testResults.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${testResults.failed}${colors.reset}`);
  console.log(`Total: ${testResults.passed + testResults.failed}`);
  console.log('='.repeat(60) + '\n');

  if (testResults.failed > 0) {
    console.log('❌ Failed Tests:');
    testResults.tests
      .filter(t => t.status !== 'PASS')
      .forEach(t => {
        console.log(`  - ${t.name} (${t.status})`);
      });
    console.log('');
  } else {
    console.log('✅ All tests passed!\n');
  }

  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
