const io = require('socket.io-client');
const { spawn } = require('child_process');
const path = require('path');

const PORT = 3002; // Use a different port for testing to avoid conflicts
const SERVER_URL = `http://localhost:${PORT}`;

let serverProcess;

function startServer() {
  return new Promise((resolve, reject) => {
    // Start server.cjs with a custom port env var if possible, 
    // but server.cjs defaults to 3000. 
    // We might need to modify server.cjs to accept PORT env var clearly or use 3000.
    // server.cjs uses: const PORT = process.env.PORT || 3000;

    serverProcess = spawn('node', ['server.cjs'], {
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, PORT: PORT },
      stdio: 'pipe' // Pipe stdio to see output
    });

    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      // console.log('[SERVER]', output);
      if (output.includes('Server running on port')) {
        resolve();
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error('[SERVER ERROR]', data.toString());
    });
  });
}

async function runTest() {
  try {
    console.log('Starting server...');
    await startServer();
    console.log('Server started on port', PORT);

    const client1 = io(SERVER_URL, { autoConnect: false });
    const client2 = io(SERVER_URL, { autoConnect: false });

    // Connect Client 1
    await new Promise(resolve => {
      client1.on('connect', resolve);
      client1.connect();
    });
    console.log('Client 1 connected.');

    // Connect Client 2
    await new Promise(resolve => {
      client2.on('connect', resolve);
      client2.connect();
    });
    console.log('Client 2 connected.');

    // Client 1 Creates Room
    let roomId;
    const createPromise = new Promise(resolve => {
      client1.once('roomCreated', (room) => {
        roomId = room.id;
        console.log('Room created:', roomId);
        resolve();
      });
    });

    client1.emit('createRoom', {
      playerName: 'Host',
      playerId: 'p1',
      settings: { players: 3, type: 'public' }
    });

    await createPromise;

    // Client 2 Joins Room
    const joinPromise = new Promise(resolve => {
      client1.once('roomUpdated', (room) => {
        if (room.players.length === 2) {
          console.log('Host saw player join.');
          resolve();
        }
      });
    });

    client2.emit('joinRoom', { roomId, playerName: 'Joiner', playerId: 'p2' });
    await joinPromise;
    console.log('Join flow verified.');

    // Disconnect
    client1.disconnect();
    client2.disconnect();

  } catch (err) {
    console.error('TEST FAILED:', err);
    process.exit(1);
  } finally {
    if (serverProcess) {
      serverProcess.kill();
    }
  }
}

runTest();
