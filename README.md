# 🌐 ESP32 IoT Dashboard - Mini Anveshana 2025-26# 🌐 ESP32 IoT Dashboard with Telegram Alerts



Real-time IoT monitoring system with ESP32, cloud backend, and web dashboard featuring Telegram alerts.A full-stack IoT monitoring system featuring real-time sensor data visualization, cloud storage, and intelligent Telegram notifications.



---![Project Status](https://img.shields.io/badge/Status-Active-success)

![License](https://img.shields.io/badge/License-MIT-blue)

## 📋 Project Overview

---

A complete IoT solution that collects sensor data from ESP32, processes it through a cloud backend, and displays it on a live web dashboard with automated Telegram notifications.

## 📋 Project Overview

**Developed for Mini Anveshana 2025-26** - A science project competition organized by [Agastya International Foundation](https://www.agastya.org/)

This system integrates ESP32 microcontroller sensors with a modern web dashboard and automated alert system, perfect for smart home, agriculture, or industrial monitoring applications.

### ✨ Features

### ✨ Key Features

- 🔌 **ESP32 Sensor Integration** - DHT11 (Temperature & Humidity)

- 📊 **Real-time Dashboard** - Live charts and 3D visualizations- 🔌 **ESP32 Sensor Integration** - Temperature (DHT22), Humidity, PIR motion sensor

- 📱 **Telegram Alerts** - Instant notifications when thresholds exceeded- 📊 **Real-time Web Dashboard** - Interactive charts and 3D visualizations using React

- ☁️ **Cloud Deployment** - Backend on Render, Frontend on GitHub Pages- 📱 **Telegram Alerts** - Instant notifications when thresholds are exceeded

- 🔐 **Secure API** - API Key authentication- 💾 **Cloud Database** - MongoDB on Render for historical data storage

- 📈 **Data Visualization** - Chart.js for graphs, Three.js for 3D- 🔐 **Secure API** - API Key authentication for ESP32-server communication

- 🌐 **WebSocket** - Real-time data updates- 📈 **Data Analytics** - Time-series graphs with Chart.js

- 📱 **Responsive Design** - Works on all devices- 🌐 **WebSocket Support** - Real-time data updates without polling

- 🎨 **3D Visualization** - Interactive Three.js sensor visualization

---- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

- 🔧 **Scalable Design** - Easy to add more sensors in future

## 🏗️ System Architecture

---

```

ESP32 (DHT11) → WiFi → Render Backend → GitHub Pages Dashboard## 🏗️ System Architecture

                              ↓

                        Telegram Bot```

```┌─────────────┐         ┌──────────────┐         ┌─────────────┐

│   ESP32     │ ──HTTP──│  Node.js     │ ────────│  Database   │

**Data Flow:**│  + Sensors  │         │   Backend    │         │  (Render)   │

1. ESP32 reads sensors every 5 seconds└─────────────┘         └──────┬───────┘         └─────────────┘

2. Sends data via HTTPS to Render backend                               │

3. Backend stores in-memory (last 50 readings)                    ┌──────────┼──────────┐

4. Backend checks thresholds & sends Telegram alerts                    │                     │

5. WebSocket broadcasts to dashboard              ┌─────▼─────┐         ┌────▼─────┐

6. Dashboard displays real-time charts              │   React   │         │ Telegram │

              │ Dashboard │         │   Bot    │

---              └───────────┘         └──────────┘

```

## 🛠️ Tech Stack

---

| Component | Technology |

|-----------|-----------|## 🛠️ Technology Stack

| **Hardware** | ESP32, DHT11, Buzzer |

| **Backend** | Node.js, Express, WebSocket || Component         | Technology                           |

| **Frontend** | React, Vite, Chart.js, Three.js ||-------------------|--------------------------------------|

| **Deployment** | Render (Backend), GitHub Pages (Frontend) || Microcontroller   | ESP32 (Arduino Framework)            |

| **Notifications** | Telegram Bot API || Backend           | Node.js + Express                    |

| Database          | PostgreSQL/MongoDB (Render)          |

---| Frontend          | React + Chart.js + Three.js          |

| Notifications     | Telegram Bot API                     |

## 🚀 Live Links| Deployment        | Render (Backend), Vercel (Frontend)  |



- **Dashboard:** https://sparsh2321084.github.io/Mini-Anveshana_2025-26/---

- **Backend API:** https://grain-backend-kw0o.onrender.com/

- **Health Check:** https://grain-backend-kw0o.onrender.com/health## 📂 Project Structure



---```

Mini-Anveshana_2025-26/

## 📱 Telegram Bot Commands├── esp32-firmware/          # ESP32 Arduino code

│   ├── main.ino

Message your bot to:│   ├── config.h

- `/start` - Subscribe to alerts│   └── sensors.h

- `/status` - Get current sensor readings├── backend/                 # Node.js Express API

- `/config` - View alert thresholds│   ├── src/

- `/stop` - Unsubscribe from alerts│   │   ├── controllers/

│   │   ├── routes/

---│   │   ├── models/

│   │   └── services/

## ⚙️ Configuration│   ├── package.json

│   └── server.js

### Backend Environment Variables├── frontend/                # React Dashboard

```env│   ├── src/

API_KEY=ESP32_SECURE_API_KEY_2025│   │   ├── components/

TELEGRAM_BOT_TOKEN=<your-bot-token>│   │   ├── pages/

TELEGRAM_CHAT_ID=<your-chat-id>│   │   ├── services/

TEMP_HIGH_THRESHOLD=35│   │   └── App.jsx

TEMP_LOW_THRESHOLD=15│   └── package.json

HUMIDITY_HIGH_THRESHOLD=70└── docs/                    # Documentation

HUMIDITY_LOW_THRESHOLD=30    ├── API.md

```    ├── DEPLOYMENT.md

    └── TELEGRAM_SETUP.md

### ESP32 Configuration```

```cpp

const char* ssid = "Your-WiFi-SSID";---

const char* password = "Your-WiFi-Password";

const char* serverURL = "https://grain-backend-kw0o.onrender.com/api/sensor-data";## 🚀 Quick Start

const char* apiKey = "ESP32_SECURE_API_KEY_2025";

```### 1️⃣ Backend Setup



---```bash

cd backend

## 📊 Alert Thresholdsnpm install

cp .env.example .env

| Parameter | Low Alert | High Alert |# Configure your environment variables

|-----------|-----------|------------|npm run dev

| Temperature | <15°C | >35°C |```

| Humidity | <30% | >70% |

### 2️⃣ Frontend Setup

Alerts sent via Telegram with 5-minute cooldown to prevent spam.

```bash

---cd frontend

npm install

## 🔧 Local Developmentnpm start

```

### Backend

```bash### 3️⃣ ESP32 Setup

cd backend

npm install1. Open `esp32-firmware/main.ino` in Arduino IDE

npm start2. Install required libraries (WiFi, HTTPClient, ArduinoJson)

```3. Configure WiFi credentials in `config.h`

4. Upload to ESP32

### Frontend

```bash### 4️⃣ Telegram Bot Setup

cd frontend

npm install1. Create bot via [@BotFather](https://t.me/botfather)

npm run dev2. Get bot token

```3. Add token to backend `.env` file

4. Start bot with `/start` command

---

---

## 📦 Project Structure

## 📊 Features Breakdown

```

Mini-Anveshana_2025-26/### ESP32 Capabilities (Current)

├── backend/           # Node.js Express backend- ✅ DHT22 Temperature & Humidity sensor

│   ├── src/- ✅ PIR Motion detection

│   │   ├── controllers/  # sensorController.js- ✅ JSON-formatted data transmission

│   │   ├── routes/       # sensorRoutes.js- ✅ Automatic WiFi reconnection

│   │   ├── services/     # telegramService, alertService, websocketService- ✅ Configurable update intervals

│   │   └── middleware/   # auth.js- ✅ Serial monitoring for debugging

│   ├── server.js- 🔜 Additional sensors ready to add (gas, soil moisture, etc.)

│   └── package.json

├── frontend/          # React + Vite frontend### Backend API

│   ├── src/- ✅ RESTful API endpoints

│   │   ├── components/   # SensorCard, ChartCard, AlertsList- ✅ Real-time data processing

│   │   ├── pages/        # Dashboard.jsx- ✅ Threshold-based alert triggers

│   │   └── services/     # api.js- ✅ Historical data queries with pagination

│   ├── index.html- ✅ API Key authentication

│   └── package.json- ✅ Rate limiting & security (Helmet, CORS)

└── README.md- ✅ WebSocket server for live updates

```- ✅ MongoDB with automatic data expiration



---### Frontend Dashboard

- ✅ Real-time data updates via WebSocket

## 👥 Project Team- ✅ Interactive charts with Chart.js

- ✅ 3D sensor visualization with Three.js

**Mini Anveshana 2025-26**- ✅ Responsive design (Mobile-friendly)

- ✅ Live connection status indicator

**Developers:**- ✅ Alert notifications

- **Sparsh Trivedi** - ESP32 Integration, Backend Development, Cloud Deployment- ✅ Historical data graphs

- **Aman Singh** - Frontend Development, Dashboard Design, System Integration

### Telegram Bot

**Competition:**- ✅ Instant threshold alerts

Mini Anveshana Science Project Competition organized by [Agastya International Foundation](https://www.agastya.org/)- ✅ Command-based data queries (`/status`, `/config`)

- ✅ Multi-user subscriptions

**About Agastya:**- ✅ Subscribe/unsubscribe functionality

Agastya International Foundation is India's largest Science Education NGO, bringing hands-on science education to underprivileged children across the country through mobile labs, campuses, and teacher training programs.- ✅ Configurable alert thresholds

- ✅ Emoji-rich notifications

---

---

## 🎯 Project Objectives

## 🔐 Security Features

1. **Real-time Monitoring** - Continuous environmental data collection

2. **Cloud Integration** - Scalable backend for IoT applications- 🔒 API Key authentication for ESP32

3. **User Alerts** - Instant notifications via Telegram- 🔒 JWT tokens for web dashboard

4. **Data Visualization** - Interactive charts and 3D graphics- 🔒 Environment variable protection

5. **Accessibility** - Web-based dashboard accessible from anywhere- 🔒 HTTPS/TLS encryption

- 🔒 SQL injection prevention

---- 🔒 Rate limiting on API endpoints



## 🏆 Features Demonstrated---



- ✅ IoT sensor integration with ESP32## 📈 Future Enhancements

- ✅ Cloud-based backend deployment (Render)

- ✅ Modern web technologies (React, WebSocket)- [ ] Machine Learning predictions

- ✅ Real-time data processing- [ ] Mobile app (React Native)

- ✅ Automated alert system- [ ] LoRa integration for remote areas

- ✅ Responsive web design- [ ] Multi-language support

- ✅ API security implementation- [ ] Voice alerts (Alexa/Google Home)

- ✅ In-memory data storage optimization- [ ] Advanced analytics dashboard



------



## 🎓 Learning Outcomes## 📸 Screenshots



- ESP32 microcontroller programming_Coming Soon_

- RESTful API design and implementation

- Real-time communication with WebSockets---

- Cloud deployment (Render, GitHub Pages)

- React.js frontend development## 👨‍💻 Author

- Telegram Bot API integration

- IoT system architecture designYour Name - [GitHub](https://github.com/yourusername) | [LinkedIn](https://linkedin.com/in/yourprofile)



------



## 🔮 Future Enhancements## 📄 License



- [ ] Add more sensors (gas, pressure, light, soil moisture)This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

- [ ] Database persistence (MongoDB/PostgreSQL)

- [ ] Historical data export (CSV/JSON)---

- [ ] User authentication system

- [ ] Mobile app (React Native)## 🙏 Acknowledgments

- [ ] Multi-device support

- [ ] Machine learning predictions- ESP32 Community

- [ ] Advanced analytics dashboard- Arduino Framework

- Chart.js & Three.js teams

---- Telegram Bot API



## 📄 License---



MIT License - Free for educational and non-commercial use.⭐ **Star this repo if you find it useful!**


---

## 🙏 Acknowledgments

- **Agastya International Foundation** for organizing Mini Anveshana
- Our college for supporting this project
- Open-source community for amazing tools and libraries

---

## 📞 Contact

**GitHub Repository:** https://github.com/Sparsh2321084/Mini-Anveshana_2025-26

**Competition Website:** https://www.agastya.org/

---

**Made by Sparsh Trivedi & Aman Singh for Mini Anveshana 2025-26**
