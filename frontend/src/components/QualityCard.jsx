import React from 'react';
import './QualityCard.css';

function QualityCard({ quality }) {
  if (!quality) {
    return (
      <div className="quality-card loading">
        <h3>🌾 Grain Quality</h3>
        <p>Waiting for sensor data...</p>
      </div>
    );
  }

  return (
    <div className="quality-card" style={{ borderColor: quality.color }}>
      <div className="quality-header">
        <h3>🌾 Grain Quality Analysis</h3>
        <span className="quality-status" style={{ backgroundColor: quality.color }}>
          {quality.status}
        </span>
      </div>

      <div className="quality-score">
        <div className="score-circle" style={{ borderColor: quality.color }}>
          <span className="score-value">{quality.score}</span>
          <span className="score-max">/100</span>
        </div>
        <div className="score-details">
          <div className="score-grade" style={{ color: quality.color }}>
            {quality.grade}
          </div>
          <div className="score-humidity">
            💧 Moisture: {quality.humidity}
          </div>
          <div className="score-shelf-life">
            📦 Shelf Life: {quality.shelfLife}
          </div>
        </div>
      </div>

      {quality.hasIssues && (
        <div className="quality-issues">
          <h4>⚠️ Issues</h4>
          <ul>
            {quality.details.issues.map((issue, index) => (
              <li key={index}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      {quality.details.recommendations.length > 0 && (
        <div className="quality-recommendations">
          <h4>💡 Recommendations</h4>
          <ul>
            {quality.details.recommendations.slice(0, 3).map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default QualityCard;
