import { describe, it, expect } from 'vitest';
import RoomManager from '../server/RoomManager.cjs';

// Mock Socket.IO
class MockIO {
  constructor() {
    this.rooms = {};
    this.emitted = [];
  }
  to(roomId) {
    return {
      emit: (event, data) => {
        this.emitted.push({ to: roomId, event, data });
      }
    };
  }
  emit(event, data) {
    this.emitted.push({ event, data });
  }
}

class MockSocket {
  constructor(id) {
    this.id = id;
    this.joinedRooms = new Set();
    this.emitted = [];
  }
  join(roomId) {
    this.joinedRooms.add(roomId);
  }
  leave(roomId) {
    this.joinedRooms.delete(roomId);
  }
  emit(event, data) {
    this.emitted.push({ event, data });
  }
}

describe('RoomManager', () => {
  const io = new MockIO();
  const manager = new RoomManager(io);
  let room;
  let hostSocket;
  let playerSocket;

  it('should create a room', () => {
    hostSocket = new MockSocket('host-socket');
    room = manager.createRoom({
      socket: hostSocket,
      playerName: 'Host',
      playerId: 'p1',
      roomName: 'Test Room',
      settings: { players: 4, type: 'chat' },
      clientIp: '127.0.0.1',
      localIp: '192.168.1.5'
    });

    expect(room.id).toBeDefined();
    expect(room.hostId).toBe('host-socket');
    expect(room.players.length).toBe(1);
    expect(room.players[0].name).toBe('Host');
    expect(manager.getRoom(room.id)).toBe(room);
  });

  it('should allow a player to join', () => {
    playerSocket = new MockSocket('player-socket');
    manager.joinRoom(playerSocket, {
      roomId: room.id,
      playerName: 'Player 2',
      playerId: 'p2'
    });

    expect(room.players.length).toBe(2);
    expect(room.players[1].name).toBe('Player 2');
    expect(playerSocket.joinedRooms.has(room.id)).toBe(true);
  });

  it('should allow a player to rejoin', () => {
    const newPlayerSocket = new MockSocket('new-player-socket');
    manager.joinRoom(newPlayerSocket, {
      roomId: room.id,
      playerName: 'Player 2',
      playerId: 'p2'
    });

    expect(room.players.length).toBe(2);
    expect(room.players[1].id).toBe('new-player-socket');
  });

  it('should allow a player to leave', () => {
    const socket = new MockSocket('new-player-socket');
    manager.leaveRoom(socket, room.id, 'p2');
    expect(room.players.length).toBe(1);
  });

  it('should destroy room when host leaves', () => {
    manager.leaveRoom(hostSocket, room.id, 'p1');
    expect(manager.getRoom(room.id)).toBeUndefined();
  });
});
