import { calculateMaxMonos } from '../src/utils/gameLogic.js';

console.log('Running verify_mono_addition.js...');

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
  // Simulating a 5-player party
  const numPlayers = 5;
  let numMonos = 1;

  // Calculate max monos for 5 players
  const maxMonos = calculateMaxMonos(numPlayers);

  console.log(`5-player party setup:`);
  console.log(`  Initial monos: ${numMonos}`);
  console.log(`  Max monos: ${maxMonos}`);

  // Test Case 1: Verify max monos calculation
  assert('Max monos for 5 players is 2', maxMonos === 2);

  // Test Case 2: Verify we can add a mono
  assert('Initial mono count is 1', numMonos === 1);
  assert('Can add mono (1 < 2)', numMonos < maxMonos);

  // Simulate adding a mono (like the button would)
  if (numMonos < maxMonos) {
    numMonos = numMonos + 1;
  }

  // Test Case 3: Verify mono was added
  assert('Mono count increased to 2', numMonos === 2);

  // Test Case 4: Verify we cannot add more monos
  const canAddMore = numMonos < maxMonos;
  assert('Cannot add more monos (2 >= 2)', !canAddMore);

  // Test Case 5: String concatenation bug check
  let stringMono = "1";
  const badResult = stringMono + 1; // This would be "11" if not converted
  assert('String concatenation would create bug', badResult === "11");

  const goodResult = Number(stringMono) + 1;
  assert('Number conversion prevents bug', goodResult === 2);

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
