import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useOfflineGameplay } from './useOfflineGameplay';
import { THEMES } from '../../data/constants';

// Mock dependencies
vi.mock('../../data/constants', () => ({
  THEMES: {
    'básico': ['word1', 'word2', 'word3']
  }
}));

describe('useOfflineGameplay', () => {
  const mockSetScreen = vi.fn();
  const mockSetup = {
    selectedThemes: ['básico'],
    numPlayers: 3,
    numMonos: 1,
    playerNames: ['P1', 'P2', 'P3']
  };
  const mockCustomLists = {};

  beforeEach(() => {
    window.localStorage.clear();
    mockSetScreen.mockClear();
  });

  it('should start game and set screen to reveal', () => {
    const { result } = renderHook(() => useOfflineGameplay(mockSetScreen, mockSetup, mockCustomLists));

    act(() => {
      result.current.startGame();
    });

    expect(result.current.gameData).not.toBeNull();
    expect(result.current.gameData.players).toHaveLength(3);
    expect(mockSetScreen).toHaveBeenCalledWith('reveal');
  });

  it('should advance to next player', () => {
    const { result } = renderHook(() => useOfflineGameplay(mockSetScreen, mockSetup, mockCustomLists));

    act(() => {
      result.current.startGame();
    });

    expect(result.current.currentPlayerIndex).toBe(0);

    act(() => {
      result.current.nextPlayer();
    });

    expect(result.current.currentPlayerIndex).toBe(1);
  });

  it('should show word', () => {
    const { result } = renderHook(() => useOfflineGameplay(mockSetScreen, mockSetup, mockCustomLists));

    act(() => {
      result.current.startGame();
      result.current.showWord();
    });

    expect(result.current.wordRevealed).toBe(true);
  });
});
