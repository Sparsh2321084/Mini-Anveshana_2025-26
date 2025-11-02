import { useState, useEffect } from 'react';
import { Activity, Droplets, Thermometer, AlertCircle, TrendingUp, Eye, Warehouse, Database } from 'lucide-react';
import SensorCard from '../components/SensorCard';
import ChartCard from '../components/ChartCard';
import AlertsList from '../components/AlertsList';
// import SensorVisualization3D from '../components/SensorVisualization3D';
import { getSensorData, getLatestData, getAlerts } from '../services/api';
import './Dashboard.css';

function Dashboard() {
  const [latestData, setLatestData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  // WebSocket connection for real-time updates
  useEffect(() => {
    connectWebSocket();
  }, []);

  const fetchData = async () => {
    try {
      const [latest, history, alertsData] = await Promise.all([
        getLatestData(),
        getSensorData({ limit: 50 }),
        getAlerts({ limit: 10 })
      ]);

      setLatestData(latest.data);
      setHistoricalData(history.data);
      setAlerts(alertsData.alerts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const connectWebSocket = () => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'wss://mini-anveshana-2025-26.onrender.com';
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('✓ WebSocket connected');
      setWsConnected(true);
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      if (message.type === 'sensor_update') {
        setLatestData(message.data);
        // Add to historical data
        setHistoricalData(prev => [message.data, ...prev].slice(0, 50));
      } else if (message.type === 'alert') {
        setAlerts(prev => [message.alert, ...prev]);
      }
    };

    ws.onclose = () => {
      console.log('✗ WebSocket disconnected');
      setWsConnected(false);
      // Reconnect after 5 seconds
      setTimeout(connectWebSocket, 5000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const activeAlerts = alerts.filter(a => a.status === 'active');

  return (
    <div className="dashboard grain-theme">
      {/* Header */}
      <header className="dashboard-header">
        <div className="container">
          <div className="header-content">
            <div>
              <h1>
                <Warehouse className="header-icon" />
                Smart Grain Storage System
              </h1>
              <p className="header-subtitle">
                Real-time grain storage monitoring with intelligent alerts
              </p>
            </div>
            <div className="header-status">
              <div className={`status-badge ${wsConnected ? 'connected' : 'disconnected'}`}>
                <span className="status-dot"></span>
                {wsConnected ? 'Live Monitoring' : 'Offline'}
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
        {/* Sensor Cards */}
        <section className="sensor-grid">
          <SensorCard
            title="Storage Temperature"
            value={latestData?.data?.temperature || latestData?.temperature || 0}
            unit="°C"
            icon={<Thermometer />}
            color="#f59e0b"
            trend={calculateTrend(historicalData, 'temperature')}
            subtitle="Grain temperature"
          />
          <SensorCard
            title="Storage Humidity"
            value={latestData?.data?.humidity || latestData?.humidity || 0}
            unit="%"
            icon={<Droplets />}
            color="#3b82f6"
            trend={calculateTrend(historicalData, 'humidity')}
            subtitle="Moisture level"
          />
          <SensorCard
            title="Motion Detection"
            value={latestData?.data?.motion || latestData?.motion ? 'Detected' : 'Clear'}
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

        {/* 3D Visualization - Temporarily disabled */}
        {/* <section className="visualization-section">
          <div className="card">
            <h2 className="section-title">
              <Warehouse size={20} />
              Grain Storage 3D View
            </h2>
            <SensorVisualization3D data={latestData?.data || latestData} />
          </div>
        </section> */}

        {/* Charts */}
        <section className="charts-section">
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
        </section>

        {/* Alerts */}
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

// Helper function to calculate storage status
function getStorageStatus(data) {
  if (!data) return 'Unknown';
  const temp = data?.data?.temperature || data?.temperature || 0;
  const humidity = data?.data?.humidity || data?.humidity || 0;
  
  if (temp > 35 || humidity > 70) return 'Critical';
  if (temp > 30 || humidity > 60) return 'Warning';
  if (temp < 15 || humidity < 30) return 'Suboptimal';
  return 'Optimal';
}

// Helper function to calculate trend
function calculateTrend(data, key) {
  if (!data || data.length < 2) return 0;
  
  const recent = data.slice(0, 10);
  const values = recent.map(d => d[key]).filter(v => v !== undefined);
  
  if (values.length < 2) return 0;
  
  const first = values[values.length - 1];
  const last = values[0];
  return ((last - first) / first * 100).toFixed(1);
}

export default Dashboard;
