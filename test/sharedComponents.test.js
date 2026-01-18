import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SHARED_DIR = path.join(__dirname, '../src/components/shared');
const SETUP_SCREEN = path.join(__dirname, '../src/components/offline/SetupScreen.jsx');

describe('Shared Components Structure', () => {
  const expectedFiles = [
    'ThemeSelector.jsx',
    'MonoCounter.jsx',
    'WordListModal.jsx',
    'PrimaryButton.jsx',
    'InputField.jsx',
    'PlayerCounter.jsx'
  ];

  it.each(expectedFiles)('should have %s in the shared directory', (file) => {
    const filePath = path.join(SHARED_DIR, file);
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it('should have cleaned up SetupScreen imports', () => {
    const setupContent = fs.readFileSync(SETUP_SCREEN, 'utf8');
    expect(setupContent).not.toContain('const PlayerCounter = memo((');
    expect(setupContent).toContain("import PlayerCounter from '../shared/PlayerCounter'");
  });
});
