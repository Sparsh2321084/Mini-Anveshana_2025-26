/**
 * ESP32 IoT Backend Server
 * 
 * Main server file that handles:
 * - ESP32 sensor data reception
 * - Database operations
 * - Telegram notifications
 * - REST API endpoints
 * - WebSocket connections
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const sensorRoutes = require('./src/routes/sensorRoutes');
// Alert and Auth routes disabled (require database)
// const alertRoutes = require('./src/routes/alertRoutes');
// const authRoutes = require('./src/routes/authRoutes');
// Database removed - using in-memory storage
const { initTelegramBot } = require('./src/services/telegramService');
const { startWebSocketServer } = require('./src/services/websocketService');

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// Middleware Configuration
// ========================================

// Security headers
app.use(helmet());

// CORS configuration - Allow multiple origins
const allowedOrigins = [
  'https://sparsh2321084.github.io',
  'https://sparsh2321084.github.io/Mini-Anveshana_2025-26',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list or matches pattern
    if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('combined'));

// Rate limiting - More lenient for frontend
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for frontend origins
  skip: (req) => {
    const origin = req.get('origin');
    return origin && allowedOrigins.some(allowed => origin.startsWith(allowed));
  }
});
app.use('/api/', limiter);

// Specific rate limit for ESP32 data POST endpoint only
const esp32Limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 120, // 120 requests per minute (2 per second)
  skipFailedRequests: true
});

// ========================================
// Routes
// ========================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/sensor-data', esp32Limiter, sensorRoutes);
// Alert and Auth routes disabled (require database)
// app.use('/api/alerts', alertRoutes);
// app.use('/api/auth', authRoutes);

// Dummy alerts endpoint (returns empty array since no database)
app.get('/api/alerts', (req, res) => {
  res.json({ alerts: [], count: 0 });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🌐 ESP32 IoT Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      sensorData: '/api/sensor-data'
    },
    documentation: '/api/docs'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ========================================
// Server Initialization
// ========================================

async function startServer() {
  try {
    console.log('🚀 Starting ESP32 IoT Backend Server...\n');
    
    // Initialize Telegram bot (optional)
    if (process.env.TELEGRAM_BOT_TOKEN) {
      console.log('🤖 Starting Telegram bot...');
      await initTelegramBot();
      console.log('✓ Telegram bot initialized\n');
    } else {
      console.log('⚠ Telegram bot disabled (no token provided)\n');
    }
    
    // Start Express server
    const server = app.listen(PORT, () => {
      console.log('✓ Server is running');
      console.log(`  Port: ${PORT}`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  URL: http://localhost:${PORT}`);
      console.log('\n📡 API Endpoints:');
      console.log(`  POST /api/sensor-data - Receive sensor data from ESP32`);
      console.log(`  GET  /api/sensor-data/latest - Get latest sensor data`);
      console.log('\n✅ Server ready to accept connections!\n');
    });
    
    // Initialize WebSocket server
    startWebSocketServer(server);
    console.log('✓ WebSocket server started\n');
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('\n⚠ SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('✓ HTTP server closed');
        process.exit(0);
      });
    });
    
    process.on('SIGINT', () => {
      console.log('\n⚠ SIGINT signal received: closing HTTP server');
      server.close(() => {
        console.log('✓ HTTP server closed');
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app;
