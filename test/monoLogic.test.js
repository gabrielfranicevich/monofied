import { describe, it, expect } from 'vitest';
import { calculateMaxMonos } from '../src/utils/gameLogic.js';

describe('monoLogic', () => {
  it('should calculate 1 max mono for 3 players', () => {
    expect(calculateMaxMonos(3)).toBe(1); // ceil(1.5) - 1 = 1
  });

  it('should calculate 1 max mono for 4 players', () => {
    expect(calculateMaxMonos(4)).toBe(1); // ceil(2) - 1 = 1
  });

  it('should calculate 2 max monos for 5 players', () => {
    expect(calculateMaxMonos(5)).toBe(2); // ceil(2.5) - 1 = 2
  });

  it('should calculate 2 max monos for 6 players', () => {
    expect(calculateMaxMonos(6)).toBe(2); // ceil(3) - 1 = 2
  });

  it('should calculate 4 max monos for 10 players', () => {
    expect(calculateMaxMonos(10)).toBe(4); // ceil(5) - 1 = 4
  });

  it('should calculate 1 max mono for 1 player (edge case)', () => {
    expect(calculateMaxMonos(1)).toBe(1);
  });
});
