/**
 * Telegram Hindi Alert Service (Simple + Voice)
 */

const TelegramBot = require('node-telegram-bot-api');
const gTTS = require('gtts');

let bot;
let chatIds = [];
let lastAlertTime = 0; // ⏱️ 2 min gap

/**
 * INIT BOT
 */
async function initTelegramBot() {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
      console.log('⚠ Bot token नहीं मिला');
      return;
    }

    bot = new TelegramBot(token, { polling: true });

    // chat IDs from env
    const chatIdStr = process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_CHAT_IDS;
    if (chatIdStr) {
      chatIds = chatIdStr.split(',').map(id => id.trim());
    }

    // ▶ START
    bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;

      if (!chatIds.includes(chatId.toString())) {
        chatIds.push(chatId.toString());
      }

      bot.sendMessage(chatId,
        `🤖 नमस्ते!\n\n` +
        `अब आपको साइलो की सभी महत्वपूर्ण जानकारी मिलेगी\n\n` +
        `अगर कोई समस्या होगी तो तुरंत सूचना दी जाएगी`
      );
    });

    // ⛔ STOP
    bot.onText(/\/stop/, (msg) => {
      const chatId = msg.chat.id;
      chatIds = chatIds.filter(id => id !== chatId.toString());
      bot.sendMessage(chatId, 'आपको अलर्ट मिलना बंद हो गया है');
    });

    console.log('✓ Telegram Hindi Bot चालू है');

  } catch (err) {
    console.error('❌ Bot start error:', err.message);
  }
}

/**
 * SEND ALERT (TEXT + VOICE + 2 MIN GAP)
 */
async function sendTelegramAlert(alert) {
  if (!bot || chatIds.length === 0) return false;

  // ⏱️ 2 मिनट गैप
  const now = Date.now();
  if (now - lastAlertTime < 120000) {
    console.log('⏳ Alert रुका (2 मिनट गैप)');
    return false;
  }
  lastAlertTime = now;

  try {
    const text = getSimpleHindiMessage(alert.type);

    for (const chatId of chatIds) {

      // 📩 TEXT
      await bot.sendMessage(chatId, text);

      // 🔊 VOICE
      const tts = new gTTS(text, 'hi');
      const file = `voice_${Date.now()}.mp3`;

      await new Promise((resolve) => {
        tts.save(file, resolve);
      });

      await bot.sendVoice(chatId, file);
    }

    console.log('✓ Hindi alert भेजा गया');
    return true;

  } catch (err) {
    console.error('❌ Error:', err.message);
    return false;
  }
}

/**
 * SIMPLE HINDI MESSAGES (NO TECH WORDS)
 */
function getSimpleHindiMessage(type) {

  // 🌡️ गरम
  if (type === 'temperature_high') {
    return `⚠️ अनाज गरम हो रहा है

खतरा: अनाज खराब हो सकता है

उपाय:
• साइलो को ढक कर रखें
• हवा आने दें
• पानी छिड़कें`;
  }

  // ❄️ ठंडा
  if (type === 'temperature_low') {
    return `⚠️ साइलो बहुत ठंडा है

खतरा: नमी जमा हो सकती है

उपाय:
• साइलो को धूप में रखें
• दिन में हवा लगने दें`;
  }

  // 💧 नमी ज्यादा
  if (type === 'humidity_high') {
    return `⚠️ साइलो में नमी ज्यादा है

खतरा: फंगस और बदबू बन सकती है

उपाय:
• गीला अनाज अलग करें
• हवा चलाएं
• ढक्कन खोलें`;
  }

  // 🌵 नमी कम
  if (type === 'humidity_low') {
    return `⚠️ अनाज बहुत सूख रहा है

खतरा: अनाज टूट सकता है

उपाय:
• नमी बढ़ाएं
• साइलो बंद रखें`;
  }

  // 🚨 मूवमेंट
  if (type === 'motion_detected') {
    const hour = new Date().getHours();

    // 🌙 रात → चोरी शक
    if (hour >= 22 || hour <= 5) {
      return `🚨 खतरा: साइलो के पास हलचल

शक: चोरी या छेड़छाड़

उपाय:
• तुरंत जाकर देखें
• आसपास जांच करें`;
    }

    // ☀️ दिन → चूहा/कीट
    return `⚠️ साइलो में चूहा या कीट हो सकते हैं

खतरा: अनाज खराब हो सकता है

उपाय:
• चूहा ट्रैप लगाएं
• छेद बंद करें
• अनाज जांचें`;
  }

  return `⚠️ साइलो में समस्या पाई गई\nजाकर जांच करें`;
}

/**
 * EXPORTS
 */
module.exports = {
  initTelegramBot,
  sendTelegramAlert
};