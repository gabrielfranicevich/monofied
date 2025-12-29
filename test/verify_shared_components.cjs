const fs = require('fs');
const path = require('path');
const assert = require('assert');

const SHARED_DIR = path.join(__dirname, '../src/components/shared');
const SETUP_SCREEN = path.join(__dirname, '../src/components/SetupScreen.jsx');

console.log('Running Shared Components Verification...');

// 1. Check Files Exist
const expectedFiles = [
  'ThemeSelector.jsx',
  'MonoCounter.jsx',
  'WordListModal.jsx',
  'PrimaryButton.jsx',
  'InputField.jsx',
  'PlayerCounter.jsx'
];

expectedFiles.forEach(file => {
  const filePath = path.join(SHARED_DIR, file);
  assert.ok(fs.existsSync(filePath), `Shared component ${file} should exist`);
  console.log(`Pass: ${file} exists`);
});

// 2. Check SetupScreen Import Cleaning
const setupContent = fs.readFileSync(SETUP_SCREEN, 'utf8');
assert.ok(!setupContent.includes('const PlayerCounter = memo(('), 'SetupScreen should not have inline PlayerCounter');
assert.ok(setupContent.includes("import PlayerCounter from './shared/PlayerCounter'"), 'SetupScreen should import PlayerCounter');
console.log('Pass: SetupScreen cleanup verified');

console.log('All shared component structure tests passed!');
