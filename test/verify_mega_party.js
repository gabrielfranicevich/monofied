
// Simulate the server-side game start and voting logic for a 100-player game
import { calculateMaxMonos } from '../src/utils/gameLogic.js';

console.log('Running verify_mega_party.js...');

let passed = 0;
let failed = 0;

const assert = (description, cond) => {
  if (cond) {
    console.log(`PASS: ${description}`);
    passed++;
  } else {
    console.error(`FAIL: ${description}`);
    failed++;
  }
};

try {
  const numPlayers = 100;
  const numMonos = 49;

  // 1. Verify logic consistency
  assert('Max monos for 100 players is 49', calculateMaxMonos(numPlayers) === 49);

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

  // 3. Simulate startGame logic (from server/gameHandlers.cjs)
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

  assert('Exactly 49 monos assigned', gameData.monoIds.length === 49);
  assert('All 100 players in order', gameData.playerOrderIds.length === 100);
  assert('No duplicate monos', new Set(gameData.monoIds).size === 49);

  // 4. Simulate Voting Round
  // Let's say Everyone votes for the same person (p_0)
  for (let i = 0; i < numPlayers; i++) {
    gameData.votes[`p_${i}`] = ['p_0'];
  }

  gameData.state = 'voting';

  // Voting Tally Logic (from server/gameHandlers.cjs)
  const voteCounts = {};
  Object.values(gameData.votes).flat().forEach(targetId => {
    voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
  });

  const sortedTargets = Object.entries(voteCounts).sort((a, b) => b[1] - a[1]);
  const highestVoteCount = sortedTargets[0][1];
  const mostVotedIds = sortedTargets.filter(pair => pair[1] === highestVoteCount).map(pair => pair[0]);

  assert('Vote count for p_0 is 100', voteCounts['p_0'] === 100);
  assert('Most voted ID is p_0', mostVotedIds.includes('p_0'));

  const caughtMonoIds = mostVotedIds.filter(id => gameData.monoIds.includes(id));
  const isP0Mono = gameData.monoIds.includes('p_0');

  if (isP0Mono) {
    assert('Mono p_0 was caught', caughtMonoIds.length === 1);
  } else {
    assert('Human p_0 was "caught" but not a mono', caughtMonoIds.length === 0);
  }

  console.log('---------------------------------------------------');
  if (failed === 0) {
    console.log(`ALL TESTS PASSED (${passed}/${passed})`);
    process.exit(0);
  } else {
    console.error(`${failed} TESTS FAILED`);
    process.exit(1);
  }

} catch (err) {
  console.error('An error occurred during testing:', err);
  process.exit(1);
}
