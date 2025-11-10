/**
 * Dynamic Threshold Configuration
 * Allows runtime changes to alert thresholds
 */

// Initialize thresholds from environment variables
let thresholds = {
  temperatureHigh: parseFloat(process.env.TEMP_HIGH_THRESHOLD) || 35,
  temperatureLow: parseFloat(process.env.TEMP_LOW_THRESHOLD) || 15,
  humidityHigh: parseFloat(process.env.HUMIDITY_HIGH_THRESHOLD) || 70,
  humidityLow: parseFloat(process.env.HUMIDITY_LOW_THRESHOLD) || 30,
  motionDetection: process.env.MOTION_DETECTION !== 'false' // default true
};

/**
 * Get current thresholds
 */
function getThresholds() {
  return { ...thresholds };
}

/**
 * Update thresholds
 */
function updateThresholds(newThresholds) {
  thresholds = {
    ...thresholds,
    ...newThresholds
  };
  console.log('✓ Thresholds updated:', thresholds);
  return thresholds;
}

/**
 * Reset to default thresholds from environment
 */
function resetThresholds() {
  thresholds = {
    temperatureHigh: parseFloat(process.env.TEMP_HIGH_THRESHOLD) || 35,
    temperatureLow: parseFloat(process.env.TEMP_LOW_THRESHOLD) || 15,
    humidityHigh: parseFloat(process.env.HUMIDITY_HIGH_THRESHOLD) || 70,
    humidityLow: parseFloat(process.env.HUMIDITY_LOW_THRESHOLD) || 30,
    motionDetection: process.env.MOTION_DETECTION !== 'false'
  };
  console.log('✓ Thresholds reset to defaults:', thresholds);
  return thresholds;
}

module.exports = {
  getThresholds,
  updateThresholds,
  resetThresholds
};
