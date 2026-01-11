import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useOfflineSetup } from './useOfflineSetup';

describe('useOfflineSetup', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useOfflineSetup());
    expect(result.current.selectedThemes).toEqual(['básico']);
    expect(result.current.numPlayers).toBe(3);
    expect(result.current.numMonos).toBe(1);
    expect(result.current.playerNames).toHaveLength(3);
  });

  it('should toggle themes', () => {
    const { result } = renderHook(() => useOfflineSetup());

    act(() => {
      result.current.toggleTheme('new-theme');
    });
    expect(result.current.selectedThemes).toContain('new-theme');

    act(() => {
      result.current.toggleTheme('new-theme');
    });
    expect(result.current.selectedThemes).not.toContain('new-theme');
  });

  it('should add player and update maxMonos', () => {
    const { result } = renderHook(() => useOfflineSetup());

    act(() => {
      result.current.addPlayer();
    });

    expect(result.current.numPlayers).toBe(4);
    expect(result.current.maxMonos).toBe(1); // floor(4/2) - 1 = 1
  });

  it('should increase maxMonos with more players', () => {
    const { result } = renderHook(() => useOfflineSetup());

    // Add 2 players -> Total 5
    act(() => {
      result.current.addPlayer();
    });

    act(() => {
      result.current.addPlayer();
    });

    expect(result.current.numPlayers).toBe(5);
    expect(result.current.maxMonos).toBe(2); // floor(5/2) - 1 = 2
  });
});
