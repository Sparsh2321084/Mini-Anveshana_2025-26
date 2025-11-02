/**
 * Alert Service - Simplified (No Database)
 * 
 * Handles threshold checking and Telegram notifications
 */

const { sendTelegramAlert } = require('./telegramService');

// In-memory tracking to avoid spam (store recent alerts)
const recentAlerts = new Map();
const ALERT_COOLDOWN = 5 * 60 * 1000; // 5 minutes

/**
 * Check if sensor data exceeds thresholds
 */
async function checkThresholds(sensorData) {
  try {
    // Get thresholds from environment variables
    const thresholds = {
      temperatureHigh: parseFloat(process.env.TEMP_HIGH_THRESHOLD) || 35,
      temperatureLow: parseFloat(process.env.TEMP_LOW_THRESHOLD) || 15,
      humidityHigh: parseFloat(process.env.HUMIDITY_HIGH_THRESHOLD) || 70,
      humidityLow: parseFloat(process.env.HUMIDITY_LOW_THRESHOLD) || 30,
      motionDetection: process.env.MOTION_DETECTION !== 'false'
    };
    
    const alerts = [];
    
    // Check temperature high
    if (sensorData.temperature > thresholds.temperatureHigh) {
      const alert = await createAlert({
        deviceId: sensorData.deviceId,
        type: 'temperature_high',
        message: `Temperature is too high: ${sensorData.temperature}°C`,
        value: sensorData.temperature,
        threshold: thresholds.temperatureHigh
      });
      if (alert) alerts.push(alert);
    }
    
    // Check temperature low
    if (sensorData.temperature < thresholds.temperatureLow) {
      const alert = await createAlert({
        deviceId: sensorData.deviceId,
        type: 'temperature_low',
        message: `Temperature is too low: ${sensorData.temperature}°C`,
        value: sensorData.temperature,
        threshold: thresholds.temperatureLow
      });
      if (alert) alerts.push(alert);
    }
    
    // Check humidity high
    if (sensorData.humidity > thresholds.humidityHigh) {
      const alert = await createAlert({
        deviceId: sensorData.deviceId,
        type: 'humidity_high',
        message: `Humidity is too high: ${sensorData.humidity}%`,
        value: sensorData.humidity,
        threshold: thresholds.humidityHigh
      });
      if (alert) alerts.push(alert);
    }
    
    // Check humidity low
    if (sensorData.humidity < thresholds.humidityLow) {
      const alert = await createAlert({
        deviceId: sensorData.deviceId,
        type: 'humidity_low',
        message: `Humidity is too low: ${sensorData.humidity}%`,
        value: sensorData.humidity,
        threshold: thresholds.humidityLow
      });
      if (alert) alerts.push(alert);
    }
    
    // Check motion detection
    if (sensorData.motion && thresholds.motionDetection) {
      const alert = await createAlert({
        deviceId: sensorData.deviceId,
        type: 'motion_detected',
        message: `Motion detected by PIR sensor`,
        value: 1,
        threshold: 1
      });
      if (alert) alerts.push(alert);
    }
    
    return alerts;
    
  } catch (error) {
    console.error('Error checking thresholds:', error);
    return [];
  }
}

/**
 * Create alert and send notification (no database storage)
 */
async function createAlert(alertData) {
  try {
    // Check if similar alert exists recently (avoid spam)
    const alertKey = `${alertData.deviceId}_${alertData.type}`;
    const lastAlertTime = recentAlerts.get(alertKey);
    
    if (lastAlertTime && (Date.now() - lastAlertTime) < ALERT_COOLDOWN) {
      console.log(`⚠ Similar alert already sent recently, skipping: ${alertData.type}`);
      return null;
    }
    
    // Create alert object (not saved to database)
    const alert = {
      ...alertData,
      createdAt: new Date(),
      status: 'active'
    };
    
    console.log(`⚠ Alert triggered: ${alertData.type} - ${alertData.message}`);
    
    // Send Telegram notification
    const telegramSent = await sendTelegramAlert(alert);
    
    if (telegramSent) {
      alert.telegramSent = true;
      // Remember this alert to prevent spam
      recentAlerts.set(alertKey, Date.now());
      
      // Clean up old entries periodically
      if (recentAlerts.size > 100) {
        const now = Date.now();
        for (const [key, time] of recentAlerts.entries()) {
          if (now - time > ALERT_COOLDOWN) {
            recentAlerts.delete(key);
          }
        }
      }
    }
    
    return alert;
    
  } catch (error) {
    console.error('Error creating alert:', error);
    return null;
  }
}

module.exports = {
  checkThresholds,
  createAlert
};
