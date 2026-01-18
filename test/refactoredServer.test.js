import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import io from 'socket.io-client';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3002;
const SERVER_URL = `http://localhost:${PORT}`;

describe('Refactored Server Integration', () => {
  let serverProcess;

  beforeAll(async () => {
    return new Promise((resolve, reject) => {
      serverProcess = spawn('node', ['server.cjs'], {
        cwd: path.join(__dirname, '..'),
        env: { ...process.env, PORT: PORT },
        stdio: 'pipe'
      });

      serverProcess.stdout.on('data', (data) => {
        if (data.toString().includes('Server running on port')) {
          resolve();
        }
      });

      serverProcess.stderr.on('data', (data) => {
        console.error('[SERVER ERROR]', data.toString());
      });
    });
  });

  afterAll(() => {
    if (serverProcess) {
      serverProcess.kill();
    }
  });

  it('should allow clients to connect, create a room, and join', async () => {
    const client1 = io(SERVER_URL, { autoConnect: false });
    const client2 = io(SERVER_URL, { autoConnect: false });

    await Promise.all([
      new Promise(resolve => { client1.on('connect', resolve); client1.connect(); }),
      new Promise(resolve => { client2.on('connect', resolve); client2.connect(); })
    ]);

    let roomId;
    const createPromise = new Promise(resolve => {
      client1.once('roomCreated', (room) => {
        roomId = room.id;
        resolve();
      });
    });

    client1.emit('createRoom', {
      playerName: 'Host',
      playerId: 'p1',
      settings: { players: 3, type: 'public' }
    });

    await createPromise;
    expect(roomId).toBeDefined();

    const joinPromise = new Promise(resolve => {
      client1.once('roomUpdated', (room) => {
        if (room.players.length === 2) {
          resolve();
        }
      });
    });

    client2.emit('joinRoom', { roomId, playerName: 'Joiner', playerId: 'p2' });
    await joinPromise;

    client1.disconnect();
    client2.disconnect();
  }, 10000);
});
