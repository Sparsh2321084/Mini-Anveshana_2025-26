/**
 * Telegram Notification Service
 * 
 * Sends alerts via Telegram Bot API
 */

const TelegramBot = require('node-telegram-bot-api');

let bot;
let chatIds = [];

/**
 * Initialize Telegram Bot
 */
async function initTelegramBot() {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!token) {
      console.warn('⚠ TELEGRAM_BOT_TOKEN not set, Telegram notifications disabled');
      return;
    }
    
    bot = new TelegramBot(token, { polling: true });
    
    // Parse chat IDs from environment
    const chatIdStr = process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_CHAT_IDS;
    if (chatIdStr) {
      chatIds = chatIdStr.split(',').map(id => id.trim());
    }
    
    // Bot commands
    bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      
      if (!chatIds.includes(chatId.toString())) {
        chatIds.push(chatId.toString());
        console.log(`✓ New Telegram chat subscribed: ${chatId}`);
      }
      
      bot.sendMessage(chatId, 
        `🤖 *ESP32 IoT Alert Bot*\n\n` +
        `Welcome! You will receive alerts when:\n` +
        `🌡️ Temperature exceeds thresholds\n` +
        `💧 Humidity exceeds thresholds\n` +
        `🚶 Motion is detected\n\n` +
        `Commands:\n` +
        `/status - Get current sensor readings\n` +
        `/config - View alert thresholds\n` +
        `/stop - Unsubscribe from alerts`,
        { parse_mode: 'Markdown' }
      );
    });
    
    bot.onText(/\/stop/, (msg) => {
      const chatId = msg.chat.id;
      chatIds = chatIds.filter(id => id !== chatId.toString());
      bot.sendMessage(chatId, '👋 You have been unsubscribed from alerts.');
      console.log(`✓ Chat unsubscribed: ${chatId}`);
    });
    
    bot.onText(/\/status/, async (msg) => {
      const chatId = msg.chat.id;
      try {
        // Get in-memory sensor data
        const sensorController = require('../controllers/sensorController');
        const latestData = sensorController.getLatestData();
        
        if (!latestData) {
          return bot.sendMessage(chatId, '❌ No sensor data available');
        }
        
        const message = 
          `📊 *Current Sensor Status*\n\n` +
          `🌡️ Temperature: ${latestData.temperature}°C\n` +
          `💧 Humidity: ${latestData.humidity}%\n` +
          `🚶 Motion: ${latestData.motion ? 'Detected' : 'None'}\n` +
          `⏰ Last update: ${new Date(latestData.timestamp).toLocaleString()}`;
        
        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      } catch (error) {
        bot.sendMessage(chatId, '❌ Error fetching sensor data');
      }
    });
    
    bot.onText(/\/config/, async (msg) => {
      const chatId = msg.chat.id;
      try {
        // Default thresholds from environment
        const thresholds = {
          temperatureHigh: parseFloat(process.env.TEMP_HIGH_THRESHOLD) || 35,
          temperatureLow: parseFloat(process.env.TEMP_LOW_THRESHOLD) || 15,
          humidityHigh: parseFloat(process.env.HUMIDITY_HIGH_THRESHOLD) || 70,
          humidityLow: parseFloat(process.env.HUMIDITY_LOW_THRESHOLD) || 30,
          motionDetection: true
        };
        
        const message = 
          `⚙️ *Alert Configuration*\n\n` +
          `🌡️ Temperature High: >${thresholds.temperatureHigh}°C\n` +
          `🌡️ Temperature Low: <${thresholds.temperatureLow}°C\n` +
          `💧 Humidity High: >${thresholds.humidityHigh}%\n` +
          `💧 Humidity Low: <${thresholds.humidityLow}%\n` +
          `🚶 Motion Detection: ${thresholds.motionDetection ? 'Enabled' : 'Disabled'}`;
        
        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      } catch (error) {
        bot.sendMessage(chatId, '❌ Error fetching configuration');
      }
    });
    
    console.log('✓ Telegram bot is active');
    console.log(`  Subscribed chats: ${chatIds.length}`);
    
  } catch (error) {
    console.error('❌ Failed to initialize Telegram bot:', error.message);
  }
}

/**
 * Send alert message to all subscribed users
 */
async function sendTelegramAlert(alert) {
  if (!bot || chatIds.length === 0) {
    console.log('⚠ No Telegram recipients configured');
    return false;
  }
  
  try {
    const emoji = getAlertEmoji(alert.type);
    const message = 
      `⚠️ *${emoji} ALERT*\n\n` +
      `Type: ${alert.type.replace(/_/g, ' ').toUpperCase()}\n` +
      `Message: ${alert.message}\n` +
      `Value: ${alert.value}\n` +
      `Threshold: ${alert.threshold}\n` +
      `Device: ${alert.deviceId}\n` +
      `Time: ${new Date(alert.createdAt).toLocaleString()}`;
    
    for (const chatId of chatIds) {
      await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    }
    
    console.log(`✓ Telegram alert sent to ${chatIds.length} recipient(s)`);
    return true;
    
  } catch (error) {
    console.error('❌ Failed to send Telegram alert:', error.message);
    return false;
  }
}

/**
 * Get emoji for alert type
 */
function getAlertEmoji(type) {
  const emojiMap = {
    'temperature_high': '🔥',
    'temperature_low': '❄️',
    'humidity_high': '💧',
    'humidity_low': '🌵',
    'motion_detected': '🚶'
  };
  return emojiMap[type] || '⚠️';
}

/**
 * Get subscribed chat IDs
 */
function getChatIds() {
  return chatIds;
}

module.exports = {
  initTelegramBot,
  sendTelegramAlert,
  getChatIds
};
