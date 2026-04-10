import './QualityInsights.css';

function QualityInsights({ insight, quality }) {
  if (!insight) {
    return (
      <div className="quality-insights-card">
        <div className="quality-insights-header">
          <div>
            <p className="quality-insights-eyebrow">Operations Insight</p>
            <h3>Storage Copilot</h3>
          </div>
          <span className="quality-insights-badge standby">Preparing</span>
        </div>
        <p className="quality-insights-summary">
          Insight will appear as soon as live storage data arrives.
        </p>
      </div>
    );
  }

  return (
    <div className="quality-insights-card">
      <div className="quality-insights-header">
        <div>
          <p className="quality-insights-eyebrow">Operations Insight</p>
          <h3>{insight.headline}</h3>
        </div>
        <span className={`quality-insights-badge ${insight.riskLevel || 'medium'}`}>
          {(insight.riskLevel || quality?.grade || 'stable').toUpperCase()}
        </span>
      </div>

      <p className="quality-insights-summary">{insight.summary}</p>

      {insight.topDrivers?.length > 0 && (
        <div className="quality-insights-block">
          <h4>Main Drivers</h4>
          <ul>
            {insight.topDrivers.map((driver) => (
              <li key={driver}>{driver}</li>
            ))}
          </ul>
        </div>
      )}

      {insight.actions?.length > 0 && (
        <div className="quality-insights-block">
          <h4>Next Actions</h4>
          <ul>
            {insight.actions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="quality-insights-footer">
        <span>
          Source: {insight.source === 'ollama' ? 'Ollama AI' : insight.source === 'openai' ? 'AI model' : 'Smart rules engine'}
        </span>
        <span>{new Date(insight.updatedAt).toLocaleTimeString()}</span>
      </div>
    </div>
  );
}

export default QualityInsights;
