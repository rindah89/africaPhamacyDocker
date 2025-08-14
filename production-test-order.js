// Production Order Test Script
// Run this in the browser console on your production site

async function testProductionOrder() {
  console.log('🧪 Testing Production Order Creation...\n');
  
  // Test 1: Check if we can reach the API
  console.log('1️⃣ Testing API connectivity...');
  try {
    const apiTest = await fetch('/api/v1/orders', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('API Response:', apiTest.status, apiTest.statusText);
    if (!apiTest.ok) {
      const text = await apiTest.text();
      console.error('API Error:', text);
    }
  } catch (error) {
    console.error('API Connection Failed:', error);
  }
  
  // Test 2: Try to call processPaymentAndOrder directly
  console.log('\n2️⃣ Testing processPaymentAndOrder...');
  
  // Sample test data
  const testOrderData = {
    orderItems: [{
      id: 'test-product-id',
      name: 'Test Product',
      price: 1000,
      qty: 1,
      productThumbnail: ''
    }],
    orderAmount: 1000,
    orderType: 'sale',
    source: 'pos'
  };
  
  const testCustomerData = {
    customerId: '6708677a078944327c4629e5',
    customerName: 'Test Customer',
    customerEmail: 'test@test.com'
  };
  
  console.log('Test data:', {
    orderData: testOrderData,
    customerData: testCustomerData,
    orderNumber: 'TEST-' + Date.now(),
    amountPaid: 1000
  });
  
  // Test 3: Check localStorage/sessionStorage
  console.log('\n3️⃣ Checking browser storage...');
  console.log('LocalStorage keys:', Object.keys(localStorage));
  console.log('SessionStorage keys:', Object.keys(sessionStorage));
  
  // Test 4: Check for any global errors
  console.log('\n4️⃣ Checking window error handlers...');
  window.addEventListener('error', (e) => {
    console.error('Global error caught:', e);
  });
  
  window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e);
  });
  
  console.log('\n✅ Test complete. Check the console output above for issues.');
  console.log('💡 Also check the Network tab for any failed requests when creating an order.');
}

// Run the test
testProductionOrder();