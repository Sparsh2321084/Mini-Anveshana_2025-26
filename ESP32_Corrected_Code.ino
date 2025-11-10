/**
 * ESP32 IoT Sensor System - CORRECTED VERSION
 * Reads DHT11 (Temperature & Humidity) and PIR Motion Sensor
 * Sends data to backend via WiFi
 * Controls buzzer for alerts
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

// ==================== WiFi Configuration ====================
const char* ssid = "YOUR_WIFI_SSID";           // Replace with your WiFi name
const char* password = "YOUR_WIFI_PASSWORD";   // Replace with your WiFi password

// ==================== Backend Configuration ====================
const char* serverUrl = "https://mini-anveshana-2025-26.onrender.com/api/sensors/data";
const char* deviceId = "ESP32_GRAIN_STORAGE_01";

// ==================== Pin Configuration ====================
#define DHT_PIN 4         // DHT11 sensor data pin (GPIO 4)
#define DHT_TYPE DHT11    // DHT sensor type
#define PIR_PIN 13        // PIR motion sensor pin (GPIO 13)
#define BUZZER_PIN 5      // Buzzer pin (GPIO 5)

// ==================== Sensor Objects ====================
DHT dht(DHT_PIN, DHT_TYPE);

// ==================== Timing Configuration ====================
unsigned long lastSendTime = 0;
const unsigned long sendInterval = 5000;  // Send data every 5 seconds

// ==================== Setup Function ====================
void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n=================================");
  Serial.println("ESP32 IoT Grain Storage Monitor");
  Serial.println("=================================\n");
  
  // Initialize pins
  pinMode(PIR_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
  
  // Initialize DHT sensor
  dht.begin();
  Serial.println("✓ DHT11 sensor initialized");
  
  // Connect to WiFi
  connectWiFi();
  
  // Success beep
  beep(1);
  Serial.println("\n✓ System ready!\n");
}

// ==================== Main Loop ====================
void loop() {
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠ WiFi disconnected. Reconnecting...");
    connectWiFi();
  }
  
  // Send data at regular intervals
  if (millis() - lastSendTime >= sendInterval) {
    lastSendTime = millis();
    readAndSendData();
  }
  
  delay(100);  // Small delay to prevent watchdog issues
}

// ==================== WiFi Connection ====================
void connectWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✓ WiFi connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("Signal Strength (RSSI): ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm\n");
  } else {
    Serial.println("\n✗ WiFi connection failed!");
    beep(2);  // Error beep
  }
}

// ==================== Read Sensors and Send Data ====================
void readAndSendData() {
  Serial.println("--- Reading Sensors ---");
  
  // Read DHT11 sensor
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  
  // Read PIR motion sensor (CORRECTED!)
  bool motion = digitalRead(PIR_PIN);
  
  // Check if DHT readings are valid
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("✗ Failed to read from DHT sensor!");
    beep(2);  // Error beep
    return;
  }
  
  // Print sensor values
  Serial.print("🌡️  Temperature: ");
  Serial.print(temperature);
  Serial.println("°C");
  
  Serial.print("💧 Humidity: ");
  Serial.print(humidity);
  Serial.println("%");
  
  Serial.print("🚶 Motion: ");
  if (motion) {
    Serial.println("DETECTED! 🚨");
    beep(3);  // Motion alert - 3 short beeps
  } else {
    Serial.println("None");
  }
  
  // Create JSON payload (CORRECTED MOTION VALUE!)
  String jsonPayload = "{";
  jsonPayload += "\"device_id\":\"" + String(deviceId) + "\",";
  jsonPayload += "\"sensors\":{";
  jsonPayload += "\"temperature\":" + String(temperature) + ",";
  jsonPayload += "\"humidity\":" + String(humidity) + ",";
  jsonPayload += "\"motion\":" + String(motion ? "true" : "false");  // DYNAMIC VALUE
  jsonPayload += "},";
  jsonPayload += "\"timestamp\":\"" + getISOTimestamp() + "\"";
  jsonPayload += "}";
  
  Serial.println("\n📤 Sending to backend...");
  Serial.println("Payload: " + jsonPayload);
  
  // Send HTTP POST request
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    int httpResponseCode = http.POST(jsonPayload);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.print("✓ Response Code: ");
      Serial.println(httpResponseCode);
      Serial.print("Response: ");
      Serial.println(response);
      beep(1);  // Success beep
    } else {
      Serial.print("✗ HTTP Error: ");
      Serial.println(httpResponseCode);
      beep(2);  // Error beep
    }
    
    http.end();
  } else {
    Serial.println("✗ WiFi not connected!");
  }
  
  Serial.println("------------------------\n");
}

// ==================== Buzzer Control ====================
void beep(int count) {
  for (int i = 0; i < count; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(100);
    digitalWrite(BUZZER_PIN, LOW);
    if (i < count - 1) {
      delay(100);
    }
  }
}

// ==================== Get ISO Timestamp ====================
String getISOTimestamp() {
  // This returns a simple timestamp
  // For accurate time, you'd need NTP (Network Time Protocol)
  unsigned long milliseconds = millis();
  return String(milliseconds);
}

// ==================== Notes ====================
/*
 * HARDWARE CONNECTIONS:
 * 
 * DHT11 Temperature/Humidity Sensor:
 *   - VCC  → 3.3V (ESP32)
 *   - GND  → GND (ESP32)
 *   - DATA → GPIO 4 (ESP32)
 * 
 * PIR Motion Sensor (HC-SR501):
 *   - VCC  → 5V (ESP32 VIN)
 *   - GND  → GND (ESP32)
 *   - OUT  → GPIO 13 (ESP32)
 * 
 * Buzzer:
 *   - Positive (+) → GPIO 5 (ESP32)
 *   - Negative (-) → GND (ESP32)
 * 
 * BUZZER PATTERNS:
 *   - 1 beep  = Success (data sent)
 *   - 2 beeps = Error (WiFi/sensor failure)
 *   - 3 beeps = Motion detected!
 * 
 * IMPORTANT:
 *   - Replace WiFi SSID and PASSWORD above
 *   - PIR sensor needs calibration (adjust sensitivity & delay potentiometers)
 *   - DHT11 readings take ~2 seconds, don't read too frequently
 *   - For production, implement NTP for accurate timestamps
 * 
 * LIBRARIES REQUIRED (Install via Arduino IDE Library Manager):
 *   - DHT sensor library by Adafruit
 *   - Adafruit Unified Sensor
 */
