/**
 * Test Motion Detection Alert
 * Simulates ESP32 sending motion=true to trigger alert
 */

require('dotenv').config();
const axios = require('axios');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

async function testMotionAlert() {
  console.log('🧪 Testing Motion Detection Alert...\n');
  
  // Send data WITH motion detected
  const testData = {
    device_id: 'TEST_ESP32_MOTION',
    sensors: {
      temperature: 25,
      humidity: 50,
      motion: true  // MOTION DETECTED
    },
    timestamp: new Date().toISOString()
  };
  
  console.log('📤 Sending sensor data with motion=true...');
  console.log(JSON.stringify(testData, null, 2));
  
  try {
    const response = await axios.post(`${BACKEND_URL}/api/sensors/data`, testData);
    
    console.log('\n✅ Response:', response.data);
    console.log(`\n📱 Alerts triggered: ${response.data.alertsTriggered}`);
    
    if (response.data.alertsTriggered > 0) {
      console.log('✅ Motion alert should have been sent to Telegram!');
      console.log('📱 Check your Telegram app for the notification.');
    } else {
      console.log('⚠️ No alerts triggered. Possible reasons:');
      console.log('   - Alert cooldown active (5 minutes since last alert)');
      console.log('   - Motion detection disabled in thresholds');
      console.log('   - Telegram bot not configured');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testMotionAlert();
