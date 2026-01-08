/**
 * Game logic handlers
 */
const { THEMES } = require('../src/data/gameData.json');
const { isWordValid } = require('../utils/wordValidation.cjs');
const { getNextActivePlayerIndex } = require('./utils.cjs');

function setupGameHandlers(io, socket, rooms, broadcastRoomList, broadcastRoomUpdate) {

  socket.on('startGame', ({ roomId, words, numMonos }) => {
    const room = rooms[roomId];
    if (room && room.hostId === socket.id && room.players.length >= 3) {
      const settings = room.settings;
      room.status = settings.type === 'chat' ? 'chat_playing' : 'playing';

      // Select Word from the provided words array (includes built-in and contributed themes)
      const word = words[Math.floor(Math.random() * words.length)];

      // Assign Monos
      const numMonosToAssign = numMonos || settings.numMonos || 1;
      const playerIds = room.players.map(p => p.playerId);
      const monoIds = [];
      const availableIds = [...playerIds];

      for (let i = 0; i < numMonosToAssign; i++) {
        const randomIndex = Math.floor(Math.random() * availableIds.length);
        monoIds.push(availableIds[randomIndex]);
        availableIds.splice(randomIndex, 1);
      }

      // Random Player Order
      const playerOrderIds = [...playerIds].sort(() => Math.random() - 0.5);

      room.gameData = {
        state: 'playing',
        word: word,
        monoIds: monoIds,
        playerOrderIds: playerOrderIds,
        currentTurnIndex: 0,
        hints: [],
        votes: {},
        winner: null,
        winnerNames: [],
        monoGuessResult: null
      };

      io.to(roomId).emit('gameStarted', room);
    }
  });

  socket.on('playerReady', ({ roomId }) => {
    // Legacy handler
  });

  socket.on('submitHint', ({ roomId, hint }) => {
    const room = rooms[roomId];
    if (room && room.gameData && room.gameData.state === 'playing') {
      const currentPlayerIds = room.gameData.playerOrderIds;
      const currentTurnId = currentPlayerIds[room.gameData.currentTurnIndex];
      const player = room.players.find(p => p.id === socket.id);

      if (player && player.playerId === currentTurnId) {
        room.gameData.hints.push({
          playerId: player.playerId,
          player: player.name,
          text: hint
        });

        const activePlayers = room.players.filter(p => p.connected !== false);
        const allHinted = activePlayers.every(p =>
          room.gameData.hints.some(h => h.playerId === p.playerId)
        );

        if (allHinted) {
          room.gameData.state = 'voting';
        } else {
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
    const room = rooms[roomId];
    if (room && room.gameData && room.gameData.state === 'voting') {
      const player = room.players.find(p => p.id === socket.id);
      if (player) {
        room.gameData.votes[player.playerId] = voteIds;

        const activePlayers = room.players.filter(p => p.connected !== false);
        const votesCast = Object.keys(room.gameData.votes).length;

        console.log(`Voting Progress: ${votesCast}/${activePlayers.length} active players voted.`);

        if (votesCast >= activePlayers.length || votesCast >= room.settings.players) {
          // Tally votes
          const voteCounts = {};
          Object.values(room.gameData.votes).flat().forEach(targetId => {
            voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
          });

          const sortedTargets = Object.entries(voteCounts).sort((a, b) => b[1] - a[1]);
          if (sortedTargets.length > 0) {
            const highestVoteCount = sortedTargets[0][1];
            const mostVotedIds = sortedTargets.filter(pair => pair[1] === highestVoteCount).map(pair => pair[0]);

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
              console.log('One or more Monos caught! Switching to mono_guessing');
              room.gameData.state = 'mono_guessing';
            } else {
              console.log('No Mono caught! Monos win.');
              room.gameData.state = 'results';
              room.gameData.winner = 'monos';
              room.gameData.winnerNames = room.players
                .filter(p => room.gameData.monoIds.includes(p.playerId))
                .map(p => p.name);
            }
          } else {
            room.gameData.state = 'results';
            room.gameData.winner = 'monos';
            room.gameData.winnerNames = room.players
              .filter(p => room.gameData.monoIds.includes(p.playerId))
              .map(p => p.name);
          }

          io.to(roomId).emit('gameDataUpdated', room.gameData);
        } else {
          io.to(roomId).emit('gameDataUpdated', room.gameData);
        }

      } else {
        console.log(`submitVote: Player not found for socket ${socket.id} in room ${roomId}.`);
      }
    }
  });

  socket.on('submitMonoGuess', ({ roomId, guess }) => {
    const room = rooms[roomId];
    if (room && room.gameData && room.gameData.state === 'mono_guessing') {
      const player = room.players.find(p => p.id === socket.id);
      if (player && room.gameData.monoIds.includes(player.playerId)) {
        const correct = isWordValid(guess, room.gameData.word);
        room.gameData.monoGuessResult = { guess, correct };
        room.gameData.state = 'results';

        if (correct) {
          room.gameData.winner = 'monos';
          const escapedNames = room.players
            .filter(p => room.gameData.escapedMonoIds.includes(p.playerId))
            .map(p => p.name);
          room.gameData.winnerNames = [...escapedNames, player.name];
        } else {
          if (room.gameData.escapedMonoIds.length > 0) {
            room.gameData.winner = 'monos';
            room.gameData.winnerNames = room.players
              .filter(p => room.gameData.escapedMonoIds.includes(p.playerId))
              .map(p => p.name);
          } else {
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
}

module.exports = { setupGameHandlers };
