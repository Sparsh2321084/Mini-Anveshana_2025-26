# 🚀 Deployment Guide - Render Platform

This guide will help you deploy your ESP32 IoT backend on Render.

---

## 📋 Prerequisites

- GitHub account
- Render account (free tier available at [render.com](https://render.com))
- MongoDB Atlas account (free tier available)
- Telegram Bot Token

---

## 🗄️ Step 1: Setup MongoDB Database

### Option A: MongoDB Atlas (Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database password
6. Save this URI for later

Example:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/esp32_iot?retryWrites=true&w=majority
```

---

## 🤖 Step 2: Create Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow instructions to create your bot
4. Save the **Bot Token** (format: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)
5. Start your bot and send a message
6. Go to `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
7. Find your **Chat ID** in the response
8. Save both Token and Chat ID

---

## 🌐 Step 3: Deploy Backend on Render

### 3.1 Push Code to GitHub

```powershell
cd backend
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/esp32-iot-backend.git
git push -u origin main
```

### 3.2 Create Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `esp32-iot-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free` (or paid plan)

### 3.3 Add Environment Variables

In Render dashboard, go to **Environment** tab and add:

```plaintext
NODE_ENV=production
PORT=3000
MONGODB_URI=<your_mongodb_atlas_uri>
JWT_SECRET=your-super-secret-jwt-key-change-this
API_KEY=your-esp32-api-key-must-match-esp32
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=your_chat_id
TEMP_HIGH_THRESHOLD=35
TEMP_LOW_THRESHOLD=10
HUMIDITY_HIGH_THRESHOLD=80
HUMIDITY_LOW_THRESHOLD=20
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### 3.4 Deploy

1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Once deployed, you'll get a URL like: `https://esp32-iot-backend.onrender.com`
4. Test health endpoint: `https://your-backend.onrender.com/health`

---

## 🎨 Step 4: Deploy Frontend on Vercel

### 4.1 Prepare Frontend

```powershell
cd frontend
# Create .env file
echo "VITE_API_URL=https://your-backend.onrender.com/api" > .env
echo "VITE_WS_URL=wss://your-backend.onrender.com/ws" >> .env
```

### 4.2 Deploy to Vercel

1. Install Vercel CLI:
```powershell
npm install -g vercel
```

2. Deploy:
```powershell
cd frontend
vercel login
vercel
```

3. Follow prompts:
   - Setup and deploy? **Y**
   - Which scope? (choose your account)
   - Link to existing project? **N**
   - What's your project name? `esp32-iot-dashboard`
   - In which directory? `./`
   - Override settings? **N**

4. You'll get a URL like: `https://esp32-iot-dashboard.vercel.app`

### Alternative: Deploy via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"New Project"**
3. Import your Git repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variables:
   - `VITE_API_URL`: `https://your-backend.onrender.com/api`
   - `VITE_WS_URL`: `wss://your-backend.onrender.com/ws`
6. Click **"Deploy"**

---

## 📡 Step 5: Configure ESP32

Update `config.h` in your ESP32 firmware:

```cpp
#define WIFI_SSID "YourWiFiName"
#define WIFI_PASSWORD "YourWiFiPassword"
#define SERVER_URL "https://your-backend.onrender.com/api/sensor-data"
#define API_KEY "your-esp32-api-key"  // Must match backend
#define DEVICE_ID "ESP32_001"
```

Upload to ESP32 and test!

---

## ✅ Step 6: Verify Deployment

### Test Backend
```powershell
# Health check
curl https://your-backend.onrender.com/health

# Test API (should require API key)
curl https://your-backend.onrender.com/api/sensor-data/latest
```

### Test Telegram Bot
1. Send `/start` to your bot
2. Send `/status` to check sensor readings
3. Send `/config` to view alert thresholds

### Test Frontend
1. Open `https://your-frontend-url.vercel.app`
2. Check if sensor cards display data
3. Verify charts are updating
4. Check WebSocket status (should show "Live")

---

## 🔧 Troubleshooting

### Backend Issues

**Database Connection Failed**
- Verify MongoDB URI is correct
- Check if IP whitelist includes `0.0.0.0/0` in MongoDB Atlas
- Ensure database password doesn't contain special characters

**Telegram Bot Not Working**
- Verify bot token is correct
- Check chat ID is accurate
- Ensure bot is started (`/start` command)

**ESP32 Can't Connect**
- Verify SERVER_URL uses `https://` (not `http://`)
- Check API_KEY matches between ESP32 and backend
- Ensure Render service is running (free tier sleeps after inactivity)

### Frontend Issues

**API Errors**
- Check VITE_API_URL is correct in Vercel environment variables
- Verify CORS settings in backend allow frontend domain
- Check browser console for errors

**WebSocket Not Connecting**
- Ensure VITE_WS_URL uses `wss://` (not `ws://`)
- Check if backend WebSocket server is running
- Verify firewall/network doesn't block WebSocket

---

## 💡 Tips for Free Tier

### Render Free Tier Limitations
- Service spins down after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- 750 hours/month free compute time

**Solutions:**
1. Use a cron service to ping health endpoint every 10 minutes
2. Upgrade to paid tier ($7/month) for always-on service
3. Accept 30-60 second delay on first request

**Cron Service Options:**
- [cron-job.org](https://cron-job.org)
- [UptimeRobot](https://uptimerobot.com)
- [Koyeb](https://www.koyeb.com)

Setup: Ping `https://your-backend.onrender.com/health` every 10 minutes

---

## 📊 Monitoring

### Check Logs on Render
1. Go to Render Dashboard
2. Select your service
3. Click **"Logs"** tab
4. Monitor real-time logs

### Enable Alerts
1. Set up email notifications in Render
2. Configure Telegram alerts for critical errors
3. Use external monitoring (UptimeRobot, Pingdom)

---

## 🔒 Security Best Practices

1. **Use Strong Secrets**
   - Generate random JWT_SECRET (min 32 characters)
   - Use unique API_KEY for ESP32
   - Never commit .env files

2. **Restrict Access**
   - Enable rate limiting (already configured)
   - Use HTTPS only
   - Whitelist specific IPs if possible

3. **Regular Updates**
   - Keep dependencies updated: `npm update`
   - Monitor security advisories
   - Rotate keys periodically

---

## 📈 Scaling Considerations

When you outgrow free tier:

1. **Upgrade Render Plan** ($7/month for basic, $25/month for standard)
2. **Add Redis** for caching and real-time features
3. **Use CDN** for frontend assets
4. **Implement Load Balancing** for multiple ESP32 devices
5. **Add Database Replicas** for high availability

---

## 🆘 Getting Help

- **Render Docs**: https://render.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com/
- **Telegram Bot API**: https://core.telegram.org/bots/api

---

✅ Your ESP32 IoT system is now deployed and running in the cloud!
