/**
 * Alert Model
 * 
 * Stores alert history
 */

const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    index: true
  },
  
  type: {
    type: String,
    enum: ['temperature_high', 'temperature_low', 'humidity_high', 'humidity_low', 'motion_detected'],
    required: true
  },
  
  message: {
    type: String,
    required: true
  },
  
  value: {
    type: Number,
    required: true
  },
  
  threshold: {
    type: Number,
    required: true
  },
  
  status: {
    type: String,
    enum: ['active', 'acknowledged', 'resolved'],
    default: 'active'
  },
  
  acknowledgedBy: {
    type: String,
    default: null
  },
  
  acknowledgedAt: {
    type: Date,
    default: null
  },
  
  telegramSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
alertSchema.index({ deviceId: 1, createdAt: -1 });
alertSchema.index({ status: 1 });

module.exports = mongoose.model('Alert', alertSchema);
