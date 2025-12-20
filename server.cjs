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

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

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

  socket.on('createRoom', ({ playerName, roomName, settings }) => {
    console.log('createRoom received settings:', settings);
    const roomId = generateRoomCode();
    rooms[roomId] = {
      id: roomId,
      hostId: socket.id,
      players: [{ id: socket.id, name: playerName || 'Host', score: 0 }],
      roomName: roomName || `${playerName || 'Host'}'s Game`,
      gameData: null,
      status: 'waiting',
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
    console.log(`Room ${roomId} created by ${socket.id}`);
  });

  socket.on('joinRoom', ({ roomId, playerName }) => {
    const room = rooms[roomId.toUpperCase()];
    if (room) {
      if (room.players.length >= room.settings.players) {
        socket.emit('error', 'Room is full');
        return;
      }

      room.players.push({ id: socket.id, name: playerName, score: 0 });
      socket.join(room.id);

      socket.emit('roomJoined', room);
      broadcastRoomUpdate(room.id);
      broadcastRoomList();
      console.log(`${playerName} joined room ${roomId}`);
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

  socket.on('startGame', ({ roomId, words, numMonos }) => {
    const room = rooms[roomId];
    if (room && room.hostId === socket.id) {
      const selectedWord = words[Math.floor(Math.random() * words.length)];
      const numPlayers = room.players.length;

      const monoIndices = [];
      const availableIndices = Array.from({ length: numPlayers }, (_, i) => i);
      for (let i = 0; i < numMonos; i++) {
        const randomIndex = Math.floor(Math.random() * availableIndices.length);
        monoIndices.push(availableIndices[randomIndex]);
        availableIndices.splice(randomIndex, 1);
      }

      // orden
      const playerOrder = Array.from({ length: numPlayers }, (_, i) => i);
      for (let i = playerOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [playerOrder[i], playerOrder[j]] = [playerOrder[j], playerOrder[i]];
      }

      room.gameData = {
        word: selectedWord,
        monoIndices: monoIndices,
        playerOrder: playerOrder,
        currentTurnIndex: 0,
        hints: [], // para chat
        votes: {}, // { voterId: votedPlayerId }
        state: 'playing', // 'playing', 'voting', 'results'
        revealed: {}
      };

      room.status = 'playing';

      io.to(roomId).emit('gameStarted', room);
      broadcastRoomList();
    }
  });

  socket.on('playerReady', ({ roomId }) => {
    const room = rooms[roomId];
    if (room && room.gameData) {
      room.gameData.revealed[socket.id] = true;
      io.to(roomId).emit('gameUpdated', room);
    }
  });

  socket.on('submitHint', ({ roomId, hint }) => {
    const room = rooms[roomId];
    if (room && room.gameData && room.gameData.state === 'playing') {
      const currentPlayerIndex = room.gameData.playerOrder[room.gameData.currentTurnIndex];
      const currentPlayer = room.players[currentPlayerIndex];

      if (currentPlayer.id === socket.id) {
        room.gameData.hints.push({
          playerId: currentPlayer.id,
          player: currentPlayer.name,
          text: hint
        });

        if (room.gameData.currentTurnIndex < room.players.length - 1) {
          room.gameData.currentTurnIndex++;
        } else room.gameData.state = 'voting';

        io.to(roomId).emit('gameUpdated', room);
      }
    }
  });

  socket.on('finishTurn', ({ roomId }) => {
    const room = rooms[roomId];
    if (room && room.gameData && room.gameData.state === 'playing') {
      const currentPlayerIndex = room.gameData.playerOrder[room.gameData.currentTurnIndex];
      const currentPlayer = room.players[currentPlayerIndex];

      if (currentPlayer.id === socket.id) {
        if (room.gameData.currentTurnIndex < room.players.length - 1) {
          room.gameData.currentTurnIndex++;
        }
        else room.gameData.state = 'voting';

        io.to(roomId).emit('gameUpdated', room);
      }
    }
  });

  socket.on('submitVote', ({ roomId, votedPlayerIndices }) => {
    const room = rooms[roomId];
    if (room && room.gameData && room.gameData.state === 'voting') {
      // lista de votos
      const votes = Array.isArray(votedPlayerIndices) ? votedPlayerIndices : [votedPlayerIndices];

      room.gameData.votes[socket.id] = votes;

      if (Object.keys(room.gameData.votes).length === room.players.length) {

        const voteCounts = {};
        const totalVotes = room.players.length * (room.settings.numMonos || 1);

        Object.values(room.gameData.votes).forEach(playerVotes => {
          playerVotes.forEach(playerIndex => {
            voteCounts[playerIndex] = (voteCounts[playerIndex] || 0) + 1;
          });
        });

        // Determinar si se encontraron los monos
        // Logica: Un mono es atrapado si recibe votos mayoritarios 
        // Top N votados son sospechosos.
        // Si los sospechosos son monos, entonces los monos son atrapados.

        const sortedPlayers = Object.keys(voteCounts).map(Number).sort((a, b) => voteCounts[b] - voteCounts[a]);
        const topSuspects = sortedPlayers.slice(0, room.settings.numMonos || 1);

        const monosIndices = room.gameData.monoIndices;

        const caughtMonos = monosIndices.filter(index => topSuspects.includes(index));
        const escapedMonos = monosIndices.filter(index => !topSuspects.includes(index));

        room.gameData.votingResults = {
          voteCounts,
          topSuspects,
          caughtMonos,
          escapedMonos
        };

        room.gameData.winnerNames = escapedMonos.map(idx => room.players[idx].name);

        if (room.settings.type === 'chat') {
          if (caughtMonos.length > 0) {
            room.gameData.state = 'mono_guessing';
          } else {
            room.gameData.state = 'results';
            room.gameData.winner = 'monos';
          }
        } else {
          const allMonosFound = caughtMonos.length === monosIndices.length;
          room.gameData.state = 'results';
          room.gameData.winner = allMonosFound ? 'civilians' : 'monos';
          if (room.gameData.winner === 'civilians') {
            room.gameData.winnerNames = room.players.filter((p, i) => !monosIndices.includes(i)).map(p => p.name);
          } else {
            room.gameData.winnerNames = monosIndices.map(i => room.players[i].name);
          }
        }
      }

      io.to(roomId).emit('gameUpdated', room);
    }
  });

  socket.on('submitMonoGuess', ({ roomId, guess }) => {
    const room = rooms[roomId];
    if (room && room.gameData && room.gameData.state === 'mono_guessing') {
      const isCorrect = guess.trim().toLowerCase() === room.gameData.word.toLowerCase();

      room.gameData.monoGuessResult = {
        guess: guess,
        correct: isCorrect
      };

      if (isCorrect) {
        const caughtMonos_Names = room.gameData.votingResults.caughtMonos.map(idx => room.players[idx].name);
        room.gameData.winnerNames = [...(room.gameData.winnerNames || []), ...caughtMonos_Names];
        room.gameData.winner = 'monos';
      }

      // Si NO hay ganadores (Todos atrapados y adivinaron mal) -> Civilians Win
      if (!room.gameData.winnerNames || room.gameData.winnerNames.length === 0) {
        room.gameData.winner = 'civilians';
        const monosIndices = room.gameData.monoIndices;
        room.gameData.winnerNames = room.players.filter((p, i) => !monosIndices.includes(i)).map(p => p.name);
      } else {
        room.gameData.winner = 'monos'; // capaz directamente los sobrevivientes
      }

      room.gameData.state = 'results';
      io.to(roomId).emit('gameUpdated', room);
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
    } else if (room.players.length >= room.settings.players) {
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
        if (room.hostId === socket.id) {
          // si el host se va, se cierra la sala
          delete rooms[roomId];
          console.log(`Room ${roomId} deleted (host left)`);
          // se avisa que se cerro
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
