/**
 * Sensor Data Controller - Simplified (In-Memory Storage)
 * 
 * No database - stores only latest sensor readings in memory
 * Perfect for real-time display without historical data storage
 */

const { checkThresholds } = require('../services/alertService');
const { broadcastSensorData } = require('../services/websocketService');

// In-memory storage for latest sensor data
let latestSensorData = {
  deviceId: null,
  temperature: null,
  humidity: null,
  motion: false,
  timestamp: null,
  history: [] // Keep last 50 readings for charts
};

const MAX_HISTORY = 50; // Keep last 50 data points for frontend charts

/**
 * Receive sensor data from ESP32
 */
exports.receiveSensorData = async (req, res) => {
  try {
    const { device_id, sensors, timestamp } = req.body;
    
    // Validate required fields
    if (!device_id || !sensors) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['device_id', 'sensors']
      });
    }
    
    // Create new data point
    const newData = {
      deviceId: device_id,
      temperature: sensors.temperature,
      humidity: sensors.humidity,
      motion: sensors.motion || false,
      timestamp: timestamp ? new Date(timestamp) : new Date()
    };
    
    // Update current data (preserve history array)
    latestSensorData.deviceId = newData.deviceId;
    latestSensorData.temperature = newData.temperature;
    latestSensorData.humidity = newData.humidity;
    latestSensorData.motion = newData.motion;
    latestSensorData.timestamp = newData.timestamp;
    
    // Add to history (keep last MAX_HISTORY points)
    if (!latestSensorData.history) {
      latestSensorData.history = []; // Initialize if undefined
    }
    latestSensorData.history.push(newData);
    if (latestSensorData.history.length > MAX_HISTORY) {
      latestSensorData.history.shift(); // Remove oldest
    }
    
    console.log(`✓ Sensor data received from ${device_id}`);
    console.log(`  Temperature: ${sensors.temperature}°C`);
    console.log(`  Humidity: ${sensors.humidity}%`);
    console.log(`  Motion: ${sensors.motion ? '🚨 DETECTED' : 'None'} (raw: ${sensors.motion})`);
    
    // Check thresholds and send alerts if needed (optional)
    let alerts = [];
    try {
      alerts = await checkThresholds(newData);
    } catch (error) {
      console.log('⚠ Alert service not configured');
    }
    
    // Broadcast data to connected WebSocket clients (real-time updates)
    broadcastSensorData({
      deviceId: device_id,
      data: sensors,
      alerts: alerts,
      timestamp: newData.timestamp
    });
    
    res.status(201).json({
      success: true,
      message: 'Data received successfully',
      alertsTriggered: alerts.length
    });
    
  } catch (error) {
    console.error('Error processing sensor data:', error);
    res.status(500).json({
      error: 'Failed to process sensor data',
      message: error.message
    });
  }
};

/**
 * Get latest sensor data
 */
exports.getLatestData = async (req, res) => {
  // If called directly (not from Telegram), handle as HTTP response
  if (res) {
    try {
      if (!latestSensorData.deviceId) {
        return res.status(404).json({
          error: 'No data available yet',
          message: 'Waiting for ESP32 to send data'
        });
      }
      
      res.json({
        success: true,
        data: {
          deviceId: latestSensorData.deviceId,
          temperature: latestSensorData.temperature,
          humidity: latestSensorData.humidity,
          motion: latestSensorData.motion,
          timestamp: latestSensorData.timestamp
        }
      });
    } catch (error) {
      console.error('Error fetching latest data:', error);
      res.status(500).json({
        error: 'Failed to fetch data',
        message: error.message
      });
    }
  } else {
    // Called from Telegram service - return data directly
    return latestSensorData.deviceId ? {
      deviceId: latestSensorData.deviceId,
      temperature: latestSensorData.temperature,
      humidity: latestSensorData.humidity,
      motion: latestSensorData.motion,
      timestamp: latestSensorData.timestamp
    } : null;
  }
};

/**
 * Get historical sensor data (last 50 readings)
 */
exports.getHistoricalData = async (req, res) => {
  try {
    res.json({
      success: true,
      data: latestSensorData.history,
      count: latestSensorData.history.length
    });
    
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({
      error: 'Failed to fetch historical data',
      message: error.message
    });
  }
};

/**
 * Get data for specific device (same as latest for single device setup)
 */
exports.getDeviceData = async (req, res) => {
  try {
    const { deviceId } = req.params;
    
    if (latestSensorData.deviceId !== deviceId) {
      return res.status(404).json({
        error: 'Device not found',
        availableDevice: latestSensorData.deviceId
      });
    }
    
    res.json({
      success: true,
      deviceId,
      dataPoints: latestSensorData.history.length,
      data: latestSensorData.history
    });
    
  } catch (error) {
    console.error('Error fetching device data:', error);
    res.status(500).json({
      error: 'Failed to fetch device data',
      message: error.message
    });
  }
};

/**
 * Get statistics from in-memory history
 */
exports.getStatistics = async (req, res) => {
  try {
    const history = latestSensorData.history;
    
    if (history.length === 0) {
      return res.status(404).json({
        error: 'No data available for statistics'
      });
    }
    
    // Calculate statistics
    const temps = history.map(d => d.temperature).filter(t => t !== null);
    const humidities = history.map(d => d.humidity).filter(h => h !== null);
    const motionEvents = history.filter(d => d.motion).length;
    
    const stats = {
      avgTemp: temps.length ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(2) : null,
      maxTemp: temps.length ? Math.max(...temps) : null,
      minTemp: temps.length ? Math.min(...temps) : null,
      avgHumidity: humidities.length ? (humidities.reduce((a, b) => a + b, 0) / humidities.length).toFixed(2) : null,
      maxHumidity: humidities.length ? Math.max(...humidities) : null,
      minHumidity: humidities.length ? Math.min(...humidities) : null,
      motionEvents,
      dataPoints: history.length
    };
    
    res.json({
      success: true,
      period: `Last ${history.length} readings`,
      statistics: stats
    });
    
  } catch (error) {
    console.error('Error calculating statistics:', error);
    res.status(500).json({
      error: 'Failed to calculate statistics',
      message: error.message
    });
  }
};

/**
 * Clear history (for testing)
 */
exports.cleanupOldData = async (req, res) => {
  try {
    const count = latestSensorData.history.length;
    latestSensorData.history = [];
    
    res.json({
      success: true,
      message: 'History cleared',
      deletedCount: count
    });
    
  } catch (error) {
    console.error('Error cleaning up data:', error);
    res.status(500).json({
      error: 'Failed to cleanup data',
      message: error.message
    });
  }
};

// Export the in-memory data for Telegram service
exports.latestSensorData = latestSensorData;
