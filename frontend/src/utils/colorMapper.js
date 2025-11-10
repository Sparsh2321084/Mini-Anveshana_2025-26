/**
 * Temperature to Color Mapper
 * Maps temperature values to RGB colors for grain storage visualization
 */

/**
 * Get color based on temperature value
 * @param {number} temperature - Temperature in Celsius
 * @returns {string} Hex color code
 */
export function getTemperatureColor(temperature) {
  if (temperature < 15) {
    // Cold - Blue
    return '#3b82f6';
  } else if (temperature >= 15 && temperature < 25) {
    // Optimal - Green
    return '#10b981';
  } else if (temperature >= 25 && temperature < 30) {
    // Warm - Yellow
    return '#fbbf24';
  } else if (temperature >= 30 && temperature < 35) {
    // Hot - Orange
    return '#f97316';
  } else {
    // Critical - Red
    return '#ef4444';
  }
}

/**
 * Get storage status based on temperature and humidity
 * @param {number} temperature - Temperature in Celsius
 * @param {number} humidity - Humidity percentage
 * @returns {object} Status object with label and color
 */
export function getStorageStatus(temperature, humidity) {
  if (temperature > 35 || humidity > 70) {
    return {
      label: 'Critical',
      color: '#ef4444',
      emoji: '🔴'
    };
  } else if (temperature > 30 || humidity > 60) {
    return {
      label: 'Warning',
      color: '#f97316',
      emoji: '⚠️'
    };
  } else if (temperature < 15 || humidity < 30) {
    return {
      label: 'Suboptimal',
      color: '#fbbf24',
      emoji: '🟡'
    };
  } else {
    return {
      label: 'Optimal',
      color: '#10b981',
      emoji: '✅'
    };
  }
}

/**
 * Interpolate between two colors for smooth transitions
 * @param {string} color1 - Start color (hex)
 * @param {string} color2 - End color (hex)
 * @param {number} factor - Interpolation factor (0-1)
 * @returns {string} Interpolated color (hex)
 */
export function interpolateColor(color1, color2, factor) {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  
  const r = Math.round(c1.r + (c2.r - c1.r) * factor);
  const g = Math.round(c1.g + (c2.g - c1.g) * factor);
  const b = Math.round(c1.b + (c2.b - c1.b) * factor);
  
  return rgbToHex(r, g, b);
}

/**
 * Convert hex color to RGB object
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

/**
 * Convert RGB to hex color
 */
function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Get glow intensity based on temperature (for critical states)
 * @param {number} temperature - Temperature in Celsius
 * @returns {number} Glow intensity (0-1)
 */
export function getGlowIntensity(temperature) {
  if (temperature < 30) return 0;
  if (temperature >= 35) return 1;
  // Linear interpolation between 30-35°C
  return (temperature - 30) / 5;
}
