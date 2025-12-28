/**
 * Room management handlers
 */
const { generateRoomCode, sanitizeName } = require('./utils.cjs');

function setupRoomHandlers(io, socket, rooms, broadcastRoomList, broadcastRoomUpdate, clientIp) {

  socket.on('createRoom', ({ playerName, roomName, settings, playerId, localIp }) => {
    console.log('createRoom received settings:', settings);
    const safeName = sanitizeName(playerName);
    const roomId = generateRoomCode();

    rooms[roomId] = {
      id: roomId,
      hostId: socket.id,
      hostPlayerId: playerId,
      players: [{ id: socket.id, playerId, name: safeName, score: 0 }],
      roomName: roomName || `${safeName}'s Game`,
      gameData: null,
      status: 'waiting',
      creatorPublicIp: clientIp,
      creatorLocalIp: localIp || null,
      settings: {
        players: Number(settings?.players) || 2,
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
      const existingPlayer = room.players.find(p => p.playerId === playerId);

      if (existingPlayer) {
        existingPlayer.id = socket.id;
        existingPlayer.connected = true;
        socket.join(room.id);
        socket.emit('roomJoined', room);
        broadcastRoomUpdate(room.id);
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
        existingPlayer.id = socket.id;
        existingPlayer.connected = true;

        socket.join(room.id);
        if (room.hostPlayerId === playerId) {
          room.hostId = socket.id;
        }

        socket.emit('roomJoined', room);
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

  socket.on('leaveRoom', ({ roomId, playerId }) => {
    const room = rooms[roomId];
    if (room) {
      const playerIndex = room.players.findIndex(p => p.playerId === playerId || p.id === socket.id);
      if (playerIndex !== -1) {
        const player = room.players[playerIndex];
        const isHost = room.hostPlayerId === player.playerId || room.hostId === socket.id;

        if (isHost) {
          delete rooms[roomId];
          io.to(roomId).emit('roomClosed', { message: 'El anfitrión ha salido. La sala se ha cerrado.' });
          console.log(`Room ${roomId} deleted (host left)`);
        } else {
          room.players.splice(playerIndex, 1);
          if (room.players.length === 0) {
            delete rooms[roomId];
            console.log(`Room ${roomId} deleted (empty)`);
          } else {
            io.to(roomId).emit('roomUpdated', room);
          }
        }
        socket.leave(roomId);
        broadcastRoomList();
      }
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
}

module.exports = { setupRoomHandlers };
