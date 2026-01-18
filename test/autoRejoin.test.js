import { describe, it, expect, vi } from 'vitest';

// The logic under test (extracted from useOnlineGame.js)
const executeRejoinLogic = (socket, localStorage, mySessionId) => {
  if (mySessionId) {
    const lastRoomId = localStorage.getItem('lastRoomId');
    if (lastRoomId) {
      socket.emit('rejoinRoom', { roomId: lastRoomId, playerId: mySessionId });
    }
  }
};

describe('autoRejoin', () => {
  it('should rejoin when valid session and room ID exist', () => {
    const socket = { emit: vi.fn() };
    const ls = { getItem: vi.fn().mockReturnValue('ROOM_123') };
    const sessionId = 'USER_ABC';

    executeRejoinLogic(socket, ls, sessionId);

    expect(socket.emit).toHaveBeenCalledWith('rejoinRoom', {
      roomId: 'ROOM_123',
      playerId: 'USER_ABC'
    });
  });

  it('should NOT rejoin when room ID is missing', () => {
    const socket = { emit: vi.fn() };
    const ls = { getItem: vi.fn().mockReturnValue(null) };
    const sessionId = 'USER_ABC';

    executeRejoinLogic(socket, ls, sessionId);

    expect(socket.emit).not.toHaveBeenCalled();
  });

  it('should NOT rejoin when session ID is missing', () => {
    const socket = { emit: vi.fn() };
    const ls = { getItem: vi.fn().mockReturnValue('ROOM_123') };
    const sessionId = null;

    executeRejoinLogic(socket, ls, sessionId);

    expect(socket.emit).not.toHaveBeenCalled();
  });
});
