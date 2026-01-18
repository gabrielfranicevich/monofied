import { describe, it, expect } from 'vitest';
import { calculateMaxMonos } from '../src/utils/gameLogic.js';

describe('monoAddition', () => {
  it('should correctly handle mono addition logic for 5 players', () => {
    const numPlayers = 5;
    let numMonos = 1;

    // Calculate max monos for 5 players
    const maxMonos = calculateMaxMonos(numPlayers);

    // Test Case 1: Verify max monos calculation
    expect(maxMonos).toBe(2);

    // Test Case 2: Verify we can add a mono
    expect(numMonos).toBe(1);
    expect(numMonos < maxMonos).toBe(true);

    // Simulate adding a mono
    if (numMonos < maxMonos) {
      numMonos = numMonos + 1;
    }

    // Test Case 3: Verify mono was added
    expect(numMonos).toBe(2);

    // Test Case 4: Verify we cannot add more monos
    const canAddMore = numMonos < maxMonos;
    expect(canAddMore).toBe(false);
  });

  it('should handle string concatenation pitfalls', () => {
    // Test Case 5: String concatenation bug check
    let stringMono = "1";
    const badResult = stringMono + 1; // This would be "11" if not converted
    expect(badResult).toBe("11");

    const goodResult = Number(stringMono) + 1;
    expect(goodResult).toBe(2);
  });
});
