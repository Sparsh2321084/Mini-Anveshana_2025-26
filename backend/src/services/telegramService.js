/**
 * Telegram Notification Service
 * 
 * Sends alerts via Telegram Bot API
 */

const TelegramBot = require('node-telegram-bot-api');
const { getThresholds, updateThresholds, resetThresholds } = require('../config/thresholds');

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
        `*Commands:*\n` +
        `/status` + ` \\- Get current sensor readings\n` +
        `/quality` + ` \\- Check grain quality analysis\n` +
        `/config` + ` \\- View alert thresholds\n` +
        `/settemp <high> <low>` + ` \\- Set temperature thresholds\n` +
        `/sethumidity <high> <low>` + ` \\- Set humidity thresholds\n` +
        `/resetconfig` + ` \\- Reset to default thresholds\n` +
        `/stop` + ` \\- Unsubscribe from alerts`,
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
        // Get in-memory sensor data directly
        const sensorController = require('../controllers/sensorController');
        const latestData = sensorController.latestSensorData;
        
        if (!latestData || !latestData.timestamp) {
          return bot.sendMessage(chatId, '❌ No sensor data available yet. Waiting for ESP32...');
        }
        
        const escapeMarkdown = (text) => {
          return String(text).replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
        };
        
        // Format time in IST (India Standard Time)
        const istTime = new Date(latestData.timestamp).toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          dateStyle: 'medium',
          timeStyle: 'medium'
        });
        
        const message = 
          `📊 *Current Sensor Status*\n\n` +
          `🌡️ *Temperature:* ${escapeMarkdown(latestData.temperature)}°C\n` +
          `💧 *Humidity:* ${escapeMarkdown(latestData.humidity)}%\n` +
          `🚶 *Motion:* ${latestData.motion ? 'Detected' : 'None'}\n` +
          `⏰ *Last update:* ${escapeMarkdown(istTime)}`;
        
        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      } catch (error) {
        console.error('Status command error:', error);
        bot.sendMessage(chatId, '❌ Error fetching sensor data');
      }
    });
    
    // Quality analysis command
    bot.onText(/\/quality/, async (msg) => {
      const chatId = msg.chat.id;
      try {
        const sensorController = require('../controllers/sensorController');
        const latestData = sensorController.latestSensorData;
        
        if (!latestData || !latestData.quality) {
          return bot.sendMessage(chatId, '❌ No quality data available yet. Waiting for sensor readings...');
        }
        
        const q = latestData.quality;
        const escapeMarkdown = (text) => {
          return String(text).replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
        };
        
        let message = `🌾 *GRAIN QUALITY ANALYSIS*\n\n`;
        message += `${q.status}\n`;
        message += `📊 *Score:* ${q.score}/100\n`;
        message += `🏆 *Grade:* ${q.grade}\n`;
        message += `💧 *Moisture:* ${q.humidity}\n`;
        message += `📦 *Estimated Shelf Life:* ${escapeMarkdown(q.shelfLife)}\n\n`;
        
        if (q.hasIssues) {
          message += `⚠️ *Issues Detected:*\n`;
          q.details.issues.forEach((issue, i) => {
            message += `${i + 1}\\. ${escapeMarkdown(issue)}\n`;
          });
          message += `\n`;
        }
        
        if (q.details.recommendations.length > 0) {
          message += `💡 *Recommendations:*\n`;
          q.details.recommendations.slice(0, 3).forEach((rec, i) => {
            message += `${i + 1}\\. ${escapeMarkdown(rec)}\n`;
          });
        }
        
        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      } catch (error) {
        console.error('Quality command error:', error);
        bot.sendMessage(chatId, '❌ Error fetching quality analysis');
      }
    });
    
    bot.onText(/\/config/, async (msg) => {
      const chatId = msg.chat.id;
      try {
        const thresholds = getThresholds();
        
        const escapeMarkdown = (text) => {
          return String(text).replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
        };
        
        const message = 
          `⚙️ *Alert Configuration*\n\n` +
          `🌡️ *Temperature High:* >${escapeMarkdown(thresholds.temperatureHigh)}°C\n` +
          `🌡️ *Temperature Low:* <${escapeMarkdown(thresholds.temperatureLow)}°C\n` +
          `💧 *Humidity High:* >${escapeMarkdown(thresholds.humidityHigh)}%\n` +
          `💧 *Humidity Low:* <${escapeMarkdown(thresholds.humidityLow)}%\n` +
          `🚶 *Motion Detection:* ${thresholds.motionDetection ? 'Enabled' : 'Disabled'}\n\n` +
          `To change thresholds, use:\n` +
          `/settemp <high> <low>` + ` \\- e.g. /settemp 40 10\n` +
          `/sethumidity <high> <low>` + ` \\- e.g. /sethumidity 80 20\n` +
          `/resetconfig` + ` \\- Reset to defaults`;
        
        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      } catch (error) {
        console.error('Config command error:', error);
        bot.sendMessage(chatId, '❌ Error fetching configuration');
      }
    });
    
    // Set temperature thresholds
    bot.onText(/\/settemp (\d+\.?\d*) (\d+\.?\d*)/, async (msg, match) => {
      const chatId = msg.chat.id;
      try {
        const high = parseFloat(match[1]);
        const low = parseFloat(match[2]);
        
        if (high <= low) {
          return bot.sendMessage(chatId, '❌ High threshold must be greater than low threshold');
        }
        
        if (high > 100 || low < -50) {
          return bot.sendMessage(chatId, '❌ Invalid temperature range (must be between -50°C and 100°C)');
        }
        
        updateThresholds({
          temperatureHigh: high,
          temperatureLow: low
        });
        
        const escapeMarkdown = (text) => {
          return String(text).replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
        };
        
        bot.sendMessage(
          chatId,
          `✅ *Temperature thresholds updated*\n\n` +
          `High: >${escapeMarkdown(high)}°C\n` +
          `Low: <${escapeMarkdown(low)}°C`,
          { parse_mode: 'Markdown' }
        );
        
        console.log(`✓ Temperature thresholds updated by ${chatId}: High=${high}°C, Low=${low}°C`);
      } catch (error) {
        console.error('Settemp command error:', error);
        bot.sendMessage(chatId, '❌ Error: Use format /settemp <high> <low> (e.g., /settemp 40 10)');
      }
    });
    
    // Set humidity thresholds
    bot.onText(/\/sethumidity (\d+\.?\d*) (\d+\.?\d*)/, async (msg, match) => {
      const chatId = msg.chat.id;
      try {
        const high = parseFloat(match[1]);
        const low = parseFloat(match[2]);
        
        if (high <= low) {
          return bot.sendMessage(chatId, '❌ High threshold must be greater than low threshold');
        }
        
        if (high > 100 || low < 0) {
          return bot.sendMessage(chatId, '❌ Invalid humidity range (must be between 0% and 100%)');
        }
        
        updateThresholds({
          humidityHigh: high,
          humidityLow: low
        });
        
        const escapeMarkdown = (text) => {
          return String(text).replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
        };
        
        bot.sendMessage(
          chatId,
          `✅ *Humidity thresholds updated*\n\n` +
          `High: >${escapeMarkdown(high)}%\n` +
          `Low: <${escapeMarkdown(low)}%`,
          { parse_mode: 'Markdown' }
        );
        
        console.log(`✓ Humidity thresholds updated by ${chatId}: High=${high}%, Low=${low}%`);
      } catch (error) {
        console.error('Sethumidity command error:', error);
        bot.sendMessage(chatId, '❌ Error: Use format /sethumidity <high> <low> (e.g., /sethumidity 80 20)');
      }
    });
    
    // Reset to default thresholds
    bot.onText(/\/resetconfig/, async (msg) => {
      const chatId = msg.chat.id;
      try {
        const thresholds = resetThresholds();
        
        const escapeMarkdown = (text) => {
          return String(text).replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
        };
        
        const message = 
          `✅ *Configuration reset to defaults*\n\n` +
          `🌡️ Temperature High: >${escapeMarkdown(thresholds.temperatureHigh)}°C\n` +
          `🌡️ Temperature Low: <${escapeMarkdown(thresholds.temperatureLow)}°C\n` +
          `💧 Humidity High: >${escapeMarkdown(thresholds.humidityHigh)}%\n` +
          `💧 Humidity Low: <${escapeMarkdown(thresholds.humidityLow)}%`;
        
        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        console.log(`✓ Configuration reset by ${chatId}`);
      } catch (error) {
        console.error('Resetconfig command error:', error);
        bot.sendMessage(chatId, '❌ Error resetting configuration');
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
    
    // Escape special characters for Markdown
    const escapeMarkdown = (text) => {
      return String(text).replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
    };
    
    // Format time in IST (India Standard Time)
    const istTime = new Date(alert.createdAt).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'medium'
    });
    
    let message = 
      `⚠️ *${emoji} ALERT*\n\n` +
      `*Type:* ${alert.type.replace(/_/g, ' ').toUpperCase()}\n` +
      `*Message:* ${escapeMarkdown(alert.message)}\n` +
      `*Value:* ${escapeMarkdown(alert.value)}\n` +
      `*Threshold:* ${escapeMarkdown(alert.threshold)}\n` +
      `*Device:* ${escapeMarkdown(alert.deviceId)}\n` +
      `*Time:* ${escapeMarkdown(istTime)}`;
    
    // Append localized alert details
    const localizedDetails = getLocalizedAlertDetails(alert.type, alert.value, alert.threshold);
    if (localizedDetails) {
      message += `\n\n${localizedDetails}`;
    }
    
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
 * Get localized Hindi/Hinglish alert details and recommended actions
 */
function getLocalizedAlertDetails(type, value, threshold) {
  const details = {
    'temperature_high': {
      safeLevel: `🌾 धान \/ चावल (Rice)\n📊 सुरक्षित स्तर\n🌡 तापमान: 20°C – 30°C`,
      trigger: `🔴 तापमान > ${threshold}°C`,
      danger: `⚠️ खतरा: चावल की गुणवत्ता खराब हो रही है`,
      solutions: `✅ उपाय:\n• साइलो को ठंडा रखें (शेड\\/कवर)\n• रात में हवा पास करें (ventilation)\n• अगर संभव हो तो साइलो की बाहरी दीवार पर पानी का छिड़काव करें (cooling)`
    },
    'temperature_low': {
      safeLevel: `🌾 धान \/ चावल (Rice)\n📊 सुरक्षित स्तर\n🌡 तापमान: 20°C – 30°C`,
      trigger: `🔴 तापमान < ${threshold}°C`,
      danger: `⚠️ खतरा: संघनन (condensation) और नमी जमा हो सकती है`,
      solutions: `✅ उपाय:\n• साइलो को धूप में रखें\n• दिन में वेंटिलेशन दें\n• आर्द्रता की निगरानी करें`
    },
    'humidity_high': {
      safeLevel: `🌾 धान \/ चावल (Rice)\n📊 सुरक्षित स्तर\n🌫 आर्द्रता: < 65%`,
      trigger: `🔴 आर्द्रता > ${threshold}%`,
      danger: `⚠️ खतरा: गंध और फंगस (mold) विकसित हो सकते हैं`,
      solutions: `✅ उपाय:\n• साइलो के वेंट खोलें\n• गीले हिस्से को अलग करें\n• हवा पास करें (fan\\/ventilation)\n• आर्द्रता को कम करने के लिए dehumidifier का उपयोग करें`
    },
    'humidity_low': {
      safeLevel: `🌾 धान \/ चावल (Rice)\n📊 सुरक्षित स्तर\n🌫 आर्द्रता: > 50%`,
      trigger: `🔴 आर्द्रता < ${threshold}%`,
      danger: `⚠️ खतरा: चावल सूख सकता है और टूट सकता है`,
      solutions: `✅ उपाय:\n• आर्द्रता बढ़ाएं (humidifier का उपयोग करें)\n• साइलो को सील करे हुए कंटेनर में रखें\n• नमी वाली हवा दें`
    }
  };

  if (details[type]) {
    return (
      `─────────────────\n` +
      `${details[type].safeLevel}\n\n` +
      `⚠️ ट्रिगर + समाधान\n` +
      `${details[type].trigger}\n` +
      `${details[type].danger}\n` +
      `${details[type].solutions}\n` +
      `─────────────────`
    );
  }

  return null;
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
