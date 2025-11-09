/**
 * Test Render Webhook
 * Test webhook verification on Render deployment
 */

// For Node.js < 18, use node-fetch or axios
// For Node.js >= 18, fetch is available globally
const axios = require('axios');

const RENDER_URL = 'https://whatsapp-dashboard-encw.onrender.com';

async function testWebhook() {
  console.log('🧪 Testing Render Webhook...\n');

  // Test 1: Health Check
  console.log('[1/3] Testing Health Check...');
  try {
    const healthResponse = await axios.get(`${RENDER_URL}/health`);
    console.log('✅ Health Check:', healthResponse.data);
  } catch (error) {
    console.error('❌ Health Check failed:', error.message);
  }
  console.log();

  // Test 2: Webhook Verification
  console.log('[2/3] Testing Webhook Verification...');
  try {
    const verifyUrl = `${RENDER_URL}/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=12345&hub.challenge=TEST_CHALLENGE`;
    const verifyResponse = await axios.get(verifyUrl);
    const verifyText = verifyResponse.data;
    
    if (verifyText === 'TEST_CHALLENGE') {
      console.log('✅ Webhook Verification: SUCCESS');
      console.log('   Response:', verifyText);
    } else {
      console.log('❌ Webhook Verification: FAILED');
      console.log('   Expected: TEST_CHALLENGE');
      console.log('   Got:', verifyText);
    }
  } catch (error) {
    console.error('❌ Webhook Verification error:', error.response?.data || error.message);
  }
  console.log();

  // Test 3: API Root
  console.log('[3/3] Testing API Root...');
  try {
    const rootResponse = await axios.get(RENDER_URL);
    console.log('✅ API Root:', rootResponse.data);
  } catch (error) {
    console.error('❌ API Root failed:', error.message);
  }
  console.log();

  console.log('✅ Testing Complete!');
  console.log('\n📝 Next Steps:');
  console.log('1. Configure Webhook in Meta Developer Console:');
  console.log(`   URL: ${RENDER_URL}/api/whatsapp/webhook`);
  console.log('   Verify Token: 12345');
  console.log('   Subscribe to: messages');
}

// Run test
testWebhook();

