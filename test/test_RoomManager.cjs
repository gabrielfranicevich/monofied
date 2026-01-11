const assert = require('assert');
const RoomManager = require('../server/RoomManager.cjs');

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

// Test Suite
console.log('Running RoomManager Tests...');

const io = new MockIO();
const manager = new RoomManager(io);

// Test 1: Create Room
console.log('Test 1: Create Room');
const hostSocket = new MockSocket('host-socket');
const room = manager.createRoom({
  socket: hostSocket,
  playerName: 'Host',
  playerId: 'p1',
  roomName: 'Test Room',
  settings: { players: 4, type: 'chat' },
  clientIp: '127.0.0.1',
  localIp: '192.168.1.5'
});

assert.ok(room.id, 'Room should have an ID');
assert.strictEqual(room.hostId, 'host-socket');
assert.strictEqual(room.players.length, 1);
assert.strictEqual(room.players[0].name, 'Host');
assert.strictEqual(manager.getRoom(room.id), room);
console.log('PASS: Room created successfully.');

// Test 2: Join Room
console.log('Test 2: Join Room');
const playerSocket = new MockSocket('player-socket');
manager.joinRoom(playerSocket, {
  roomId: room.id,
  playerName: 'Player 2',
  playerId: 'p2'
});

assert.strictEqual(room.players.length, 2);
assert.strictEqual(room.players[1].name, 'Player 2');
assert.ok(playerSocket.joinedRooms.has(room.id), 'Player should join socket room');
console.log('PASS: Player joined successfully.');

// Test 3: Rejoin Room (same playerId)
console.log('Test 3: Rejoin Room');
const newPlayerSocket = new MockSocket('new-player-socket');
manager.joinRoom(newPlayerSocket, {
  roomId: room.id,
  playerName: 'Player 2', // Name doesn't matter for rejoin, checks ID
  playerId: 'p2'
});

assert.strictEqual(room.players.length, 2, 'Player count should not increase');
assert.strictEqual(room.players[1].id, 'new-player-socket', 'Socket ID should update');
console.log('PASS: Player rejoined successfully.');

// Test 4: Leave Room (Regular Player)
console.log('Test 4: Leave Room');
manager.leaveRoom(newPlayerSocket, room.id, 'p2');
assert.strictEqual(room.players.length, 1, 'Player count should decrease');
console.log('PASS: Player left successfully.');

// Test 5: Host Leave (Destroy Room)
console.log('Test 5: Host Leaves Room');
manager.leaveRoom(hostSocket, room.id, 'p1');
assert.strictEqual(manager.getRoom(room.id), undefined, 'Room should be deleted');
console.log('PASS: Room destroyed after host left.');

console.log('All RoomManager tests passed!');
