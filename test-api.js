// Test all API endpoints
const BASE_URL = 'http://localhost:3000/api';

async function testAPI() {
  console.log('🧪 Testing Lumo API Endpoints\n');
  console.log('=' .repeat(50));
  
  try {
    // Test 1: Get Products
    console.log('\n📦 Test 1: GET /api/products');
    const productsRes = await fetch(`${BASE_URL}/products?limit=5`);
    const productsData = await productsRes.json();
    console.log(`   Status: ${productsRes.status}`);
    console.log(`   Products found: ${productsData.products?.length || 0}`);
    console.log(`   Total: ${productsData.pagination?.total || 0}`);
    
    // Test 2: Get Categories
    console.log('\n📁 Test 2: GET /api/categories');
    const categoriesRes = await fetch(`${BASE_URL}/categories`);
    const categoriesData = await categoriesRes.json();
    console.log(`   Status: ${categoriesRes.status}`);
    console.log(`   Categories found: ${categoriesData.categories?.length || 0}`);
    
    // Test 3: Get Single Product (if products exist)
    if (productsData.products && productsData.products.length > 0) {
      const productId = productsData.products[0].id;
      console.log(`\n🔍 Test 3: GET /api/products/${productId}`);
      const productRes = await fetch(`${BASE_URL}/products/${productId}`);
      const productData = await productRes.json();
      console.log(`   Status: ${productRes.status}`);
      console.log(`   Product: ${productData.product?.name || 'N/A'}`);
      console.log(`   Price: ₹${productData.product?.price || 0}`);
    }
    
    // Test 4: Test Auth Routes (should fail without auth)
    console.log('\n🔒 Test 4: GET /api/cart (without auth)');
    const cartRes = await fetch(`${BASE_URL}/cart`);
    const cartData = await cartRes.json();
    console.log(`   Status: ${cartRes.status}`);
    console.log(`   Expected 401: ${cartRes.status === 401 ? '✅' : '❌'}`);
    
    console.log('\n🔒 Test 5: GET /api/orders (without auth)');
    const ordersRes = await fetch(`${BASE_URL}/orders`);
    const ordersData = await ordersRes.json();
    console.log(`   Status: ${ordersRes.status}`);
    console.log(`   Expected 401: ${ordersRes.status === 401 ? '✅' : '❌'}`);
    
    // Test 6: Test featured products
    console.log('\n⭐ Test 6: GET /api/products?featured=true');
    const featuredRes = await fetch(`${BASE_URL}/products?featured=true`);
    const featuredData = await featuredRes.json();
    console.log(`   Status: ${featuredRes.status}`);
    console.log(`   Featured products: ${featuredData.products?.length || 0}`);
    
    // Test 7: Search products
    console.log('\n🔍 Test 7: GET /api/products?search=gift');
    const searchRes = await fetch(`${BASE_URL}/products?search=gift`);
    const searchData = await searchRes.json();
    console.log(`   Status: ${searchRes.status}`);
    console.log(`   Search results: ${searchData.products?.length || 0}`);
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ All API tests completed!\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  }
}

testAPI();
