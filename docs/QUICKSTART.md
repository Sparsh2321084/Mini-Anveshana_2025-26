# 🚀 Quick Start Guide

Get your ESP32 IoT system up and running in minutes!

---

## 📦 What You Need

### Hardware
- ESP32 Development Board
- DHT22 Temperature & Humidity Sensor
- PIR Motion Sensor
- Jumper wires
- USB cable
- Breadboard (optional)

### Software
- Arduino IDE (1.8.x or 2.x)
- Node.js (v18 or higher)
- Git

---

## 🔌 Hardware Setup

### Wiring Diagram

```
ESP32          DHT22 Sensor
─────          ────────────
GPIO 4    →    Data Pin
3.3V      →    VCC
GND       →    GND

ESP32          PIR Sensor
─────          ──────────
GPIO 5    →    OUT
5V        →    VCC
GND       →    GND
```

### Pin Configuration

| Sensor | ESP32 Pin | Type |
|--------|-----------|------|
| DHT22 Data | GPIO 4 | Digital |
| PIR Motion | GPIO 5 | Digital |
| (Future) Gas Sensor | GPIO 34 | Analog |
| (Future) Soil Moisture | GPIO 35 | Analog |

---

## 💻 Software Installation

### 1. Install Arduino IDE

Download from: https://www.arduino.cc/en/software

### 2. Install ESP32 Board Support

1. Open Arduino IDE
2. Go to **File** → **Preferences**
3. Add to "Additional Board Manager URLs":
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
4. Go to **Tools** → **Board** → **Boards Manager**
5. Search "ESP32" and install "esp32 by Espressif Systems"

### 3. Install Required Libraries

Go to **Sketch** → **Include Library** → **Manage Libraries**, then install:

- `DHT sensor library` by Adafruit
- `Adafruit Unified Sensor`
- `ArduinoJson` by Benoit Blanchon (v6.x)

---

## 🔧 ESP32 Configuration

### 1. Open Firmware

1. Navigate to `esp32-firmware/main.ino`
2. Open in Arduino IDE

### 2. Configure WiFi

Edit `config.h`:

```cpp
#define WIFI_SSID "YourWiFiName"
#define WIFI_PASSWORD "YourWiFiPassword"
```

### 3. Configure Server

**For local testing:**
```cpp
#define SERVER_URL "http://192.168.1.100:3000/api/sensor-data"
```

**For production (Render):**
```cpp
#define SERVER_URL "https://your-backend.onrender.com/api/sensor-data"
```

### 4. Set API Key

```cpp
#define API_KEY "your-secure-api-key"  // Must match backend
#define DEVICE_ID "ESP32_001"
```

### 5. Upload to ESP32

1. Connect ESP32 via USB
2. Select **Tools** → **Board** → **ESP32 Dev Module**
3. Select **Tools** → **Port** → (your COM port)
4. Click **Upload** button (→)
5. Wait for "Done uploading"

### 6. Monitor Output

1. Open **Tools** → **Serial Monitor**
2. Set baud rate to **115200**
3. You should see:
   ```
   =================================
     ESP32 IoT Sensor Node v1.0
   =================================
   
   Connecting to WiFi...
   ✓ WiFi connected!
   ```

---

## 🖥️ Backend Setup

### 1. Install Dependencies

```powershell
cd backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```powershell
copy .env.example .env
```

Edit `.env` file:

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/esp32_iot
API_KEY=your-secure-api-key
JWT_SECRET=your-jwt-secret
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=your_chat_id
```

### 3. Setup MongoDB

**Option A: Local MongoDB**
```powershell
# Download from https://www.mongodb.com/try/download/community
# Install and start MongoDB service
```

**Option B: MongoDB Atlas (Free Cloud)**
1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### 4. Start Backend Server

```powershell
npm run dev
```

You should see:
```
🚀 Starting ESP32 IoT Backend Server...
✓ Database connected successfully
✓ Telegram bot initialized
✓ Server is running on port 3000
```

---

## 🎨 Frontend Setup

### 1. Install Dependencies

```powershell
cd frontend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```powershell
copy .env.example .env
```

Content should be:
```env
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000/ws
```

### 3. Start Development Server

```powershell
npm run dev
```

Frontend will start at: http://localhost:5173

---

## 🤖 Telegram Bot Setup

### 1. Create Bot

1. Open Telegram
2. Search for `@BotFather`
3. Send `/newbot`
4. Follow instructions
5. Save the **Bot Token**

### 2. Get Chat ID

1. Send a message to your bot
2. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
3. Find `"chat":{"id":123456789}`
4. Save the **Chat ID**

### 3. Update Backend .env

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

### 4. Restart Backend

```powershell
# Stop backend (Ctrl+C)
npm run dev
```

### 5. Test Bot

Send to your bot:
- `/start` - Subscribe to alerts
- `/status` - Get current readings
- `/config` - View thresholds

---

## ✅ Testing the System

### 1. Test ESP32

Check Serial Monitor for:
```
✓ Sensor data received from ESP32_001
  Temperature: 25.3°C
  Humidity: 55.2%
  Motion: None
✓ Data sent successfully!
```

### 2. Test Backend API

```powershell
# Test health endpoint
curl http://localhost:3000/health

# Get latest data
curl http://localhost:3000/api/sensor-data/latest
```

### 3. Test Frontend

1. Open http://localhost:5173
2. Check if sensor cards show data
3. Verify charts are updating
4. Check "Live" indicator is green

### 4. Test Telegram Alerts

1. Heat up DHT22 sensor (use hand warmth)
2. Or adjust thresholds in backend:
   ```env
   TEMP_HIGH_THRESHOLD=25  # Lower threshold for testing
   ```
3. You should receive Telegram alert!

---

## 🎯 Next Steps

### Add More Sensors

1. Connect gas sensor to GPIO 34
2. Connect soil moisture to GPIO 35
3. Uncomment sensor code in `sensors.h`:
   ```cpp
   // Uncomment these lines:
   gasLevel: {
     type: Number,
     default: null
   },
   ```

### Customize Alerts

Edit alert thresholds in `.env`:
```env
TEMP_HIGH_THRESHOLD=35
TEMP_LOW_THRESHOLD=10
HUMIDITY_HIGH_THRESHOLD=80
HUMIDITY_LOW_THRESHOLD=20
```

### Deploy to Cloud

Follow [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment on Render.

---

## 🐛 Troubleshooting

### ESP32 Won't Connect to WiFi

- Check SSID and password
- Verify 2.4GHz WiFi (ESP32 doesn't support 5GHz)
- Ensure router allows new devices

### Backend Database Error

- Check MongoDB is running
- Verify connection string
- Try: `mongodb://127.0.0.1:27017/esp32_iot`

### Frontend Shows No Data

- Verify backend is running
- Check browser console (F12)
- Verify `VITE_API_URL` is correct

### Telegram Bot Not Responding

- Check bot token is correct
- Verify chat ID is accurate
- Restart backend server

---

## 📚 Documentation

- **API Documentation**: See `docs/API.md`
- **Deployment Guide**: See `docs/DEPLOYMENT.md`
- **Architecture**: See main `README.md`

---

## 🆘 Need Help?

- Check Serial Monitor for ESP32 errors
- Check backend console logs
- Check browser console (F12) for frontend errors
- Verify all environment variables are set

---

🎉 **Congratulations! Your ESP32 IoT system is now running!**
