/**
 * Alert Controller
 * 
 * Manages alert configuration and history
 */

const Alert = require('../models/Alert');
const AlertConfig = require('../models/AlertConfig');

/**
 * Get all alerts with filtering
 */
exports.getAlerts = async (req, res) => {
  try {
    const { deviceId, status, limit = 50 } = req.query;
    
    const query = {};
    if (deviceId) query.deviceId = deviceId;
    if (status) query.status = status;
    
    const alerts = await Alert.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      count: alerts.length,
      alerts
    });
    
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({
      error: 'Failed to fetch alerts',
      message: error.message
    });
  }
};

/**
 * Get active alerts only
 */
exports.getActiveAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ status: 'active' })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: alerts.length,
      alerts
    });
    
  } catch (error) {
    console.error('Error fetching active alerts:', error);
    res.status(500).json({
      error: 'Failed to fetch active alerts',
      message: error.message
    });
  }
};

/**
 * Update alert configuration (thresholds)
 */
exports.updateAlertConfig = async (req, res) => {
  try {
    const { deviceId, thresholds } = req.body;
    
    const config = await AlertConfig.findOneAndUpdate(
      { deviceId: deviceId || 'default' },
      { 
        deviceId: deviceId || 'default',
        thresholds,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    res.json({
      success: true,
      message: 'Alert configuration updated',
      config
    });
    
  } catch (error) {
    console.error('Error updating alert config:', error);
    res.status(500).json({
      error: 'Failed to update alert config',
      message: error.message
    });
  }
};

/**
 * Get alert configuration
 */
exports.getAlertConfig = async (req, res) => {
  try {
    const { deviceId } = req.query;
    
    let config = await AlertConfig.findOne({ 
      deviceId: deviceId || 'default' 
    });
    
    // Return default config if none exists
    if (!config) {
      config = {
        deviceId: deviceId || 'default',
        thresholds: {
          temperatureHigh: 35,
          temperatureLow: 10,
          humidityHigh: 80,
          humidityLow: 20,
          motionDetection: true
        }
      };
    }
    
    res.json({
      success: true,
      config
    });
    
  } catch (error) {
    console.error('Error fetching alert config:', error);
    res.status(500).json({
      error: 'Failed to fetch alert config',
      message: error.message
    });
  }
};

/**
 * Acknowledge an alert
 */
exports.acknowledgeAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { acknowledgedBy } = req.body;
    
    const alert = await Alert.findByIdAndUpdate(
      alertId,
      {
        status: 'acknowledged',
        acknowledgedBy: acknowledgedBy || 'user',
        acknowledgedAt: new Date()
      },
      { new: true }
    );
    
    if (!alert) {
      return res.status(404).json({
        error: 'Alert not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Alert acknowledged',
      alert
    });
    
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    res.status(500).json({
      error: 'Failed to acknowledge alert',
      message: error.message
    });
  }
};

/**
 * Clear old alerts
 */
exports.clearAlertHistory = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    const deleteDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const result = await Alert.deleteMany({
      createdAt: { $lt: deleteDate },
      status: { $ne: 'active' }
    });
    
    res.json({
      success: true,
      message: `Cleared alerts older than ${days} days`,
      deletedCount: result.deletedCount
    });
    
  } catch (error) {
    console.error('Error clearing alerts:', error);
    res.status(500).json({
      error: 'Failed to clear alerts',
      message: error.message
    });
  }
};
