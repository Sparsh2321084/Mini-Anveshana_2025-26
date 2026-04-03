/**
 * Telegram Hindi Alert Service (Female Voice Style)
 */

const TelegramBot = require('node-telegram-bot-api');
const gTTS = require('gtts');
const fs = require('fs');

let bot;
let chatIds = [];
let lastAlertTime = 120000;

/**
 * INIT BOT
 */
async function initTelegramBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

  bot = new TelegramBot(token, { polling: true });

  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    if (!chatIds.includes(chatId.toString())) {
      chatIds.push(chatId.toString());
    }

    bot.sendMessage(chatId,
      `नमस्ते 🙏\n\n` +
      `मैं आपकी साइलो सहायक हूँ...\n` +
      `अगर कोई समस्या होगी,\nमैं तुरंत आपको बताऊंगी।`
    );
  });

  bot.onText(/\/stop/, (msg) => {
    const chatId = msg.chat.id;
    chatIds = chatIds.filter(id => id !== chatId.toString());
    bot.sendMessage(chatId, 'ठीक है... अब आपको संदेश नहीं मिलेंगे।');
  });
}

/**
 * SEND ALERT
 */
async function sendTelegramAlert(alert) {
  if (!bot || chatIds.length === 0) return;

  const now = Date.now();
  if (now - lastAlertTime < 120000) return;
  lastAlertTime = now;

  try {
    const text = getFemaleHindiMessage(alert.type);

    for (const chatId of chatIds) {

      // TEXT
      await bot.sendMessage(chatId, text);

      // VOICE
      const tts = new gTTS(text, 'hi');
      const file = `voice_${Date.now()}.mp3`;

      await new Promise(res => tts.save(file, res));

      await bot.sendVoice(chatId, file);

      fs.unlinkSync(file); // cleanup
    }

  } catch (err) {
    console.error(err);
  }
}

/**
 * FEMALE STYLE HINDI MESSAGES
 */
function getFemaleHindiMessage(type) {

  // 🔥 गरम
  if (type === 'temperature_high') {
    return `सुनिए... ⚠️

मुझे लग रहा है कि अनाज ज्यादा गरम हो रहा है...

अगर ध्यान नहीं दिया,
तो अनाज खराब हो सकता है।

कृपया अभी ध्यान दें...
• साइलो को ढक कर रखें
• हवा आने दें
• थोड़ा पानी छिड़क दें`;
  }

  // ❄️ ठंडा
  if (type === 'temperature_low') {
    return `सुनिए... ⚠️

साइलो थोड़ा ज्यादा ठंडा हो गया है...

इससे अंदर नमी जमा हो सकती है।

आप ये करें...
• साइलो को धूप में रखें
• दिन में हवा लगने दें`;
  }

  // 💧 नमी ज्यादा
  if (type === 'humidity_high') {
    return `सुनिए... ⚠️

साइलो में नमी बढ़ रही है...

इससे फंगस और बदबू आ सकती है।

कृपया ध्यान दें...
• गीला अनाज अलग करें
• हवा चलाएं
• ढक्कन थोड़ा खोल दें`;
  }

  // 🌵 नमी कम
  if (type === 'humidity_low') {
    return `सुनिए... ⚠️

अनाज थोड़ा ज्यादा सूख रहा है...

इससे दाने टूट सकते हैं।

आप ये करें...
• थोड़ी नमी बढ़ाएं
• साइलो को बंद रखें`;
  }

  // 🚨 मूवमेंट
  if (type === 'motion_detected') {
    const hour = new Date().getHours();

    // 🌙 रात → चोरी
    if (hour >= 22 || hour <= 5) {
      return `सुनिए... 🚨

मुझे साइलो के पास कुछ हलचल महसूस हुई है...

शायद कोई छेड़छाड़ या चोरी हो सकती है।

कृपया अभी जाकर जांच करें...`;
    }

    // ☀️ दिन → चूहा
    return `सुनिए... ⚠️

लगता है साइलो में चूहा या कीट हो सकते हैं...

इससे अनाज खराब हो सकता है।

आप ये करें...
• चूहा ट्रैप लगाएं
• छेद बंद करें
• अनाज जांच लें`;
  }

  return `सुनिए... साइलो में कुछ समस्या है... कृपया जांच करें।`;
}

module.exports = {
  initTelegramBot,
  sendTelegramAlert
};
