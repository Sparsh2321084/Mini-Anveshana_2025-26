/**
 * ESP32 Configuration File
 * 
 * Update these values according to your setup
 */

#ifndef CONFIG_H
#define CONFIG_H

// ========================================
// WiFi Configuration
// ========================================
#define WIFI_SSID "YourWiFiSSID"          // Change to your WiFi name
#define WIFI_PASSWORD "YourWiFiPassword"  // Change to your WiFi password

// ========================================
// Server Configuration
// ========================================
#define SERVER_URL "http://192.168.1.100:3000/api/sensor-data"  // Change to your PC's IP for local testing
// For Render deployment, use: "https://your-app.onrender.com/api/sensor-data"

#define API_KEY "ESP32_SECURE_API_KEY_2025"  // Must match backend .env API_KEY
#define DEVICE_ID "ESP32_001"  // Unique identifier for this device

// ========================================
// Sensor Pin Configuration
// ========================================
#define DHT_PIN 4           // DHT22 temperature/humidity sensor
#define DHT_TYPE DHT22

#define PIR_PIN 5           // PIR motion sensor
#define GAS_SENSOR_PIN 34   // MQ-series gas sensor (analog)
#define SOIL_MOISTURE_PIN 35 // Soil moisture sensor (analog)

// I2C pins for BMP280 pressure sensor
#define I2C_SDA 21
#define I2C_SCL 22

// ========================================
// Timing Configuration
// ========================================
#define SEND_INTERVAL 10000      // Send data every 10 seconds (milliseconds)
#define SENSOR_READ_DELAY 2000   // Delay between sensor readings

// ========================================
// Alert Thresholds (for local checking)
// ========================================
#define TEMP_HIGH_THRESHOLD 35.0    // °C
#define TEMP_LOW_THRESHOLD 10.0     // °C
#define HUMIDITY_HIGH_THRESHOLD 80.0 // %
#define GAS_THRESHOLD 500           // Analog value
#define MOISTURE_LOW_THRESHOLD 30   // %

// ========================================
// Deep Sleep Configuration
// ========================================
#define ENABLE_DEEP_SLEEP false
#define SLEEP_DURATION 300e6  // 5 minutes in microseconds

// ========================================
// Debug Configuration
// ========================================
#define DEBUG_MODE true  // Set to false to disable serial output

#endif
