/**
 * Disconnect handler
 */
function setupDisconnectHandler(io, socket, rooms, broadcastRoomList, broadcastRoomUpdate) {

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    for (const roomId in rooms) {
      const room = rooms[roomId];
      const playerIndex = room.players.findIndex(p => p.id === socket.id);

      if (playerIndex !== -1) {
        const player = room.players[playerIndex];
        player.connected = false;

        // If active game, keep them but mark disconnected
        if (room.status === 'playing' || room.status === 'chat_playing') {
          console.log(`Player disconnected from active game in room ${roomId}. Keeping slot for reconnection.`);
          broadcastRoomUpdate(roomId);
        } else {
          // Waiting room logic with grace period
          if (room.hostId === socket.id) {
            console.log(`Host disconnected from room ${roomId}. Starting grace period.`);
            room.hostDisconnected = true;

            // Clear any existing timeout just in case
            if (room.destroyTimeout) clearTimeout(room.destroyTimeout);

            const timeoutId = setTimeout(() => {
              if (rooms[roomId] && rooms[roomId].hostId === socket.id && !rooms[roomId].players.find(p => p.id === socket.id && p.connected)) {
                delete rooms[roomId];
                console.log(`Room ${roomId} deleted (host timeout)`);
                io.to(roomId).emit('roomClosed', { message: 'El anfitrión ha salido. La sala se ha cerrado.' });
                broadcastRoomList();
              }
            }, 30000); // 30 seconds to reconnect

            // Make timeout non-enumerable to prevent serialization crash
            Object.defineProperty(room, 'destroyTimeout', {
              value: timeoutId,
              writable: true,
              configurable: true,
              enumerable: false
            });
          } else {
            // Regular player disconnected
            console.log(`Player disconnected from room ${roomId}. Starting grace period.`);

            if (player.disconnectTimeout) clearTimeout(player.disconnectTimeout);

            const pTimeoutId = setTimeout(() => {
              const currentRoom = rooms[roomId];
              if (currentRoom && currentRoom.status === 'waiting') {
                const idx = currentRoom.players.findIndex(p => p.playerId === player.playerId);
                if (idx !== -1 && !currentRoom.players[idx].connected) {
                  currentRoom.players.splice(idx, 1);
                  console.log(`Player removed from room ${roomId} (timeout)`);
                  io.to(roomId).emit('roomUpdated', currentRoom);

                  if (currentRoom.players.length === 0) {
                    delete rooms[roomId];
                    broadcastRoomList();
                  }
                }
              }
            }, 30000); // 30 seconds to reconnect

            // Make timeout non-enumerable
            Object.defineProperty(player, 'disconnectTimeout', {
              value: pTimeoutId,
              writable: true,
              configurable: true,
              enumerable: false
            });
          }
          broadcastRoomUpdate(roomId);
        }
        break;
      }
    }
  });
}

module.exports = { setupDisconnectHandler };
