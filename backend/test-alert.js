/**
 * Test Alert System
 * Simulates sensor data that would trigger alerts
 */

require('dotenv').config();

console.log('🧪 Testing Alert System...\n');

// Simulate the alert service
const { checkThresholds } = require('./src/services/alertService');
const { initTelegramBot } = require('./src/services/telegramService');

async function runTest() {
  // Initialize Telegram bot first
  console.log('1. Initializing Telegram Bot...');
  await initTelegramBot();
  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s for bot to connect
  
  // Test data that SHOULD trigger alerts
  const testCases = [
    {
      name: 'HIGH TEMPERATURE',
      data: {
        temperature: 40,  // Above 35°C threshold
        humidity: 50,
        motion: false,
        deviceId: 'TEST_ESP32',
        timestamp: new Date()
      }
    },
    {
      name: 'LOW TEMPERATURE',
      data: {
        temperature: 10,  // Below 15°C threshold
        humidity: 50,
        motion: false,
        deviceId: 'TEST_ESP32',
        timestamp: new Date()
      }
    },
    {
      name: 'HIGH HUMIDITY',
      data: {
        temperature: 25,
        humidity: 75,  // Above 70% threshold
        motion: false,
        deviceId: 'TEST_ESP32',
        timestamp: new Date()
      }
    },
    {
      name: 'MOTION DETECTED',
      data: {
        temperature: 25,
        humidity: 50,
        motion: true,  // Motion detected
        deviceId: 'TEST_ESP32',
        timestamp: new Date()
      }
    }
  ];
  
  console.log('\n2. Running Test Cases...\n');
  
  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.name}`);
    console.log(`  Data: Temp=${testCase.data.temperature}°C, Humidity=${testCase.data.humidity}%, Motion=${testCase.data.motion}`);
    
    try {
      const alerts = await checkThresholds(testCase.data);
      
      if (alerts && alerts.length > 0) {
        console.log(`  ✓ Alert triggered: ${alerts[0].type}`);
        console.log(`  Message: ${alerts[0].message}`);
      } else {
        console.log(`  ⚠ No alert triggered (check thresholds)`);
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
    
    console.log('');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s between tests
  }
  
  console.log('\n✅ Test completed! Check your Telegram app for messages.\n');
  console.log('📱 If you didn\'t receive messages:');
  console.log('   1. Make sure you sent /start to your bot');
  console.log('   2. Check that bot token and chat ID are correct');
  console.log('   3. Verify bot is running on Render with correct env vars\n');
  
  process.exit(0);
}

runTest().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
