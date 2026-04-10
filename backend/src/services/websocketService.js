/**
 * WebSocket Service
 * 
 * Real-time data broadcasting to connected clients
 */

const WebSocket = require('ws');

let wss;
const clients = new Set();

/**
 * Initialize WebSocket server
 */
function startWebSocketServer(server) {
  wss = new WebSocket.Server({ server, path: '/ws' });
  
  wss.on('connection', (ws, req) => {
    const clientIp = req.socket.remoteAddress;
    console.log(`✓ WebSocket client connected from ${clientIp}`);
    
    clients.add(ws);
    
    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connection',
      message: 'Connected to ESP32 IoT WebSocket',
      timestamp: new Date()
    }));
    
    // Handle messages from client
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        console.log('WebSocket message received:', data);
        
        // Echo back or handle specific commands
        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', timestamp: new Date() }));
        }
      } catch (error) {
        console.error('Invalid WebSocket message:', error);
      }
    });
    
    // Handle disconnection
    ws.on('close', () => {
      clients.delete(ws);
      console.log(`✓ WebSocket client disconnected (${clients.size} remaining)`);
    });
    
    // Handle errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  });
  
  console.log('✓ WebSocket server started on path /ws');
  console.log(`  URL: ws://localhost:${process.env.PORT || 3000}/ws`);
}

/**
 * Broadcast sensor data to all connected clients
 */
function broadcastSensorData(data) {
  if (clients.size === 0) {
    return;
  }
  
  const message = JSON.stringify({
    type: 'sensor_update',
    data: data,
    timestamp: new Date()
  });
  
  let sentCount = 0;
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
      sentCount++;
    }
  });
  
  if (sentCount > 0) {
    console.log(`📡 Broadcasted sensor data to ${sentCount} client(s)`);
  }
}

/**
 * Broadcast alert to all connected clients
 */
function broadcastAlert(alert) {
  if (clients.size === 0) {
    return;
  }
  
  const message = JSON.stringify({
    type: 'alert',
    alert: alert,
    timestamp: new Date()
  });
  
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
  
  console.log(`📡 Broadcasted alert to ${clients.size} client(s)`);
}

/**
 * Get number of connected clients
 */
function getConnectedClientsCount() {
  return clients.size;
}

module.exports = {
  startWebSocketServer,
  broadcastSensorData,
  broadcastAlert,
  getConnectedClientsCount
};
