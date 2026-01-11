/**
 * Mono Game Server - Modular Entry Point
 * 
 * This is the main server file that sets up Express and Socket.IO,
 * then delegates to specialized handler modules.
 */
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const socketIO = require("socket.io");
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const path = require('path');

// Import handler modules and RoomManager
const RoomManager = require('./server/RoomManager.cjs');
const { getLocalIp } = require('./server/utils.cjs');
const { setupRoomHandlers } = require('./server/roomHandlers.cjs');
const { setupGameHandlers } = require('./server/gameHandlers.cjs');
const { setupLanHandlers } = require('./server/lanHandlers.cjs');
const { setupDisconnectHandler } = require('./server/disconnectHandler.cjs');

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback for client-side routing
app.use((req, res, next) => {
  if (req.path.startsWith('/socket.io') ||
    req.method !== 'GET' ||
    !req.accepts('html')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Initialize RoomManager
const roomManager = new RoomManager(io);

// Socket.IO connection handler
io.on('connection', (socket) => {
  const clientIp = socket.handshake.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || socket.handshake.address;
  console.log('A user connected:', socket.id, 'IP:', clientIp);

  // Setup all handler modules
  setupRoomHandlers(socket, roomManager, clientIp);
  setupGameHandlers(socket, roomManager);
  setupLanHandlers(socket, roomManager, clientIp);
  setupDisconnectHandler(socket, roomManager);
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  const ip = getLocalIp();
  console.log(`Server running on port ${PORT}`);
  console.log(`Local Access: http://localhost:${PORT}`);
  console.log(`Network Access: http://${ip}:${PORT}`);
});
