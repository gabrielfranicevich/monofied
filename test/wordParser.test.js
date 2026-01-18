import { describe, it, expect } from 'vitest';
import { parseWordListInput, formatWordListForInput } from '../src/utils/textUtils.js';

describe('wordParser', () => {
  describe('parseWordListInput', () => {
    it('should handle basic comma separated words', () => {
      expect(parseWordListInput('word1,word2,word3')).toEqual(['word1', 'word2', 'word3']);
    });

    it('should handle spaces after comma', () => {
      expect(parseWordListInput('word1,  word2, word3')).toEqual(['word1', 'word2', 'word3']);
    });

    it('should handle spaces within words', () => {
      expect(parseWordListInput('San Francisco, New York')).toEqual(['San Francisco', 'New York']);
    });

    it('should handle trailing commas', () => {
      expect(parseWordListInput('word1,')).toEqual(['word1']);
    });

    it('should handle empty input', () => {
      expect(parseWordListInput('')).toEqual([]);
    });

    it('should handle mixed spaces and empty slots', () => {
      expect(parseWordListInput(' , word1 , , word2 ')).toEqual(['word1', 'word2']);
    });
  });

  describe('formatWordListForInput', () => {
    it('should format a basic list', () => {
      expect(formatWordListForInput(['one', 'two'])).toBe('one, two');
    });

    it('should format an empty list', () => {
      expect(formatWordListForInput([])).toBe('');
    });

    it('should format a single item', () => {
      expect(formatWordListForInput(['one'])).toBe('one');
    });
  });
});
