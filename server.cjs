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

// --- Scraping Proxy Endpoint ---
app.get('/api/scrape-slang', async (req, res) => {
  const word = req.query.w;
  if (!word) return res.json({ text: '' });

  try {
    // We fetch raw HTML strings concurrently and silence any internal network errors
    const [argHtml, asiHtml] = await Promise.all([
      fetch(`https://www.diccionarioargentino.com/term/${encodeURIComponent(word)}`)
        .then(r => r.ok ? r.text() : '').catch(() => ''),
      fetch(`https://www.asihablamos.com/word/palabra/${encodeURIComponent(word)}.php`)
        .then(r => r.ok ? r.text() : '').catch(() => '')
    ]);

    // Strip script and style blocks entirely, then strip remaining HTML tags to extract pure string text
    // We also forcefully cut off any text appearing after 'Sinónimos' so it ignores easy synonyms.
    const cleanText = (argHtml + ' ' + asiHtml)
      .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<[^>]*>?/gm, ' ')
      .split(/Sin[oó]nimos/i)[0];

    res.json({ text: cleanText });
  } catch (error) {
    console.error('Slang proxy scrub failed:', error);
    res.json({ text: '' });
  }
});

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
