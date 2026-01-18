import { describe, it, expect } from 'vitest';

// Mock window and history (simplified for logic testing)
let screenState = 'home';
const setScreen = (s) => { screenState = s; };
let roomIdState = null;
const setRoomId = (id) => { roomIdState = id; };

function logic(path) {
  const pathUpper = path.substring(1).toUpperCase();
  const pathClean = path.substring(1);

  if (pathClean === 'offline') {
    setScreen('setup');
  } else if (pathClean === 'online') {
    setScreen('online_lobby');
    setRoomId(null);
  } else if (pathUpper && pathUpper.length === 4) {
    setRoomId(pathUpper);
    setScreen('online_lobby');
  } else {
    setScreen('home');
  }
}

describe('Routing Logic', () => {
  it('should map /offline to setup screen', () => {
    logic('/offline');
    expect(screenState).toBe('setup');
  });

  it('should map /online to online_lobby and clear roomId', () => {
    logic('/online');
    expect(screenState).toBe('online_lobby');
    expect(roomIdState).toBeNull();
  });

  it('should map 4-letter path to online_lobby and set roomId', () => {
    logic('/ABCD');
    expect(screenState).toBe('online_lobby');
    expect(roomIdState).toBe('ABCD');
  });

  it('should map root to home screen', () => {
    logic('/');
    expect(screenState).toBe('home');
  });
});
