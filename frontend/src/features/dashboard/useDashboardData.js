import { startTransition, useEffect, useRef, useState } from 'react';
import { getAlerts, getLatestData, getSensorData } from '../../services/api';

const INITIAL_STATE = {
  latestData: null,
  historicalData: [],
  alerts: [],
  quality: null,
  insight: null,
  loading: true,
  wsConnected: false,
  error: null
};

function normalizeReading(reading) {
  if (!reading) return null;

  const source = reading.data || reading;

  return {
    deviceId: source.deviceId || reading.deviceId || null,
    temperature: source.temperature ?? 0,
    humidity: source.humidity ?? 0,
    motion: Boolean(source.motion),
    timestamp: source.timestamp || reading.timestamp || null
  };
}

function normalizeHistory(history = []) {
  return history
    .map((entry) => normalizeReading(entry))
    .filter(Boolean)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function mergeHistoryEntry(history, entry) {
  const normalizedEntry = normalizeReading(entry);

  if (!normalizedEntry?.timestamp) {
    return history;
  }

  const nextHistory = [normalizedEntry, ...history.filter((item) => item.timestamp !== normalizedEntry.timestamp)];
  return nextHistory.slice(0, 50);
}

export function useDashboardData() {
  const [state, setState] = useState(INITIAL_STATE);
  const reconnectTimeoutRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    let active = true;

    async function fetchSnapshot() {
      try {
        const [latest, history, alertsData] = await Promise.all([
          getLatestData(),
          getSensorData({ limit: 50 }),
          getAlerts({ limit: 10 })
        ]);

        if (!active) return;

        startTransition(() => {
          setState((prev) => ({
            ...prev,
            latestData: normalizeReading(latest.data),
            historicalData: normalizeHistory(history.data),
            alerts: alertsData.alerts || [],
            quality: latest.quality || latest.data?.quality || null,
            insight: latest.insight || null,
            loading: false,
            error: null
          }));
        });
      } catch (error) {
        if (!active) return;

        startTransition(() => {
          setState((prev) => ({
            ...prev,
            loading: false,
            error
          }));
        });
      }
    }

    fetchSnapshot();

    const backupInterval = window.setInterval(() => {
      const readyState = socketRef.current?.readyState;
      if (readyState !== WebSocket.OPEN) {
        fetchSnapshot();
      }
    }, 30000);

    return () => {
      active = false;
      window.clearInterval(backupInterval);
    };
  }, []);

  useEffect(() => {
    let disposed = false;

    function connect() {
      const wsUrl = import.meta.env.VITE_WS_URL || 'wss://mini-anveshana-2025-26.onrender.com';
      const socket = new WebSocket(`${wsUrl}/ws`);
      socketRef.current = socket;

      socket.onopen = () => {
        if (disposed) return;

        startTransition(() => {
          setState((prev) => ({ ...prev, wsConnected: true }));
        });
      };

      socket.onmessage = (event) => {
        if (disposed) return;

        const message = JSON.parse(event.data);

        startTransition(() => {
          setState((prev) => {
            if (message.type === 'sensor_update') {
              return {
                ...prev,
                latestData: normalizeReading(message.data),
                quality: message.quality || prev.quality,
                insight: message.insight || prev.insight,
                historicalData: mergeHistoryEntry(prev.historicalData, message.data)
              };
            }

            if (message.type === 'alert') {
              return {
                ...prev,
                alerts: [message.alert, ...prev.alerts]
              };
            }

            return prev;
          });
        });
      };

      socket.onclose = () => {
        if (disposed) return;

        startTransition(() => {
          setState((prev) => ({ ...prev, wsConnected: false }));
        });

        reconnectTimeoutRef.current = window.setTimeout(connect, 5000);
      };

      socket.onerror = () => {
        if (!disposed) {
          socket.close();
        }
      };
    }

    connect();

    return () => {
      disposed = true;
      window.clearTimeout(reconnectTimeoutRef.current);
      socketRef.current?.close();
    };
  }, []);

  return state;
}
