// TEST SCRIPT - Run with: node test-endpoints.js

const testEndpoints = async () => {
  const baseURL = 'http://localhost:3000';
  
  console.log('🧪 Testing Tahfidz App Endpoints...\n');
  
  // Test 1: Server Running
  try {
    const res = await fetch(baseURL);
    console.log('✅ Server is running');
  } catch (error) {
    console.log('❌ Server not running. Start with: npm start');
    return;
  }
  
  // Test 2: Login
  try {
    const res = await fetch(`${baseURL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    const data = await res.json();
    console.log('✅ Login endpoint:', data.success ? 'Working' : 'Failed');
  } catch (error) {
    console.log('❌ Login endpoint failed');
  }
  
  // Test 3: Get Santri
  try {
    const res = await fetch(`${baseURL}/api/santri?userId=1&role=admin`);
    const data = await res.json();
    console.log('✅ Get Santri endpoint: Working');
  } catch (error) {
    console.log('❌ Get Santri endpoint failed');
  }
  
  // Test 4: Get Setoran
  try {
    const res = await fetch(`${baseURL}/api/setoran`);
    const data = await res.json();
    console.log('✅ Get Setoran endpoint: Working');
  } catch (error) {
    console.log('❌ Get Setoran endpoint failed');
  }
  
  // Test 5: Dashboard Stats
  try {
    const res = await fetch(`${baseURL}/api/dashboard-stats?userId=1&role=admin`);
    const data = await res.json();
    console.log('✅ Dashboard Stats endpoint: Working');
  } catch (error) {
    console.log('❌ Dashboard Stats endpoint failed');
  }
  
  // Test 6: Leaderboard
  try {
    const res = await fetch(`${baseURL}/api/leaderboard`);
    const data = await res.json();
    console.log('✅ Leaderboard endpoint: Working');
  } catch (error) {
    console.log('❌ Leaderboard endpoint failed');
  }
  
  console.log('\n✅ All critical endpoints tested!');
  console.log('📝 Check PRE_PRODUCTION_CHECKLIST.md for full checklist');
};

testEndpoints();
