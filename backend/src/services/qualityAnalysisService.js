/**
 * Grain Quality Analysis Service
 * Analyzes grain quality based on humidity/moisture content
 * 
 * GRAIN MOISTURE STANDARDS:
 * - 10-12%: Excellent (Safe for long-term storage)
 * - 12-14%: Good (Safe for medium-term storage)
 * - 14-16%: Fair (Monitor closely, short-term only)
 * - 16-18%: Poor (Risk of mold growth)
 * - >18%: Critical (Immediate action required)
 */

/**
 * Analyze grain quality based on current sensor data
 */
function analyzeGrainQuality(sensorData, history = []) {
  const humidity = sensorData.humidity;
  let score = 100;
  let grade = '';
  let color = '';
  let status = '';
  let issues = [];
  let recommendations = [];
  
  // Humidity/Moisture Analysis (Primary Factor)
  if (humidity <= 12) {
    // EXCELLENT - Optimal storage conditions
    score = 95;
    grade = 'EXCELLENT';
    color = '#22c55e';  // Green
    status = '✅ OPTIMAL';
    recommendations.push('Perfect moisture level for long-term storage');
    recommendations.push('Continue maintaining current conditions');
    
  } else if (humidity <= 14) {
    // GOOD - Safe for storage
    score = 85;
    grade = 'GOOD';
    color = '#84cc16';  // Light green
    status = '✅ SAFE';
    recommendations.push('Good storage conditions maintained');
    recommendations.push('Safe for 6-12 months storage');
    
  } else if (humidity <= 16) {
    // FAIR - Monitor closely
    score = 70;
    grade = 'FAIR';
    color = '#eab308';  // Yellow
    status = '⚠️ MONITOR';
    issues.push('Moisture slightly elevated');
    recommendations.push('Increase ventilation to reduce humidity');
    recommendations.push('Safe for 3-6 months storage only');
    recommendations.push('Check for condensation regularly');
    
  } else if (humidity <= 18) {
    // POOR - Risk of spoilage
    score = 50;
    grade = 'POOR';
    color = '#f97316';  // Orange
    status = '⚠️ RISK';
    issues.push('High moisture - Risk of mold growth');
    issues.push('Grain respiration may cause heating');
    recommendations.push('⚡ URGENT: Reduce humidity immediately');
    recommendations.push('Use dehumidifiers or improve ventilation');
    recommendations.push('Inspect grain for mold signs');
    recommendations.push('Consider drying the grain');
    
  } else if (humidity <= 20) {
    // CRITICAL - Immediate action needed
    score = 30;
    grade = 'CRITICAL';
    color = '#ef4444';  // Red
    status = '🚨 DANGER';
    issues.push('⚠️ CRITICAL moisture level!');
    issues.push('Rapid mold growth likely');
    issues.push('Grain heating probable');
    issues.push('Quality degradation in progress');
    recommendations.push('🚨 IMMEDIATE ACTION REQUIRED');
    recommendations.push('Turn on dehumidifiers NOW');
    recommendations.push('Inspect grain immediately');
    recommendations.push('Consider emergency drying');
    recommendations.push('Separate affected batches');
    
  } else {
    // SEVERE - Emergency situation
    score = 10;
    grade = 'SEVERE';
    color = '#dc2626';  // Dark red
    status = '🚨 EMERGENCY';
    issues.push('🚨 SEVERE moisture - Grain spoilage imminent!');
    issues.push('Mycotoxin contamination risk');
    issues.push('Complete quality loss within days');
    recommendations.push('🚨 EMERGENCY: Stop all storage operations');
    recommendations.push('Dry grain immediately or discard');
    recommendations.push('Do not mix with other batches');
    recommendations.push('Consult grain quality expert');
  }
  
  // Temperature Impact on Moisture Risk
  if (sensorData.temperature > 25 && humidity > 14) {
    score -= 10;
    issues.push('High temperature + humidity = Accelerated spoilage risk');
    recommendations.push('High temp + moisture combination is dangerous');
  }
  
  // Historical Trend Analysis (if history available)
  if (history.length >= 12) {
    const recentReadings = history.slice(-12);  // Last 12 readings (1 hour if 5s interval)
    const avgHumidity = recentReadings.reduce((sum, r) => sum + r.humidity, 0) / recentReadings.length;
    const humidityTrend = humidity - avgHumidity;
    
    if (humidityTrend > 2) {
      issues.push(`Humidity rising rapidly (+${humidityTrend.toFixed(1)}% in last hour)`);
      recommendations.push('Investigate source of moisture increase');
    } else if (humidityTrend < -2) {
      recommendations.push(`Good: Humidity decreasing (-${Math.abs(humidityTrend).toFixed(1)}% in last hour)`);
    }
  }
  
  // Storage Duration Estimate
  let estimatedShelfLife = '';
  if (humidity <= 12) {
    estimatedShelfLife = '12+ months';
  } else if (humidity <= 14) {
    estimatedShelfLife = '6-12 months';
  } else if (humidity <= 16) {
    estimatedShelfLife = '3-6 months';
  } else if (humidity <= 18) {
    estimatedShelfLife = '1-3 months';
  } else if (humidity <= 20) {
    estimatedShelfLife = '< 1 month';
  } else {
    estimatedShelfLife = 'Days only';
  }
  
  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));
  
  return {
    score,
    grade,
    color,
    status,
    humidity,
    temperature: sensorData.temperature,
    issues,
    recommendations,
    estimatedShelfLife,
    analyzedAt: new Date(),
    deviceId: sensorData.deviceId
  };
}

/**
 * Determine if quality alert should be sent
 */
function shouldSendQualityAlert(analysis, lastAlertTime) {
  const ALERT_COOLDOWN = 30 * 60 * 1000; // 30 minutes
  
  // Send alert if critical or severe
  if (analysis.score < 40) {
    if (!lastAlertTime || (Date.now() - lastAlertTime > ALERT_COOLDOWN)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Format quality analysis for display
 */
function formatQualityReport(analysis) {
  return {
    summary: `${analysis.status} - Quality Score: ${analysis.score}/100`,
    grade: analysis.grade,
    score: analysis.score,
    color: analysis.color,
    humidity: `${analysis.humidity}%`,
    shelfLife: analysis.estimatedShelfLife,
    issueCount: analysis.issues.length,
    hasIssues: analysis.issues.length > 0,
    details: {
      issues: analysis.issues,
      recommendations: analysis.recommendations
    }
  };
}

module.exports = {
  analyzeGrainQuality,
  shouldSendQualityAlert,
  formatQualityReport
};
