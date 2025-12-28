const io = require('socket.io-client');

const PORT = 3001;
const URL = `http://localhost:${PORT}`;

const socket1 = io(URL, { autoConnect: false });
const socket2 = io(URL, { autoConnect: false });
const socket3 = io(URL, { autoConnect: false });

const players = [
  { socket: socket1, name: 'Player1', id: 'p1' },
  { socket: socket2, name: 'Player2', id: 'p2' },
  { socket: socket3, name: 'Player3', id: 'p3' }
];

let roomId = null;
let gameData = null;

function connectAll() {
  return Promise.all(players.map(p => {
    return new Promise(resolve => {
      p.socket.on('connect', resolve);
      p.socket.connect();
    });
  }));
}

async function runTest() {
  try {
    console.log('Connecting players...');
    await connectAll();
    console.log('All connected.');

    // Step 1: Create Room
    console.log('Creating room...');
    socket1.emit('createRoom', { playerName: 'Player1', playerId: 'p1', settings: { players: 3, type: 'chat' } });

    await new Promise(resolve => {
      socket1.once('roomCreated', (room) => {
        roomId = room.id;
        console.log(`Room created: ${roomId}`);
        resolve();
      });
    });

    // Step 2: Join Others
    console.log('Joining others...');
    socket2.emit('joinRoom', { roomId, playerName: 'Player2', playerId: 'p2' });
    socket3.emit('joinRoom', { roomId, playerName: 'Player3', playerId: 'p3' });

    await new Promise(resolve => {
      let joined = 0;
      const check = () => { if (++joined === 2) resolve(); };
      socket2.once('roomJoined', check);
      socket3.once('roomJoined', check);
    });
    console.log('All joined.');

    // Step 3: Start Game
    console.log('Starting game...');
    socket1.emit('startGame', { roomId });

    await new Promise(resolve => {
      socket1.once('gameStarted', (room) => {
        gameData = room.gameData;
        console.log('Game started.');
        console.log('Mono IDs:', gameData.monoIds);
        resolve();
      });
    });

    // Step 4: Play Turns
    const playerOrderIds = gameData.playerOrderIds;
    for (let i = 0; i < 3; i++) {
      const currentTurnId = playerOrderIds[i];
      const currentPlayer = players.find(p => p.id === currentTurnId);

      const nextTurnPromise = new Promise(resolve => {
        socket1.once('gameDataUpdated', (data) => {
          gameData = data;
          resolve();
        });
      });

      currentPlayer.socket.emit('submitHint', { roomId, hint: `Hint from ${currentPlayer.name}` });
      await nextTurnPromise;
    }

    if (gameData.state !== 'voting') {
      throw new Error(`Failed to transition to voting! State is: ${gameData.state}`);
    }
    console.log('In Voting Phase.');

    // Step 5: Vote for Mono
    // We assume there is 1 mono
    const monoId = gameData.monoIds[0];
    console.log(`Voting for Mono: ${monoId}`);

    // Everyone votes for the Mono
    const votePromise = new Promise(resolve => {
      socket1.on('gameDataUpdated', (data) => {
        gameData = data;
        // Wait until state changes or all votes in
        const votesCast = Object.keys(gameData.votes).length;
        if (gameData.state === 'mono_guessing') {
          resolve('success');
        } else if (votesCast === 3 && gameData.state !== 'mono_guessing') {
          resolve('failed_logic');
        }
      });
    });

    players.forEach(p => {
      p.socket.emit('submitVote', { roomId, voteIds: [monoId] });
    });

    const result = await votePromise;

    if (result === 'success') {
      console.log('SUCCESS: Game transitioned to mono_guessing.');
    } else {
      throw new Error('FAILED: All voted for mono, but state did NOT change to mono_guessing. State: ' + gameData.state);
    }

  } catch (err) {
    console.error('TEST FAILED:', err);
    process.exit(1);
  } finally {
    players.forEach(p => p.socket.disconnect());
    process.exit(0);
  }
}

runTest();
