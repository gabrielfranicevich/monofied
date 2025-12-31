import { calculateMaxMonos } from '../src/utils/gameLogic.js';

console.log('Running verify_mono_logic.js...');

let passed = 0;
let failed = 0;

const assert = (description, numPlayers, expectedMax) => {
  const result = calculateMaxMonos(numPlayers);

  if (result === expectedMax) {
    console.log(`PASS: ${description} (${numPlayers} players -> max ${result})`);
    passed++;
  } else {
    console.error(`FAIL: ${description}`);
    console.error(`  Players: ${numPlayers}`);
    console.error(`  Expected: ${expectedMax}`);
    console.error(`  Actual:   ${result}`);
    failed++;
  }
};

try {
  // Test Case 1: Minimum players (3)
  assert('3 Players', 3, 1); // ceil(1.5) - 1 = 1

  // Test Case 2: 4 Players
  assert('4 Players', 4, 1); // ceil(2) - 1 = 1

  // Test Case 3: 5 Players
  assert('5 Players', 5, 2); // ceil(2.5) - 1 = 2

  // Test Case 4: 6 Players
  assert('6 Players', 6, 2); // ceil(3) - 1 = 2

  // Test Case 5: 10 Players
  assert('10 Players', 10, 4); // ceil(5) - 1 = 4

  // Test Case 6: Edge case (1 player - though game usually requires 3)
  // Ensure we don't return 0 or negative if logic was blindly applied without max(1, ...)
  // Logic: ceil(0.5) - 1 = 0. My util uses Math.max(1, ...)
  assert('1 Player (Edge Case)', 1, 1);

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
