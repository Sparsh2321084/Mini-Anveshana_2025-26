import { lazy, Suspense, useMemo, useState } from 'react';
import { AlertCircle, Database, Droplets, Eye, LineChart, Radar, Thermometer, Warehouse } from 'lucide-react';
import SensorCard from '../components/SensorCard';
import ChartCard from '../components/ChartCard';
import AlertsList from '../components/AlertsList';
import QualityCard from '../components/QualityCard';
import ErrorBoundary from '../components/ErrorBoundary';
import LastUpdatedLabel from '../features/dashboard/LastUpdatedLabel';
import { useDashboardData } from '../features/dashboard/useDashboardData';
import QualityInsights from '../features/quality/QualityInsights';
import './Dashboard.css';

const GrainContainer3D = lazy(() => import('../components/GrainContainer3D'));

function Dashboard() {
  const {
    latestData,
    historicalData,
    alerts,
    quality,
    insight,
    loading,
    wsConnected
  } = useDashboardData();
  const [showVisualization, setShowVisualization] = useState(false);

  const activeAlerts = useMemo(
    () => alerts.filter((alert) => alert.status === 'active'),
    [alerts]
  );

  const dataStale = !latestData?.timestamp || (Date.now() - new Date(latestData.timestamp).getTime()) / 1000 > 30;
  const healthTone = dataStale ? 'stale' : wsConnected ? 'live' : 'offline';

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard grain-theme" id="top">
      <header className="dashboard-header">
        <div className="container">
          <div className="header-content">
            <div>
              <h1>
                <Warehouse className="header-icon" />
                Smart Grain Storage System
              </h1>
              <p className="header-subtitle">
                Real-time grain monitoring with a lighter dashboard backbone and clearer operator guidance.
              </p>
            </div>
            <div className="header-status">
              <div className={`status-badge ${wsConnected && !dataStale ? 'connected' : 'disconnected'}`}>
                <span className="status-dot"></span>
                {wsConnected && !dataStale ? 'Live Monitoring' : dataStale ? 'Data Stale' : 'Offline'}
              </div>
              <div className="last-update">
                Last update: <LastUpdatedLabel timestamp={latestData?.timestamp} />
              </div>
              {activeAlerts.length > 0 && (
                <div className="alert-badge">
                  <AlertCircle size={16} />
                  {activeAlerts.length} Storage Alerts
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container dashboard-content">
        <section className="mission-strip" id="overview">
          <div className="mission-copy">
            <p className="section-kicker">Dashboard</p>
            <h2>Smart Grain Storage Monitoring System</h2>
            <p>
              Track temperature, humidity, and storage health inside grain warehouses. 
              The system analyzes sensor data continuously and alerts operators before 
              conditions become unsafe for stored grain.
            </p>
          </div>
          <div className="mission-stats">
            <div className={`mission-stat ${healthTone}`}>
              <span>Connection</span>
              <strong>{wsConnected && !dataStale ? 'Streaming' : dataStale ? 'Stale feed' : 'Reconnecting'}</strong>
            </div>
            <div className="mission-stat">
              <span>Quality grade</span>
              <strong>{quality?.grade || 'Waiting'}</strong>
            </div>
            <div className="mission-stat">
              <span>Active alerts</span>
              <strong>{activeAlerts.length}</strong>
            </div>
          </div>
        </section>

        {dataStale && (
          <div className="stale-data-warning">
            <AlertCircle size={20} />
            <div>
              <strong>ESP32 Disconnected</strong>
              <p>No fresh reading has arrived recently. Check the ESP32 connection and power supply.</p>
            </div>
          </div>
        )}

        <section className="quality-layout" id="quality">
          <QualityCard quality={quality} />
          <div id="insights">
            <QualityInsights insight={insight} quality={quality} />
          </div>
        </section>

        <section className="sensor-grid">
          <SensorCard
            title="Storage Temperature"
            value={latestData?.temperature || 0}
            unit="°C"
            icon={<Thermometer />}
            color="#f59e0b"
            trend={calculateTrend(historicalData, 'temperature')}
            subtitle="Grain temperature"
          />
          <SensorCard
            title="Storage Humidity"
            value={latestData?.humidity || 0}
            unit="%"
            icon={<Droplets />}
            color="#3b82f6"
            trend={calculateTrend(historicalData, 'humidity')}
            subtitle="Moisture level"
          />
          <SensorCard
            title="Motion Detection"
            value={latestData?.motion ? 'Detected' : 'Clear'}
            unit=""
            icon={<Eye />}
            color="#10b981"
            isBoolean={true}
            subtitle="Security status"
          />
          <SensorCard
            title="Storage Status"
            value={getStorageStatus(latestData)}
            unit=""
            icon={<Database />}
            color="#8b5cf6"
            subtitle="Overall condition"
          />
        </section>

        <section className="charts-section">
          <div className="section-intro">
            <p className="section-kicker">Trend Memory</p>
            <h2><LineChart size={20} /> Focused trend tracking</h2>
            <p>Charts sit in their own section now, so they only update when sensor history changes.</p>
          </div>
          <div className="charts-grid">
            <ChartCard
              title="Temperature Monitoring"
              data={historicalData}
              dataKey="temperature"
              color="#f59e0b"
              unit="°C"
            />
            <ChartCard
              title="Humidity Tracking"
              data={historicalData}
              dataKey="humidity"
              color="#3b82f6"
              unit="%"
            />
          </div>
        </section>

        <section className="visualization-section" id="visualization">
          <div className="card visualization-shell">
            <div className="visualization-header">
              <div>
                <p className="section-kicker">On-Demand Scene</p>
                <h2 className="section-title">
                  <Radar size={20} />
                  3D Grain Storage Container
                </h2>
                <p className="visualization-copy">
                  The 3D monitor only loads when requested, which cuts a lot of browser work during normal dashboard use.
                </p>
              </div>
              <button className="btn btn-primary visualization-toggle" onClick={() => setShowVisualization((value) => !value)}>
                {showVisualization ? 'Hide 3D View' : 'Load 3D View'}
              </button>
            </div>

            <ErrorBoundary>
              {showVisualization ? (
                <Suspense fallback={<div className="visualization-loading">Loading 3D monitor...</div>}>
                  <GrainContainer3D data={latestData} />
                </Suspense>
              ) : (
                <div className="visualization-placeholder">
                  <Warehouse size={28} />
                  <div>
                    <strong>3D scene is paused</strong>
                    <p>Open it only when you need a live spatial view of the storage container.</p>
                  </div>
                </div>
              )}
            </ErrorBoundary>
          </div>
        </section>

        {alerts.length > 0 && (
          <section className="alerts-section">
            <div className="card">
              <h2 className="section-title">
                <AlertCircle size={20} />
                Storage Alerts & Warnings
              </h2>
              <AlertsList alerts={alerts} />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function getStorageStatus(data) {
  if (!data) return 'Unknown';

  const temp = data.temperature || 0;
  const humidity = data.humidity || 0;

  if (temp > 35 || humidity > 70) return 'Critical';
  if (temp > 30 || humidity > 60) return 'Warning';
  if (temp < 15 || humidity < 30) return 'Suboptimal';
  return 'Optimal';
}

function calculateTrend(data, key) {
  if (!data || data.length < 2) return 0;

  const recent = data.slice(0, 10);
  const values = recent.map((entry) => entry[key]).filter((value) => value !== undefined);

  if (values.length < 2 || values[values.length - 1] === 0) return 0;

  const first = values[values.length - 1];
  const last = values[0];

  return ((last - first) / first * 100).toFixed(1);
}

export default Dashboard;
