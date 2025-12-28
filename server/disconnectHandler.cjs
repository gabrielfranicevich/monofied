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
        if (room.status === 'playing' || room.status === 'chat_playing') {
          console.log(`Player disconnected from active game in room ${roomId}. Keeping slot for reconnection.`);
          room.players[playerIndex].connected = false;
          broadcastRoomUpdate(roomId);
        } else {
          if (room.hostId === socket.id) {
            setTimeout(() => {
              if (rooms[roomId] && rooms[roomId].hostId === socket.id) {
                // Host still disconnected
              }
            }, 5000);

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
}

module.exports = { setupDisconnectHandler };
