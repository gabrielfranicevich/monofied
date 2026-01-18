import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import io from 'socket.io-client';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3001;
const URL = `http://localhost:${PORT}`;

describe('Voting Integration', () => {
  let socket1, socket2, socket3;
  let players;
  let roomId;
  let gameData;
  let serverProcess;

  beforeAll(async () => {
    await new Promise((resolve, reject) => {
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

    socket1 = io(URL, { autoConnect: false });
    socket2 = io(URL, { autoConnect: false });
    socket3 = io(URL, { autoConnect: false });
    players = [
      { socket: socket1, name: 'Player1', id: 'p1' },
      { socket: socket2, name: 'Player2', id: 'p2' },
      { socket: socket3, name: 'Player3', id: 'p3' }
    ];

    await Promise.all(players.map(p => {
      return new Promise(resolve => {
        p.socket.on('connect', resolve);
        p.socket.connect();
      });
    }));
  });

  afterAll(() => {
    players.forEach(p => p.socket.disconnect());
    if (serverProcess) {
      serverProcess.kill();
    }
  });

  it('should transition to voting phase after all players submit hints', async () => {
    // Create Room
    socket1.emit('createRoom', { playerName: 'Player1', playerId: 'p1', settings: { players: 3, type: 'chat' } });

    await new Promise(resolve => {
      socket1.once('roomCreated', (room) => {
        roomId = room.id;
        resolve();
      });
    });

    // Join Others
    socket2.emit('joinRoom', { roomId, playerName: 'Player2', playerId: 'p2' });
    socket3.emit('joinRoom', { roomId, playerName: 'Player3', playerId: 'p3' });

    await new Promise(resolve => {
      let joined = 0;
      const check = () => { if (++joined === 2) resolve(); };
      socket2.once('roomJoined', check);
      socket3.once('roomJoined', check);
    });

    // Start Game
    socket1.emit('startGame', { roomId, words: ['APPLE'], numMonos: 1 });

    await new Promise(resolve => {
      socket1.once('gameStarted', (room) => {
        gameData = room.gameData;
        resolve();
      });
    });

    // Play Turns
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

    expect(gameData.state).toBe('voting');

    // Vote for Mono
    const monoId = gameData.monoIds[0];

    const votePromise = new Promise(resolve => {
      const handler = (data) => {
        gameData = data;
        if (gameData.state === 'mono_guessing') {
          socket1.off('gameDataUpdated', handler);
          resolve('success');
        } else if (Object.keys(gameData.votes).length === 3 && gameData.state !== 'mono_guessing') {
          socket1.off('gameDataUpdated', handler);
          resolve('failed_logic');
        }
      };
      socket1.on('gameDataUpdated', handler);
    });

    players.forEach(p => {
      p.socket.emit('submitVote', { roomId, voteIds: [monoId] });
    });

    const result = await votePromise;
    expect(result).toBe('success');
  }, 30000); // 30s timeout for integration test
});
