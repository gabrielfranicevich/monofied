import { describe, it, expect } from 'vitest';
import { calculateMaxMonos } from '../src/utils/gameLogic.js';

describe('megaParty', () => {
  it('should handle a 100-player game simulation', () => {
    const numPlayers = 100;
    const numMonos = 49;

    // 1. Verify logic consistency
    expect(calculateMaxMonos(numPlayers)).toBe(49);

    // 2. Simulate Room Setup
    const players = Array.from({ length: numPlayers }, (_, i) => ({
      id: `socket_${i}`,
      playerId: `p_${i}`,
      name: `Player ${i}`,
      connected: true
    }));

    const room = {
      id: 'mega_room',
      players: players,
      settings: {
        numMonos: numMonos,
        players: numPlayers,
        type: 'chat'
      }
    };

    // 3. Simulate startGame logic
    const playerIds = room.players.map(p => p.playerId);
    const monoIds = [];
    const availableIds = [...playerIds];

    for (let i = 0; i < numMonos; i++) {
      const randomIndex = Math.floor(Math.random() * availableIds.length);
      monoIds.push(availableIds[randomIndex]);
      availableIds.splice(randomIndex, 1);
    }

    const playerOrderIds = [...playerIds].sort(() => Math.random() - 0.5);

    const gameData = {
      state: 'playing',
      word: 'BANANA',
      monoIds: monoIds,
      playerOrderIds: playerOrderIds,
      hints: [],
      votes: {}
    };

    expect(gameData.monoIds.length).toBe(49);
    expect(gameData.playerOrderIds.length).toBe(100);
    expect(new Set(gameData.monoIds).size).toBe(49);

    // 4. Simulate Voting Round
    // Let's say Everyone votes for the same person (p_0)
    for (let i = 0; i < numPlayers; i++) {
      gameData.votes[`p_${i}`] = ['p_0'];
    }

    gameData.state = 'voting';

    // Voting Tally Logic
    const voteCounts = {};
    Object.values(gameData.votes).flat().forEach(targetId => {
      voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    });

    const sortedTargets = Object.entries(voteCounts).sort((a, b) => b[1] - a[1]);
    const highestVoteCount = sortedTargets[0][1];
    const mostVotedIds = sortedTargets.filter(pair => pair[1] === highestVoteCount).map(pair => pair[0]);

    expect(voteCounts['p_0']).toBe(100);
    expect(mostVotedIds).toContain('p_0');

    const caughtMonoIds = mostVotedIds.filter(id => gameData.monoIds.includes(id));
    const isP0Mono = gameData.monoIds.includes('p_0');

    if (isP0Mono) {
      expect(caughtMonoIds.length).toBe(1);
    } else {
      expect(caughtMonoIds.length).toBe(0);
    }
  });
});
