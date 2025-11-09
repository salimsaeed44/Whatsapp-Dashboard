/**
 * Test Send WhatsApp Message
 * Simple script to test sending messages via WhatsApp API
 */

require('dotenv').config();
const whatsappService = require('./services/whatsapp/whatsapp.service');

async function testSendMessage() {
  try {
    console.log('🧪 Testing WhatsApp Message Sending...\n');

    // Check configuration
    if (!whatsappService.isConfigured()) {
      console.error('❌ WhatsApp service is not configured!');
      console.log('Please check your .env file:');
      console.log('  - META_ACCESS_TOKEN');
      console.log('  - WHATSAPP_PHONE_ID');
      return;
    }

    console.log('✅ Configuration check passed\n');

    // Test phone number (replace with your test number)
    const testPhoneNumber = '967773812563'; // Without + prefix
    const testMessage = 'رسالة اختبار من النظام - سالم سعيد';

    console.log(`📤 Sending test message to: ${testPhoneNumber}`);
    console.log(`💬 Message: ${testMessage}\n`);

    // Send message
    const result = await whatsappService.sendTextMessage(testPhoneNumber, testMessage);

    console.log('✅ Message sent successfully!');
    console.log('📊 Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Error sending message:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Message:', error.message);
    }
  }
}

// Run test
testSendMessage();





