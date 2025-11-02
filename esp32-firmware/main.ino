/**
 * ESP32 IoT Sensor Node - Main Firmware
 * 
 * Features:
 * - Multi-sensor data collection
 * - WiFi connectivity with auto-reconnect
 * - HTTP POST to backend server
 * - JSON payload formatting
 * - Deep sleep mode for power saving
 * 
 * Author: Your Name
 * Date: November 2024
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "config.h"
#include "sensors.h"

// Global variables
unsigned long lastSendTime = 0;
const unsigned long SEND_INTERVAL = 10000; // Send data every 10 seconds
int failedAttempts = 0;
const int MAX_RETRIES = 3;

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n\n=================================");
  Serial.println("  ESP32 IoT Sensor Node v1.0");
  Serial.println("=================================\n");
  
  // Initialize sensors
  initSensors();
  
  // Connect to WiFi
  connectToWiFi();
  
  Serial.println("✓ System initialized successfully!");
  Serial.println("Starting data collection...\n");
}

void loop() {
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠ WiFi disconnected. Reconnecting...");
    connectToWiFi();
  }
  
  // Send data at intervals
  if (millis() - lastSendTime >= SEND_INTERVAL) {
    collectAndSendData();
    lastSendTime = millis();
  }
  
  delay(100); // Small delay to prevent watchdog issues
}

/**
 * Connect to WiFi network
 */
void connectToWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(WIFI_SSID);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✓ WiFi connected!");
    Serial.print("  IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("  Signal Strength: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm\n");
    failedAttempts = 0;
  } else {
    Serial.println("\n✗ WiFi connection failed!");
    // Enter deep sleep if multiple failures
    if (++failedAttempts >= MAX_RETRIES) {
      Serial.println("Entering deep sleep for 60 seconds...");
      ESP.deepSleep(60e6); // 60 seconds
    }
  }
}

/**
 * Collect sensor data and send to server
 */
void collectAndSendData() {
  Serial.println("─── Collecting Sensor Data ───");
  
  // Read all sensors
  SensorData data = readAllSensors();
  
  // Create JSON payload
  StaticJsonDocument<512> doc;
  doc["device_id"] = DEVICE_ID;
  doc["timestamp"] = millis();
  doc["api_key"] = API_KEY;
  
  // Sensor readings
  JsonObject sensors = doc.createNestedObject("sensors");
  sensors["temperature"] = data.temperature;
  sensors["humidity"] = data.humidity;
  sensors["pressure"] = data.pressure;
  sensors["motion"] = data.motion;
  sensors["gas_level"] = data.gasLevel;
  sensors["soil_moisture"] = data.soilMoisture;
  
  // WiFi status
  JsonObject wifi = doc.createNestedObject("wifi");
  wifi["rssi"] = WiFi.RSSI();
  wifi["ip"] = WiFi.localIP().toString();
  
  // Serialize JSON to string
  String jsonPayload;
  serializeJson(doc, jsonPayload);
  
  Serial.println("JSON Payload:");
  Serial.println(jsonPayload);
  
  // Send HTTP POST request
  bool success = sendDataToServer(jsonPayload);
  
  if (success) {
    Serial.println("✓ Data sent successfully!\n");
  } else {
    Serial.println("✗ Failed to send data\n");
  }
}

/**
 * Send data to backend server via HTTP POST
 */
bool sendDataToServer(String payload) {
  if (WiFi.status() != WL_CONNECTED) {
    return false;
  }
  
  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-API-Key", API_KEY);
  http.setTimeout(10000); // 10 second timeout
  
  int httpResponseCode = http.POST(payload);
  
  bool success = false;
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.print("  Response Code: ");
    Serial.println(httpResponseCode);
    Serial.print("  Response: ");
    Serial.println(response);
    success = (httpResponseCode == 200 || httpResponseCode == 201);
  } else {
    Serial.print("  Error: ");
    Serial.println(http.errorToString(httpResponseCode));
  }
  
  http.end();
  return success;
}
