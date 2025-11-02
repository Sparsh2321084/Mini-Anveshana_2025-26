/**
 * Alert Configuration Model
 * 
 * Stores threshold settings per device
 */

const mongoose = require('mongoose');

const alertConfigSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true,
    default: 'default'
  },
  
  thresholds: {
    temperatureHigh: {
      type: Number,
      default: 35
    },
    temperatureLow: {
      type: Number,
      default: 10
    },
    humidityHigh: {
      type: Number,
      default: 80
    },
    humidityLow: {
      type: Number,
      default: 20
    },
    motionDetection: {
      type: Boolean,
      default: true
    }
    
    // Future thresholds (ready to activate)
    /*
    gasThreshold: {
      type: Number,
      default: 500
    },
    moistureLow: {
      type: Number,
      default: 30
    }
    */
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AlertConfig', alertConfigSchema);
