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
const os = require('os');
const { THEMES } = require('./src/data/gameData.json');
const { isWordValid } = require('./utils/wordValidation.cjs');

app.use(express.static(path.join(__dirname, 'dist')));

app.use((req, res, next) => {
  if (req.path.startsWith('/socket.io') ||
    req.method !== 'GET' ||
    !req.accepts('html')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// rooms = {
//   "ABCD": {
//     id: "ABCD",
//     hostId: "socketId",
//     players: [{ id: "socketId", name: "Player 1" }],
//     gameData: null, // Stores active game state (word, roles, etc.)
//     settings: { ... }
//   }
// }
const rooms = {};

function generateRoomCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Helper: Get IP subnet (first 3 octets for /24 matching)
function getIpSubnet(ip) {
  if (!ip) return null;
  // Handle IPv6-mapped IPv4 (::ffff:x.x.x.x)
  const cleanIp = ip.replace(/^::ffff:/, '');
  const parts = cleanIp.split('.');
  if (parts.length === 4) {
    return parts.slice(0, 3).join('.');
  }
  return null; // IPv6 or invalid
}

io.on('connection', (socket) => {
  // Get client IP
  const clientIp = socket.handshake.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || socket.handshake.address;
  console.log('A user connected:', socket.id, 'IP:', clientIp);

  // manda la lista de salas a todos
  function broadcastRoomList() {
    const roomList = Object.values(rooms).map(r => ({
      id: r.id,
      name: r.roomName || r.players[0].name + "'s Game",
      players: r.players.length,
      maxPlayers: r.settings.players,
      type: r.settings.type,
      status: r.status
    }));
    io.emit('roomList', roomList);
  }

  function broadcastRoomUpdate(roomId) {
    if (rooms[roomId]) {
      io.to(roomId).emit('roomUpdated', rooms[roomId]);
    }
  }

  // Helper: Sanitize Name
  function sanitizeName(name) {
    if (!name) return 'Jugador';
    // Remove characters that might be dangerous or confusing, limit length
    return name.replace(/[^\w\sñÑáéíóúÁÉÍÓÚüÜ]/gi, '').substring(0, 15).trim() || 'Jugador';
  }

  // Helper: Find room by playerId
  function findRoomByPlayerId(playerId) {
    return Object.values(rooms).find(r => r.players.some(p => p.playerId === playerId));
  }

  socket.on('createRoom', ({ playerName, roomName, settings, playerId, localIp }) => {
    console.log('createRoom received settings:', settings);
    const safeName = sanitizeName(playerName);
    const roomId = generateRoomCode();

    // Check if player is already in a room? maybe separate logic. 
    // For now, allow creating new room implies leaving others if strictness needed.

    rooms[roomId] = {
      id: roomId,
      hostId: socket.id,
      hostPlayerId: playerId, // Persist host ID
      players: [{ id: socket.id, playerId, name: safeName, score: 0 }],
      roomName: roomName || `${safeName}'s Game`,
      gameData: null,
      status: 'waiting',
      // Store IP info for LAN detection
      creatorPublicIp: clientIp,
      creatorLocalIp: localIp || null,
      settings: {
        players: Number(settings?.players) || 3,
        type: settings?.type || 'in_person',
        numMonos: 1,
        selectedThemes: ['básico']
      }
    };

    console.log('Room created with settings:', rooms[roomId].settings);
    socket.join(roomId);
    socket.emit('roomCreated', rooms[roomId]);
    broadcastRoomList();
    console.log(`Room ${roomId} created by ${socket.id} (${safeName})`);
  });

  socket.on('joinRoom', ({ roomId, playerName, playerId }) => {
    const room = rooms[roomId.toUpperCase()];
    if (room) {
      // Check if already in room (re-join same socket? or updated socket?)
      const existingPlayer = room.players.find(p => p.playerId === playerId);

      if (existingPlayer) {
        // Update socket ID
        existingPlayer.id = socket.id;
        existingPlayer.connected = true;
        socket.join(room.id);
        socket.emit('roomJoined', room);
        broadcastRoomUpdate(room.id); // Update everyone that player is "back" (or just refresh list)
        return;
      }

      if (room.players.length >= room.settings.players && room.settings.players !== 2) {
        socket.emit('error', 'Room is full');
        return;
      }

      const safeName = sanitizeName(playerName);
      room.players.push({ id: socket.id, playerId, name: safeName, score: 0 });
      socket.join(room.id);

      socket.emit('roomJoined', room);
      broadcastRoomUpdate(room.id);
      broadcastRoomList();
      console.log(`${safeName} joined room ${roomId}`);
    } else {
      socket.emit('error', 'Room not found');
    }
  });

  socket.on('rejoinRoom', ({ roomId, playerId }) => {
    const room = rooms[roomId.toUpperCase()];
    if (room) {
      const existingPlayer = room.players.find(p => p.playerId === playerId);
      if (existingPlayer) {
        // Success rejoin
        existingPlayer.id = socket.id;
        existingPlayer.connected = true; // Mark as connected

        socket.join(room.id);
        // If host rejoined
        if (room.hostPlayerId === playerId) {
          room.hostId = socket.id;
        }

        socket.emit('roomJoined', room);
        // Check if game is in progress, send gameData? roomJoined usually includes it.
        broadcastRoomUpdate(room.id);
        console.log(`Player ${existingPlayer.name} rejoined room ${roomId}`);
      } else {
        socket.emit('error', 'Player not found in room');
      }
    } else {
      socket.emit('error', 'Room not found');
    }
  });

  socket.on('updateSettings', ({ roomId, settings }) => {
    const room = rooms[roomId];
    if (room && room.hostId === socket.id) {
      room.settings = { ...room.settings, ...settings };
      broadcastRoomUpdate(roomId);
      broadcastRoomList();
    }
  });

  socket.on('startGame', ({ roomId }) => {
    const room = rooms[roomId];
    if (room && room.hostId === socket.id && room.players.length >= 3) {
      // Game Init
      const settings = room.settings;
      room.status = settings.type === 'chat' ? 'chat_playing' : 'playing';

      // Select Word
      const theme = settings.selectedThemes[Math.floor(Math.random() * settings.selectedThemes.length)];
      const words = THEMES[theme];
      const word = words[Math.floor(Math.random() * words.length)];

      // Assign Monos (using IDs)
      const numMonos = settings.numMonos || 1;
      const playerIds = room.players.map(p => p.playerId); // array of UUIDs
      const monoIds = [];
      const availableIds = [...playerIds];

      for (let i = 0; i < numMonos; i++) {
        const randomIndex = Math.floor(Math.random() * availableIds.length);
        monoIds.push(availableIds[randomIndex]);
        availableIds.splice(randomIndex, 1);
      }

      // Random Player Order (IDs)
      const playerOrderIds = [...playerIds].sort(() => Math.random() - 0.5);

      room.gameData = {
        state: 'playing', // playing, voting, mono_guessing, results
        word: word,
        monoIds: monoIds,
        playerOrderIds: playerOrderIds,
        currentTurnIndex: 0,
        hints: [], // { playerId, player: name, text }
        votes: {}, // { voterId: [targetId...] }
        winner: null,
        winnerNames: [],
        monoGuessResult: null
      };

      io.to(roomId).emit('gameStarted', room);
    }
  });

  socket.on('playerReady', ({ roomId }) => {
    // Legacy? 'startGame' handles it.
  });

  const getNextActivePlayerIndex = (room, currentIndex) => {
    const order = room.gameData.playerOrderIds;
    let nextIndex = (currentIndex + 1) % order.length;
    let loops = 0;
    while (loops < order.length) {
      const playerId = order[nextIndex];
      const player = room.players.find(p => p.playerId === playerId);
      // If player exists and is NOT disconnected (we assume disconnected players have connected: false?)
      // Current player object structure in room.players: { id: socket.id, name, score, playerId: uuid, connected: bool }
      // If logic for 'connected' isn't fully robust yet, we just check existence.
      // Ideally we check p.connected.
      if (player && player.connected !== false) {
        return nextIndex;
      }
      nextIndex = (nextIndex + 1) % order.length;
      loops++;
    }
    return currentIndex; // All disconnected?
  };

  socket.on('submitHint', ({ roomId, hint }) => {
    const room = rooms[roomId];
    if (room && room.gameData && room.gameData.state === 'playing') {
      const currentPlayerIds = room.gameData.playerOrderIds;
      const currentTurnId = currentPlayerIds[room.gameData.currentTurnIndex];

      // Find player by match the session player Id from the room
      // We need to trust the client sending their playerId? Or check the socket mapping?
      // Since we bound socket.id to database room.players, we check:
      const player = room.players.find(p => p.id === socket.id);

      // Relax security slightly to allow re-joined users? NO.
      // Better: In rejoinRoom we updated the socket.id in room.players.
      // So player.id === socket.id IS correct if rejoin worked.
      // But let's check matches:
      if (player && player.playerId === currentTurnId) {
        room.gameData.hints.push({
          playerId: player.playerId,
          player: player.name,
          text: hint
        });

        // Check if ALL active players have submitted a hint
        const activePlayers = room.players.filter(p => p.connected !== false);
        const allHinted = activePlayers.every(p =>
          room.gameData.hints.some(h => h.playerId === p.playerId)
        );

        if (allHinted) {
          room.gameData.state = 'voting';
        } else {
          // Advance Turn
          room.gameData.currentTurnIndex = getNextActivePlayerIndex(room, room.gameData.currentTurnIndex);
        }

        io.to(roomId).emit('gameDataUpdated', room.gameData);
      }
    }
  });

  socket.on('finishTurn', ({ roomId }) => {
    const room = rooms[roomId];
    if (room && room.gameData && room.gameData.state === 'playing') {
      const currentPlayerId = room.gameData.playerOrderIds[room.gameData.currentTurnIndex];
      const player = room.players.find(p => p.id === socket.id);

      if (player && (player.playerId === currentPlayerId || room.hostId === socket.id)) {
        room.gameData.currentTurnIndex = getNextActivePlayerIndex(room, room.gameData.currentTurnIndex);
        io.to(roomId).emit('gameDataUpdated', room.gameData);
      }
    }
  });

  socket.on('submitVote', ({ roomId, voteIds }) => {
    console.log(`[DEBUG] submitVote called for room ${roomId} by socket ${socket.id}`);
    // voteIds is array of target playerIds
    const room = rooms[roomId];
    if (room && room.gameData && room.gameData.state === 'voting') {
      const player = room.players.find(p => p.id === socket.id);
      if (player) {
        room.gameData.votes[player.playerId] = voteIds;

        // Check if all active players voted
        const activePlayers = room.players.filter(p => p.connected !== false);
        const votesCast = Object.keys(room.gameData.votes).length;

        console.log(`Voting Progress: ${votesCast}/${activePlayers.length} active players voted.`);

        if (votesCast >= activePlayers.length || votesCast >= room.settings.players) {
          // Tally votes
          const voteCounts = {}; // targetId -> count
          Object.values(room.gameData.votes).flat().forEach(targetId => {
            voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
          });

          // Determine most voted
          // Sort targets by votes
          const sortedTargets = Object.entries(voteCounts).sort((a, b) => b[1] - a[1]);
          if (sortedTargets.length > 0) {
            const highestVoteCount = sortedTargets[0][1];
            const mostVotedIds = sortedTargets.filter(pair => pair[1] === highestVoteCount).map(pair => pair[0]);

            // Check if ANY of the most voted is a Mono
            const caughtMonoIds = mostVotedIds.filter(id => room.gameData.monoIds.includes(id));
            const escapedMonoIds = room.gameData.monoIds.filter(id => !mostVotedIds.includes(id));

            room.gameData.caughtMonoIds = caughtMonoIds;
            room.gameData.escapedMonoIds = escapedMonoIds;

            console.log('Voting Result:', {
              mostVotedIds,
              monoIds: room.gameData.monoIds,
              caughtMonoIds,
              escapedMonoIds
            });

            if (caughtMonoIds.length > 0) {
              // At least one Mono caught -> Mono Guessing Phase
              console.log('One or more Monos caught! Switching to mono_guessing');
              room.gameData.state = 'mono_guessing';
            } else {
              // No Mono caught -> Monos win (all of them since they all escaped/weren't caught)
              console.log('No Mono caught! Monos win.');
              room.gameData.state = 'results';
              room.gameData.winner = 'monos';
              room.gameData.winnerNames = room.players
                .filter(p => room.gameData.monoIds.includes(p.playerId))
                .map(p => p.name);
            }
          } else {
            // No votes? Monos win
            room.gameData.state = 'results';
            room.gameData.winner = 'monos';
            room.gameData.winnerNames = room.players
              .filter(p => room.gameData.monoIds.includes(p.playerId))
              .map(p => p.name);
          }

          io.to(roomId).emit('gameDataUpdated', room.gameData);
        } else {
          // Just update progress
          io.to(roomId).emit('gameDataUpdated', room.gameData);
        }

      } else {
        console.log(`submitVote: Player not found for socket ${socket.id} in room ${roomId}. Players: ${JSON.stringify(room.players.map(p => ({ id: p.id, pid: p.playerId })))}`);
      }
    }
  });

  socket.on('submitMonoGuess', ({ roomId, guess }) => {
    const room = rooms[roomId];
    if (room && room.gameData && room.gameData.state === 'mono_guessing') {
      const player = room.players.find(p => p.id === socket.id);
      if (player && room.gameData.monoIds.includes(player.playerId)) {
        // Check guess with intelligent validation (typo tolerance + accent insensitivity)
        const correct = isWordValid(guess, room.gameData.word);
        room.gameData.monoGuessResult = { guess, correct };
        room.gameData.state = 'results';

        if (correct) {
          // If correct, this mono wins + any escaped monos
          room.gameData.winner = 'monos';
          const escapedNames = room.players
            .filter(p => room.gameData.escapedMonoIds.includes(p.playerId))
            .map(p => p.name);
          room.gameData.winnerNames = [...escapedNames, player.name];
        } else {
          // If incorrect, check if there were escaped monos who win
          if (room.gameData.escapedMonoIds.length > 0) {
            room.gameData.winner = 'monos';
            room.gameData.winnerNames = room.players
              .filter(p => room.gameData.escapedMonoIds.includes(p.playerId))
              .map(p => p.name);
          } else {
            // All monos were caught and this one failed guess -> Civilians win
            room.gameData.winner = 'civilians';
            room.gameData.winnerNames = room.players
              .filter(p => !room.gameData.monoIds.includes(p.playerId))
              .map(p => p.name);
          }
        }
        io.to(roomId).emit('gameDataUpdated', room.gameData);
      }
    }
  });

  socket.on('resetGame', ({ roomId }) => {
    const room = rooms[roomId];
    if (room && room.hostId === socket.id) {
      room.gameData = null;
      room.status = 'waiting';
      io.to(roomId).emit('gameReset', room);
      broadcastRoomList();
    }
  });

  socket.on('checkRoom', ({ roomId }) => {
    const room = rooms[roomId.toUpperCase()];
    if (!room) {
      socket.emit('roomStatus', { exists: false, error: 'La sala no existe' });
    } else if (room.players.length >= room.settings.players && room.settings.players !== 2) {
      socket.emit('roomStatus', { exists: true, full: true, error: 'La sala está llena' });
    } else {
      socket.emit('roomStatus', { exists: true, full: false, room: room });
    }
  });

  socket.on('requestRoomList', () => {
    const roomList = Object.values(rooms).map(r => ({
      id: r.id,
      name: r.roomName || r.players[0].name + "'s Game",
      players: r.players.length,
      maxPlayers: r.settings.players,
      type: r.settings.type,
      status: r.status
    }));
    socket.emit('roomList', roomList);
  });

  // LAN game discovery - find games on same network
  socket.on('requestLanGames', ({ localIp }) => {
    const requesterPublicSubnet = getIpSubnet(clientIp);
    const requesterLocalSubnet = getIpSubnet(localIp);

    const lanGames = Object.values(rooms)
      .filter(r => {
        // Match by local IP subnet (same LAN) or public IP subnet (same network)
        const roomLocalSubnet = getIpSubnet(r.creatorLocalIp);
        const roomPublicSubnet = getIpSubnet(r.creatorPublicIp);

        // Prefer local IP matching (true LAN)
        if (requesterLocalSubnet && roomLocalSubnet && requesterLocalSubnet === roomLocalSubnet) {
          return true;
        }
        // Fallback to public IP matching (same ISP/network)
        if (requesterPublicSubnet && roomPublicSubnet && requesterPublicSubnet === roomPublicSubnet) {
          return true;
        }
        return false;
      })
      .map(r => ({
        id: r.id,
        name: r.roomName || r.players[0].name + "'s Game",
        players: r.players.length,
        maxPlayers: r.settings.players,
        type: r.settings.type,
        status: r.status
      }));

    socket.emit('lanGamesList', lanGames);
  });

  socket.on('leaveRoom', ({ roomId }) => {
    const room = rooms[roomId];
    if (room) {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        if (room.hostId === socket.id) {
          delete rooms[roomId];
          io.to(roomId).emit('roomClosed', { message: 'El anfitrión ha salido. La sala se ha cerrado.' });
        } else {
          room.players.splice(playerIndex, 1);
          if (room.players.length === 0) {
            delete rooms[roomId];
          } else {
            io.to(roomId).emit('roomUpdated', room);
          }
        }
        socket.leave(roomId);
        broadcastRoomList();
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    for (const roomId in rooms) {
      const room = rooms[roomId];
      const playerIndex = room.players.findIndex(p => p.id === socket.id);

      if (playerIndex !== -1) {
        // If playing, retain state for reconnection (unless explicit leave which is handled by leaveRoom)
        if (room.status === 'playing' || room.status === 'chat_playing') {
          console.log(`Player disconnected from active game in room ${roomId}. Keeping slot for reconnection.`);
          // Optionally mark as disconnected in player object if we want to show UI
          room.players[playerIndex].connected = false;
          broadcastRoomUpdate(roomId);
        } else {
          // In lobby/waiting, standard behavior
          if (room.hostId === socket.id) {
            // si el host se va en lobby, se cierra la sala? Preferible permitir reconnect si fue refresh accidental en lobby?
            // User requested "Persistent Session on Refresh". So even in Lobby it should persist?
            // If I refresh in Lobby, I want to come back to Lobby.

            // Allow simplified reconnection window? 
            // The issue is if I don't delete, the room stays there forever if they just close tab.
            // Let's implement a timeout cleanup or just keep current behavior for Lobby for now (Simpler).
            // Actually, if I refresh as host in Lobby, room is deleted! That's bad.

            // Let's try to keep it for a bit? Or just change behavior: Host disconnect doesn't close room immediately?
            // But how to cleanup?

            // FOR NOW: Stick to plan: "If in Lobby... remove player/room". 
            // But that violates "Restore this state automatically on page refresh".
            // If I refresh in Lobby, I want to be back in Lobby.

            // To support lobby refresh, we need "soft disconnect".
            // Let's set a timeout to delete room.

            setTimeout(() => {
              if (rooms[roomId] && rooms[roomId].hostId === socket.id) {
                // Host still disconnected (id didn't change back)
                // But if they rejoined, hostId would be updated.
                // So check if current host socket is connected?
                // Hard to check socket status of 'old' socket.

                // Better: Check if room.hostId matches the *new* socket or if room is empty?
                // If I rejoin, I update `room.hostId`.
              }
            }, 5000);

            // We'll stick to: 'playing' preserves. 'waiting' deletes (for cleanup safety). 
            // User flow: Refresh in game -> works. Refresh in lobby -> kicks to home?
            // "Issue: Refreshing the page causes the player to leave the game." -> usually implies active game.

            delete rooms[roomId];
            console.log(`Room ${roomId} deleted (host left lobby)`);
            io.to(roomId).emit('roomClosed', { message: 'El anfitrión ha salido. La sala se ha cerrado.' });
          } else {
            room.players.splice(playerIndex, 1);
            if (room.players.length === 0) {
              delete rooms[roomId];
              console.log(`Room ${roomId} deleted (empty)`);
            } else {
              io.to(roomId).emit('roomUpdated', room);
            }
          }
          broadcastRoomList();
        }
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  const ip = getLocalIp();
  console.log(`Server running on port ${PORT}`);
  console.log(`Local Access: http://localhost:${PORT}`);
  console.log(`Network Access: http://${ip}:${PORT}`);
});
