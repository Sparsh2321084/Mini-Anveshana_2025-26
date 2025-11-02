/**
 * Sensor Data Model (MongoDB)
 * 
 * Currently supports: Temperature, Humidity, Motion (PIR)
 * Designed to be easily extensible for future sensors
 */

const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    index: true
  },
  
  // Current sensors
  temperature: {
    type: Number,
    required: true
  },
  
  humidity: {
    type: Number,
    required: true
  },
  
  motion: {
    type: Boolean,
    default: false
  },
  
  // Future sensor fields (commented out, ready to activate)
  /*
  pressure: {
    type: Number,
    default: null
  },
  
  gasLevel: {
    type: Number,
    default: null
  },
  
  soilMoisture: {
    type: Number,
    default: null
  },
  
  lightLevel: {
    type: Number,
    default: null
  },
  */
  
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Indexes for better query performance
sensorDataSchema.index({ deviceId: 1, timestamp: -1 });

// Auto-delete old data after 30 days (optional)
sensorDataSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('SensorData', sensorDataSchema);
