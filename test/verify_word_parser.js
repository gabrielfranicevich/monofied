import { parseWordListInput, formatWordListForInput } from '../src/utils/textUtils.js';

console.log('Running verify_word_parser.js...');

let passed = 0;
let failed = 0;

const assert = (description, input, expected) => {
  const result = parseWordListInput(input);
  const resultStr = JSON.stringify(result);
  const expectedStr = JSON.stringify(expected);

  if (resultStr === expectedStr) {
    console.log(`PASS: ${description}`);
    passed++;
  } else {
    console.error(`FAIL: ${description}`);
    console.error(`  Input: "${input}"`);
    console.error(`  Expected: ${expectedStr}`);
    console.error(`  Actual:   ${resultStr}`);
    failed++;
  }
};

try {
  // Test Case 1: Basic comma separated
  assert(
    'Basic comma separated',
    'word1,word2,word3',
    ['word1', 'word2', 'word3']
  );

  // Test Case 2: Spaces after comma
  assert(
    'Spaces after comma',
    'word1,  word2, word3',
    ['word1', 'word2', 'word3']
  );

  // Test Case 3: Spaces within words
  assert(
    'Spaces within words',
    'San Francisco, New York',
    ['San Francisco', 'New York']
  );

  // Test Case 4: Trailing comma'
  assert(
    'Trailing comma',
    'word1,',
    ['word1']
  );

  // Test Case 5: Empty input
  assert(
    'Empty input',
    '',
    []
  );

  // Test Case 6: Mixed spaces and empty slots
  assert(
    'Mixed spaces and empty slots',
    ' , word1 , , word2 ',
    ['word1', 'word2']
  );

  console.log('--- Testing Formatting ---');

  const assertFormat = (description, input, expected) => {
    const result = formatWordListForInput(input);
    if (result === expected) {
      console.log(`PASS: ${description}`);
      passed++;
    } else {
      console.error(`FAIL: ${description}`);
      console.error(`  Input: ${JSON.stringify(input)}`);
      console.error(`  Expected: "${expected}"`);
      console.error(`  Actual:   "${result}"`);
      failed++;
    }
  }

  assertFormat('Format basic list', ['one', 'two'], 'one, two');
  assertFormat('Format empty list', [], '');
  assertFormat('Format single item', ['one'], 'one');


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
