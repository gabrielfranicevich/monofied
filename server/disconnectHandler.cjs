/**
 * Disconnect handler
 */
function setupDisconnectHandler(socket, roomManager) {

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    const rooms = roomManager.rooms; // Access raw rooms object

    for (const roomId in rooms) {
      const room = rooms[roomId];
      const playerIndex = room.players.findIndex(p => p.id === socket.id);

      if (playerIndex !== -1) {
        const player = room.players[playerIndex];
        player.connected = false;

        // If active game, keep them but mark disconnected
        if (room.status === 'playing' || room.status === 'chat_playing') {
          console.log(`Player disconnected from active game in room ${roomId}. Keeping slot for reconnection.`);
          roomManager.broadcastRoomUpdate(roomId);
        } else {
          // Waiting room logic with grace period
          if (room.hostId === socket.id) {
            console.log(`Host disconnected from room ${roomId}. Starting grace period.`);
            room.hostDisconnected = true;

            // Clear any existing timeout just in case
            if (room.destroyTimeout) clearTimeout(room.destroyTimeout);

            const timeoutId = setTimeout(() => {
              if (rooms[roomId] && rooms[roomId].hostId === socket.id && !rooms[roomId].players.find(p => p.id === socket.id && p.connected)) {
                roomManager.emitToRoom(roomId, 'roomClosed', { message: 'El anfitrión ha salido. La sala se ha cerrado.' });
                roomManager.deleteRoom(roomId, 'Room deleted (host timeout)');
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
              // Re-fetch room to ensure it still exists
              const currentRoom = roomManager.getRoom(roomId);
              if (currentRoom && currentRoom.status === 'waiting') {
                const idx = currentRoom.players.findIndex(p => p.playerId === player.playerId);
                if (idx !== -1 && !currentRoom.players[idx].connected) {
                  currentRoom.players.splice(idx, 1);
                  console.log(`Player removed from room ${roomId} (timeout)`);
                  roomManager.broadcastRoomUpdate(roomId);

                  if (currentRoom.players.length === 0) {
                    roomManager.deleteRoom(roomId, 'Room deleted (empty)');
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
          roomManager.broadcastRoomUpdate(roomId);
        }
        break;
      }
    }
  });
}

module.exports = { setupDisconnectHandler };
