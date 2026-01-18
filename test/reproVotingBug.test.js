import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import io from 'socket.io-client';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3004;
const SERVER_URL = `http://localhost:${PORT}`;

describe('Voting Bug Regression', () => {
  let serverProcess;
  let clients = [];

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
        console.error(`[SERVER Error ${PORT}]`, data.toString());
      });

      serverProcess.on('error', reject);
      serverProcess.on('exit', (code) => {
        if (code !== 0 && code !== null) reject(new Error(`Server exited with code ${code}`));
      });
    });
  });

  afterAll(() => {
    clients.forEach(c => c.close());
    if (serverProcess) serverProcess.kill();
  });

  function createClient() {
    const client = io(SERVER_URL, {
      transports: ['websocket'],
      forceNew: true
    });
    clients.push(client);
    return client;
  }

  it('should wait for all active players to vote, regardless of settings.players', async () => {
    const host = createClient();

    const hostDefaults = {
      playerName: 'Host',
      roomName: 'BugTest',
      settings: { players: 2, type: 'chat' }, // The bug trigger: only 2 expected, but 3 joined
      playerId: 'host-pid',
      localIp: '127.0.0.1'
    };

    const room = await new Promise(resolve => {
      host.emit('createRoom', hostDefaults);
      host.on('roomCreated', resolve);
    });

    const p2 = createClient();
    await new Promise(resolve => {
      p2.emit('joinRoom', { roomId: room.id, playerName: 'P2', playerId: 'p2-pid' });
      host.on('roomUpdated', (r) => { if (r.players.length === 2) resolve(); });
    });

    const p3 = createClient();
    await new Promise(resolve => {
      p3.emit('joinRoom', { roomId: room.id, playerName: 'P3', playerId: 'p3-pid' });
      host.on('roomUpdated', (r) => { if (r.players.length === 3) resolve(); });
    });

    let gameData;
    host.emit('startGame', { roomId: room.id, words: ['TestWord'], numMonos: 1 });
    await new Promise(resolve => {
      host.once('gameStarted', (r) => {
        gameData = r.gameData;
        resolve();
      });
    });

    const socketMap = {
      'host-pid': host,
      'p2-pid': p2,
      'p3-pid': p3
    };

    for (let i = 0; i < 3; i++) {
      const currentTurnId = gameData.playerOrderIds[i];
      const socket = socketMap[currentTurnId];

      const updatePromise = new Promise(resolve => {
        host.once('gameDataUpdated', (data) => {
          gameData = data;
          resolve();
        });
      });

      socket.emit('submitHint', { roomId: room.id, hint: 'MyHint' });
      await updatePromise;
    }

    if (gameData.state !== 'voting') {
      await new Promise((resolve, reject) => {
        const check = (data) => {
          if (data.state === 'voting') {
            host.off('gameDataUpdated', check);
            resolve();
          }
        };
        host.on('gameDataUpdated', check);
        setTimeout(() => reject(new Error('voting state timeout')), 5000);
      });
    }

    // Submit 2 votes (threshold of settings.players)
    host.emit('submitVote', { roomId: room.id, voteIds: ['p2-pid'] });
    p2.emit('submitVote', { roomId: room.id, voteIds: ['p2-pid'] });

    // Check if state changes prematurely
    const premature = await new Promise(resolve => {
      const handleUpdate = (data) => {
        if (data.state !== 'voting') {
          resolve(true);
        }
      };
      host.on('gameDataUpdated', handleUpdate);

      // If it stays in voting for 2s, it's correct
      setTimeout(() => {
        host.off('gameDataUpdated', handleUpdate);
        resolve(false);
      }, 2000);
    });

    expect(premature).toBe(false);
  }, 30000);
});
