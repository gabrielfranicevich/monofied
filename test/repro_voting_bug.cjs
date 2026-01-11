const { io } = require('socket.io-client');
const { spawn } = require('child_process');

const PORT = 3003;
const SERVER_URL = `http://localhost:${PORT}`;

let serverProcess;
let clients = [];

async function startServer() {
  return new Promise((resolve) => {
    serverProcess = spawn('node', ['server.cjs'], {
      env: { ...process.env, PORT },
      stdio: 'inherit', // see server logs
      shell: true
    });
    setTimeout(resolve, 2000);
  });
}

function createClient() {
  return io(SERVER_URL, {
    transports: ['websocket'],
    forceNew: true
  });
}

async function runTest() {
  try {
    console.log('Starting server...');
    await startServer();

    // 1. Host creates room with settings.players = 2
    const host = createClient();
    clients.push(host);

    const hostDefaults = {
      playerName: 'Host',
      roomName: 'BugTest',
      settings: { players: 2, type: 'chat' }, // The bug trigger
      playerId: 'host-pid',
      localIp: '127.0.0.1'
    };

    const room = await new Promise(resolve => {
      host.emit('createRoom', hostDefaults);
      host.on('roomCreated', resolve);
    });
    console.log('Room created:', room.id);

    // 2. Join 2 MORE players (Total 3)
    const p2 = createClient();
    clients.push(p2);
    await new Promise(resolve => {
      p2.emit('joinRoom', { roomId: room.id, playerName: 'P2', playerId: 'p2-pid' });
      p2.on('roomJoined', resolve);
      host.on('roomUpdated', (r) => {
        if (r.players.length === 2) resolve();
      });
    });
    console.log('P2 Join resolved');

    const p3 = createClient();
    clients.push(p3);
    await new Promise(resolve => {
      p3.emit('joinRoom', { roomId: room.id, playerName: 'P3', playerId: 'p3-pid' });
      host.on('roomUpdated', (r) => {
        if (r.players.length === 3) resolve();
      });
    });
    console.log('P3 Join resolved');

    // 3. Start Game
    host.emit('startGame', { roomId: room.id, words: ['TestWord'], numMonos: 1 });
    await new Promise(resolve => host.on('gameStarted', resolve));
    console.log('Game Started');

    // 4. Submit hints to reach voting phase
    const allClients = [host, p2, p3];
    // Assuming host is not mono or we don't care, just push state to voting
    // Need currentTurnIndex logic or force it.
    // Let's assume hints are submitted correctly.
    // Wait, getting to voting requires hints.
    // Shortcuts: We can listen to gameDataUpdated.

    // Doing a full loop is tedious.
    // The bug is in 'submitVote'. If I can trigger voting state directly? No.
    // I must play the game.

    // Cheat: Modify server code? No.
    // Just submit hints.
    for (const c of clients) {
      c.emit('submitHint', { roomId: room.id, hint: 'MyHint' });
    }

    await new Promise(resolve => {
      const check = (data) => {
        if (data.state === 'voting') {
          host.off('gameDataUpdated', check);
          resolve();
        }
      };
      host.on('gameDataUpdated', check);
    });
    console.log('State is VOTING');

    // 5. Submit 2 votes (trigger threshold)
    console.log('Submitting 2 votes (Active Players: 3, Settings.Players: 2)');
    host.emit('submitVote', { roomId: room.id, voteIds: ['p2-pid'] });
    p2.emit('submitVote', { roomId: room.id, voteIds: ['p2-pid'] });

    // 6. Check if state changes to 'results' or 'mono_guessing' PREMATURELY
    const premature = await new Promise(resolve => {
      const handleUpdate = (data) => {
        if (data.state !== 'voting') {
          resolve(true); // Premature change!
        }
      };
      host.on('gameDataUpdated', handleUpdate);

      // Timeout if it stays in voting (Success case for proper behavior)
      setTimeout(() => {
        host.off('gameDataUpdated', handleUpdate);
        resolve(false);
      }, 2000);
    });

    if (premature) {
      console.error('FAIL: Game advanced after only 2 votes (out of 3 players)!');
      process.exit(1);
    } else {
      console.log('PASS: Game waited for more votes.');
      process.exit(0);
    }

  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    clients.forEach(c => c.close());
    if (serverProcess) serverProcess.kill();
  }
}

runTest();
