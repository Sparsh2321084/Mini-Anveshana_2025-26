import { TrendingUp, TrendingDown } from 'lucide-react';
import './SensorCard.css';

function SensorCard({ title, value, unit, icon, color, trend, isBoolean, subtitle }) {
  const trendValue = parseFloat(trend);
  const isPositiveTrend = trendValue > 0;

  return (
    <div className="sensor-card animate-fade-in">
      <div className="sensor-card-header">
        <div className="sensor-icon" style={{ background: `${color}20`, color }}>
          {icon}
        </div>
        <div>
          <h3 className="sensor-title">{title}</h3>
          {subtitle && <p className="sensor-subtitle">{subtitle}</p>}
        </div>
      </div>

      <div className="sensor-value-container">
        <div className="sensor-value">
          {isBoolean ? value : (
            <>
              {typeof value === 'number' ? value.toFixed(1) : value}
              <span className="sensor-unit">{unit}</span>
            </>
          )}
        </div>

        {!isBoolean && trend !== undefined && trend !== 0 && (
          <div className={`sensor-trend ${isPositiveTrend ? 'positive' : 'negative'}`}>
            {isPositiveTrend ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {Math.abs(trendValue)}%
          </div>
        )}
      </div>

      <div className="sensor-status">
        <span className="status-indicator" style={{ background: color }}></span>
        <span className="status-text">Live Data</span>
      </div>
    </div>
  );
}

export default SensorCard;
