# 🚀 How to Run This Project

Quick reference for running the ESP32 IoT system locally or in production.

---

## 🏃 Quick Start (Local Development)

### 1️⃣ Initial Setup (First Time Only)

```powershell
# Run the automated setup script
.\setup.ps1

# Or manually:
cd backend
npm install
copy .env.example .env
# Edit .env with your credentials

cd ../frontend
npm install
copy .env.example .env
```

---

### 2️⃣ Running Locally

#### Terminal 1 - Backend
```powershell
cd backend
npm run dev
```

Expected output:
```
🚀 Starting ESP32 IoT Backend Server...
✓ Database connected successfully
✓ Telegram bot initialized
✓ Server is running on port 3000
```

#### Terminal 2 - Frontend
```powershell
cd frontend
npm run dev
```

Expected output:
```
VITE v5.0.8  ready in 1234 ms
➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.100:5173/
```

#### ESP32
1. Open `esp32-firmware/main.ino` in Arduino IDE
2. Update `config.h` with your WiFi credentials
3. Set `SERVER_URL` to `http://YOUR_PC_IP:3000/api/sensor-data`
4. Upload to ESP32
5. Open Serial Monitor (115200 baud) to see logs

---

## 🌐 Access Points

Once running:

- **Frontend Dashboard**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Health Check**: http://localhost:3000/health
- **WebSocket**: ws://localhost:3000/ws
- **Telegram Bot**: Open Telegram and send `/start` to your bot

---

## 📋 Required Environment Variables

### Backend (.env)
```env
# Essential
MONGODB_URI=mongodb://localhost:27017/esp32_iot
API_KEY=your-secure-api-key-here
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=your_chat_id

# Optional
NODE_ENV=development
PORT=3000
JWT_SECRET=your-jwt-secret
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000/ws
```

### ESP32 (config.h)
```cpp
#define WIFI_SSID "YourWiFiName"
#define WIFI_PASSWORD "YourWiFiPassword"
#define SERVER_URL "http://192.168.1.100:3000/api/sensor-data"
#define API_KEY "your-secure-api-key-here"
```

---

## 🧪 Testing

### Test Backend API
```powershell
# Health check
curl http://localhost:3000/health

# Get latest sensor data
curl http://localhost:3000/api/sensor-data/latest

# Get all alerts
curl http://localhost:3000/api/alerts
```

### Test Telegram Bot
Send these commands to your bot:
- `/start` - Subscribe to alerts
- `/status` - Get current readings
- `/config` - View alert thresholds
- `/stop` - Unsubscribe

### Test ESP32
Check Serial Monitor for:
```
✓ WiFi connected!
✓ Sensor data received
✓ Data sent successfully!
```

---

## 🌍 Production Deployment

### Backend (Render)

1. **Push to GitHub**
```powershell
cd backend
git init
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Deploy on Render**
- Go to https://render.com
- New Web Service → Connect GitHub repo
- Build Command: `npm install`
- Start Command: `npm start`
- Add environment variables from `.env.example`

3. **Get Production URL**
```
https://your-app.onrender.com
```

### Frontend (Vercel)

1. **Update .env for production**
```env
VITE_API_URL=https://your-backend.onrender.com/api
VITE_WS_URL=wss://your-backend.onrender.com/ws
```

2. **Deploy**
```powershell
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

3. **Get Production URL**
```
https://your-frontend.vercel.app
```

### Update ESP32
```cpp
#define SERVER_URL "https://your-backend.onrender.com/api/sensor-data"
```

---

## 🐛 Troubleshooting

### Backend won't start
```powershell
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill process if needed (replace PID)
taskkill /PID <process_id> /F

# Check MongoDB is running
mongo --version
```

### Frontend won't start
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules
npm install
```

### ESP32 connection issues
1. Check Serial Monitor for errors
2. Verify WiFi credentials
3. Ping backend server: `ping 192.168.1.100`
4. Check firewall isn't blocking port 3000
5. Try HTTP instead of HTTPS for local testing

### Telegram bot not responding
1. Verify bot token with: `https://api.telegram.org/bot<TOKEN>/getMe`
2. Check chat ID is correct
3. Restart backend server
4. Send `/start` to bot again

---

## 📊 Monitoring

### Check Logs

**Backend:**
```powershell
# Real-time logs
cd backend
npm run dev
```

**Frontend:**
```powershell
# Check browser console (F12)
# Or terminal output
cd frontend
npm run dev
```

**ESP32:**
```
Arduino IDE → Tools → Serial Monitor (115200 baud)
```

---

## 🔄 Common Commands

```powershell
# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev

# Build frontend for production
cd frontend && npm run build

# Install new package (backend)
cd backend && npm install package-name

# Install new package (frontend)
cd frontend && npm install package-name

# Check for updates
npm outdated

# Update all packages
npm update
```

---

## 📚 Additional Resources

- **Quick Start Guide**: `docs/QUICKSTART.md`
- **Deployment Guide**: `docs/DEPLOYMENT.md`
- **Project Summary**: `PROJECT_SUMMARY.md`
- **Main README**: `README.md`

---

## 💡 Tips

1. **Keep terminals open** - You need separate terminals for backend and frontend
2. **Check Serial Monitor** - Always monitor ESP32 for debugging
3. **Test locally first** - Ensure everything works before deploying
4. **Save .env files** - Keep backups of your configuration
5. **Use MongoDB Compass** - Visual tool to inspect database
6. **Monitor Telegram** - Bot will notify you of issues

---

## 🆘 Still Need Help?

1. Check error messages in:
   - Backend terminal
   - Frontend browser console (F12)
   - ESP32 Serial Monitor

2. Verify all services are running:
   - Backend: http://localhost:3000/health
   - Frontend: http://localhost:5173
   - MongoDB: Should be running
   - ESP32: Check Serial Monitor

3. Review documentation in `docs/` folder

---

✅ **You're all set! Happy monitoring!** 🎉
