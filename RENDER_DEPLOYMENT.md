# 🚀 Quick Render Deployment Guide

## Prerequisites (Free Services)

1. **MongoDB Atlas** - https://www.mongodb.com/cloud/atlas
2. **Render Account** - https://render.com
3. **GitHub Account** - https://github.com
4. **Telegram Bot** - Create via @BotFather
5. **(Optional) Vercel** - https://vercel.com

---

## 🗄️ Step 1: MongoDB Atlas Setup

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up → Create FREE M0 cluster
3. Click **Connect** → **Connect your application**
4. Copy connection string:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/esp32_iot
   ```
5. ⚠️ **IMPORTANT**: Go to **Network Access** → Add IP: `0.0.0.0/0`

---

## 🤖 Step 2: Create Telegram Bot

1. Open Telegram, search: `@BotFather`
2. Send: `/newbot`
3. Follow prompts, save **Bot Token**
4. Start your bot, send a message
5. Visit: `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
6. Find and save your **Chat ID**: `"chat":{"id":123456789}`

---

## 📦 Step 3: Push to GitHub

```powershell
cd backend
git init
git add .
git commit -m "ESP32 IoT Backend"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/esp32-iot-backend.git
git push -u origin main
```

---

## 🌐 Step 4: Deploy to Render

### A. Create Web Service

1. Go to https://dashboard.render.com
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `esp32-iot-backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

### B. Add Environment Variables

In **Environment** tab, add these:

```env
NODE_ENV=production
PORT=3000

# MongoDB Atlas (from Step 1)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/esp32_iot

# Create secure random strings
JWT_SECRET=your-super-secret-jwt-key-32-chars-minimum
API_KEY=your-secure-api-key-for-esp32

# Telegram (from Step 2)
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789

# Alert Thresholds
TEMP_HIGH_THRESHOLD=35
TEMP_LOW_THRESHOLD=10
HUMIDITY_HIGH_THRESHOLD=80
HUMIDITY_LOW_THRESHOLD=20
```

### C. Deploy

Click **Create Web Service** and wait 5-10 minutes.

Your backend URL: `https://your-app-name.onrender.com`

---

## 📡 Step 5: Configure ESP32

Update `esp32-firmware/config.h`:

```cpp
#define WIFI_SSID "YourWiFiName"
#define WIFI_PASSWORD "YourWiFiPassword"

// Use your Render URL
#define SERVER_URL "https://your-app-name.onrender.com/api/sensor-data"

// Must match Render API_KEY
#define API_KEY "your-secure-api-key-for-esp32"

#define DEVICE_ID "ESP32_001"
```

Upload to ESP32 via Arduino IDE.

---

## 🎨 Step 6: Deploy Frontend (Optional)

### Option A: Vercel CLI

```powershell
cd frontend

# Update .env
echo "VITE_API_URL=https://your-backend.onrender.com/api" > .env
echo "VITE_WS_URL=wss://your-backend.onrender.com/ws" >> .env

# Deploy
npm install -g vercel
vercel login
vercel --prod
```

### Option B: Vercel Dashboard

1. Go to https://vercel.com/new
2. Import from GitHub
3. Select `frontend` folder
4. Add environment variables:
   - `VITE_API_URL`: `https://your-backend.onrender.com/api`
   - `VITE_WS_URL`: `wss://your-backend.onrender.com/ws`
5. Deploy

---

## ✅ Testing Checklist

### Test Backend
```powershell
# Health check
curl https://your-backend.onrender.com/health

# Should return: {"status":"OK","timestamp":"..."}
```

### Test Telegram Bot
1. Send `/start` to your bot
2. Should receive welcome message
3. Send `/status` to check sensor readings

### Test ESP32
1. Upload firmware with Render URL
2. Open Serial Monitor (115200 baud)
3. Should see:
   ```
   ✓ WiFi connected!
   ✓ Data sent successfully!
   ```

### Test Frontend (if deployed)
1. Open your Vercel URL
2. Check "Live" status is green
3. Verify sensor cards show data

---

## ⚠️ Important Notes

### Render Free Tier
- Service **spins down** after 15 minutes of inactivity
- First request takes **30-60 seconds** to wake up
- Use a cron service to keep it alive (optional)

**Keep-Alive Options:**
- https://cron-job.org (ping every 10 minutes)
- https://uptimerobot.com (monitor + keep alive)

### MongoDB Atlas Free Tier
- 512 MB storage
- Shared CPU
- Perfect for this project!

### Security
- ✅ Never commit `.env` files
- ✅ Use strong random strings for API_KEY and JWT_SECRET
- ✅ Keep Telegram tokens private

---

## 🔧 Common Issues

### ESP32 Can't Connect
- Verify Render URL is correct (use `https://`)
- Check API_KEY matches exactly
- Ensure WiFi credentials are correct
- Check Serial Monitor for errors

### Backend Won't Start on Render
- Check Render logs for errors
- Verify MongoDB URI is correct
- Ensure Network Access allows 0.0.0.0/0
- Check all environment variables are set

### Telegram Bot Not Working
- Verify bot token is correct
- Check chat ID is accurate
- Send `/start` to activate bot
- Check Render logs for Telegram errors

---

## 📊 Monitoring

### Render Dashboard
- View real-time logs
- Monitor CPU/memory usage
- Check deployment status

### MongoDB Atlas
- Monitor database connections
- View storage usage
- Check query performance

---

## 🚀 Your URLs

After deployment, save these:

```
Backend API:    https://your-backend.onrender.com
Health Check:   https://your-backend.onrender.com/health
Frontend:       https://your-frontend.vercel.app
Dashboard:      Render - https://dashboard.render.com
Database:       MongoDB Atlas - https://cloud.mongodb.com
```

---

## 📚 Additional Resources

- **Full Deployment Guide**: `docs/DEPLOYMENT.md`
- **Quick Start**: `docs/QUICKSTART.md`
- **Project Overview**: `PROJECT_COMPLETE.md`

---

## 🎉 Congratulations!

Your ESP32 IoT system is now running in the cloud! 🌐

**Test it:**
1. ESP32 sends data → Render backend
2. Backend stores in MongoDB Atlas
3. Telegram bot sends alerts
4. Frontend shows real-time data

---

**Need Help?** Check Render logs and MongoDB Atlas metrics!
