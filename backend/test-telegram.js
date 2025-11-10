/**
 * Test Telegram Bot Configuration
 * Run this to verify your Telegram setup
 */

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

console.log('🔍 Testing Telegram Configuration...\n');

// Check environment variables
console.log('1. Environment Variables:');
console.log(`   TELEGRAM_BOT_TOKEN: ${process.env.TELEGRAM_BOT_TOKEN ? '✓ Set' : '❌ Missing'}`);
console.log(`   TELEGRAM_CHAT_ID: ${process.env.TELEGRAM_CHAT_ID ? '✓ Set' : '❌ Missing'}`);
console.log(`   Token: ${process.env.TELEGRAM_BOT_TOKEN ? process.env.TELEGRAM_BOT_TOKEN.substring(0, 10) + '...' : 'N/A'}`);
console.log(`   Chat ID: ${process.env.TELEGRAM_CHAT_ID || 'N/A'}\n`);

if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN is not set!');
  console.log('\nMake sure your .env file contains:');
  console.log('TELEGRAM_BOT_TOKEN=your_bot_token_here');
  process.exit(1);
}

// Test bot connection
console.log('2. Testing Bot Connection...');
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

bot.getMe()
  .then(botInfo => {
    console.log(`   ✓ Bot connected successfully!`);
    console.log(`   Bot Username: @${botInfo.username}`);
    console.log(`   Bot Name: ${botInfo.first_name}\n`);
    
    // Test sending a message
    if (process.env.TELEGRAM_CHAT_ID) {
      console.log('3. Sending Test Message...');
      return bot.sendMessage(
        process.env.TELEGRAM_CHAT_ID,
        '🧪 *Test Message*\n\nYour Telegram bot is configured correctly! You should receive alerts when thresholds are exceeded.',
        { parse_mode: 'Markdown' }
      );
    } else {
      console.log('3. ⚠ TELEGRAM_CHAT_ID not set, skipping message test');
      console.log('\nTo receive messages:');
      console.log('1. Search for @userinfobot on Telegram');
      console.log('2. Send /start to get your Chat ID');
      console.log('3. Add TELEGRAM_CHAT_ID=your_chat_id to .env file');
      return null;
    }
  })
  .then(result => {
    if (result) {
      console.log('   ✓ Test message sent successfully!');
      console.log('   Check your Telegram app for the message.\n');
    }
    console.log('✅ All tests passed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error:', error.message);
    
    if (error.message.includes('401')) {
      console.log('\n💡 This usually means:');
      console.log('   - Your bot token is invalid');
      console.log('   - Create a new bot with @BotFather on Telegram');
    } else if (error.message.includes('400')) {
      console.log('\n💡 This usually means:');
      console.log('   - Your chat ID is invalid');
      console.log('   - Get your chat ID from @userinfobot');
    } else if (error.message.includes('ETELEGRAM')) {
      console.log('\n💡 Network error - check your internet connection');
    }
    
    process.exit(1);
  });
