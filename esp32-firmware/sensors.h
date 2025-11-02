/**
 * Sensor Interface Library
 * 
 * Handles all sensor initialization and data reading
 */

#ifndef SENSORS_H
#define SENSORS_H

#include <DHT.h>
#include <Wire.h>
#include <Adafruit_BMP280.h>

// Initialize sensor objects
DHT dht(DHT_PIN, DHT_TYPE);
Adafruit_BMP280 bmp; // I2C

// Sensor data structure
struct SensorData {
  float temperature;    // °C
  float humidity;       // %
  float pressure;       // hPa
  bool motion;          // true/false
  int gasLevel;         // 0-4095 (analog)
  int soilMoisture;     // 0-100 %
};

/**
 * Initialize all sensors
 */
void initSensors() {
  Serial.println("Initializing sensors...");
  
  // DHT22 Temperature & Humidity
  dht.begin();
  Serial.println("  ✓ DHT22 initialized");
  
  // BMP280 Pressure sensor
  Wire.begin(I2C_SDA, I2C_SCL);
  if (bmp.begin(0x76)) {  // Try address 0x76, if fails try 0x77
    Serial.println("  ✓ BMP280 initialized");
    bmp.setSampling(Adafruit_BMP280::MODE_NORMAL,
                    Adafruit_BMP280::SAMPLING_X2,
                    Adafruit_BMP280::SAMPLING_X16,
                    Adafruit_BMP280::FILTER_X16,
                    Adafruit_BMP280::STANDBY_MS_500);
  } else {
    Serial.println("  ⚠ BMP280 not found (continuing without it)");
  }
  
  // PIR Motion Sensor
  pinMode(PIR_PIN, INPUT);
  Serial.println("  ✓ PIR motion sensor configured");
  
  // Analog sensors
  pinMode(GAS_SENSOR_PIN, INPUT);
  pinMode(SOIL_MOISTURE_PIN, INPUT);
  Serial.println("  ✓ Analog sensors configured");
  
  // Warm-up delay for analog sensors
  delay(2000);
}

/**
 * Read temperature from DHT22
 */
float readTemperature() {
  float temp = dht.readTemperature();
  if (isnan(temp)) {
    Serial.println("  ⚠ Failed to read temperature");
    return 0.0;
  }
  Serial.print("  Temperature: ");
  Serial.print(temp);
  Serial.println(" °C");
  return temp;
}

/**
 * Read humidity from DHT22
 */
float readHumidity() {
  float humidity = dht.readHumidity();
  if (isnan(humidity)) {
    Serial.println("  ⚠ Failed to read humidity");
    return 0.0;
  }
  Serial.print("  Humidity: ");
  Serial.print(humidity);
  Serial.println(" %");
  return humidity;
}

/**
 * Read pressure from BMP280
 */
float readPressure() {
  float pressure = bmp.readPressure() / 100.0F; // Convert Pa to hPa
  if (pressure == 0) {
    Serial.println("  ⚠ Failed to read pressure");
    return 0.0;
  }
  Serial.print("  Pressure: ");
  Serial.print(pressure);
  Serial.println(" hPa");
  return pressure;
}

/**
 * Read PIR motion sensor
 */
bool readMotion() {
  bool motion = digitalRead(PIR_PIN);
  Serial.print("  Motion: ");
  Serial.println(motion ? "DETECTED" : "None");
  return motion;
}

/**
 * Read gas sensor (MQ-series)
 */
int readGasLevel() {
  int gasLevel = analogRead(GAS_SENSOR_PIN);
  Serial.print("  Gas Level: ");
  Serial.print(gasLevel);
  Serial.println(" / 4095");
  return gasLevel;
}

/**
 * Read soil moisture sensor
 * Returns percentage (0-100%)
 */
int readSoilMoisture() {
  int rawValue = analogRead(SOIL_MOISTURE_PIN);
  // Convert to percentage (calibrate these values for your sensor)
  int moisture = map(rawValue, 4095, 0, 0, 100);
  moisture = constrain(moisture, 0, 100);
  
  Serial.print("  Soil Moisture: ");
  Serial.print(moisture);
  Serial.println(" %");
  return moisture;
}

/**
 * Read all sensors and return data structure
 */
SensorData readAllSensors() {
  SensorData data;
  
  data.temperature = readTemperature();
  delay(100);
  
  data.humidity = readHumidity();
  delay(100);
  
  data.pressure = readPressure();
  delay(100);
  
  data.motion = readMotion();
  delay(100);
  
  data.gasLevel = readGasLevel();
  delay(100);
  
  data.soilMoisture = readSoilMoisture();
  
  return data;
}

/**
 * Check if any threshold is exceeded
 */
bool checkThresholds(SensorData data) {
  bool alert = false;
  
  if (data.temperature > TEMP_HIGH_THRESHOLD) {
    Serial.println("⚠ ALERT: Temperature too high!");
    alert = true;
  }
  
  if (data.temperature < TEMP_LOW_THRESHOLD) {
    Serial.println("⚠ ALERT: Temperature too low!");
    alert = true;
  }
  
  if (data.humidity > HUMIDITY_HIGH_THRESHOLD) {
    Serial.println("⚠ ALERT: Humidity too high!");
    alert = true;
  }
  
  if (data.gasLevel > GAS_THRESHOLD) {
    Serial.println("⚠ ALERT: Gas detected!");
    alert = true;
  }
  
  if (data.soilMoisture < MOISTURE_LOW_THRESHOLD) {
    Serial.println("⚠ ALERT: Soil too dry!");
    alert = true;
  }
  
  return alert;
}

#endif
