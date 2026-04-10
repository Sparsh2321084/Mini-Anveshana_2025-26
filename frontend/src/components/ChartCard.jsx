import { memo, useMemo } from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { format } from 'date-fns';
import './ChartCard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function ChartCard({ title, data, dataKey, color, unit }) {
  const values = useMemo(
    () => data.map((entry) => entry[dataKey]).filter((value) => typeof value === 'number'),
    [data, dataKey]
  );

  const latestValue = values.length > 0 ? values[0] : null;
  const oldestValue = values.length > 1 ? values[values.length - 1] : latestValue;
  const delta = latestValue !== null && oldestValue !== null ? latestValue - oldestValue : 0;
  const direction = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
  const averageValue = values.length > 0
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : null;

  const chartData = useMemo(() => ({
    labels: data.map(d => format(new Date(d.timestamp || d.createdAt), 'HH:mm')).reverse(),
    datasets: [
      {
        label: title,
        data: data.map(d => d[dataKey]).reverse(),
        borderColor: color,
        backgroundColor: `${color}22`,
        fill: true,
        tension: 0.38,
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: color,
        pointBorderColor: '#fffaf0',
        pointHoverBorderWidth: 3,
        pointHoverBackgroundColor: color,
        pointHoverBorderColor: '#fffaf0',
      },
    ],
  }), [color, data, dataKey, title]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(58, 30, 8, 0.94)',
        padding: 14,
        displayColors: false,
        titleFont: {
          size: 14,
          weight: '600'
        },
        bodyFont: {
          size: 13,
        },
        cornerRadius: 14,
        caretPadding: 10,
        callbacks: {
          label: (context) => `${context.parsed.y.toFixed(1)}${unit}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(120, 53, 15, 0.08)',
          drawBorder: false,
        },
        ticks: {
          maxRotation: 0,
          autoSkipPadding: 20,
          color: '#9a6b33',
          font: {
            size: 11,
            weight: '600'
          }
        },
        border: {
          display: false
        }
      },
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(120, 53, 15, 0.08)',
        },
        ticks: {
          color: '#9a6b33',
          callback: (value) => `${value}${unit}`,
          font: {
            size: 11
          }
        },
        border: {
          display: false
        }
      },
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
  }), [unit]);

  const TrendIcon = direction === 'up' ? ArrowUpRight : direction === 'down' ? ArrowDownRight : Minus;

  return (
    <div className="chart-card card">
      <div className="chart-head">
        <div>
          <p className="chart-eyebrow">Sensor Trend</p>
          <h3 className="chart-title">{title}</h3>
        </div>
        <div className={`chart-delta ${direction}`}>
          <TrendIcon size={16} />
          <span>{Math.abs(delta).toFixed(1)}{unit}</span>
        </div>
      </div>

      <div className="chart-metrics">
        <div className="chart-metric">
          <span>Current</span>
          <strong>{latestValue !== null ? `${latestValue.toFixed(1)}${unit}` : '--'}</strong>
        </div>
        <div className="chart-metric">
          <span>Average</span>
          <strong>{averageValue !== null ? `${averageValue.toFixed(1)}${unit}` : '--'}</strong>
        </div>
      </div>

      <div className="chart-container">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}

export default memo(ChartCard);
