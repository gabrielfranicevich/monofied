
console.log('Running verify_auto_rejoin.js...');

let passed = 0;
let failed = 0;

const assert = (description, cond) => {
  if (cond) {
    console.log(`PASS: ${description}`);
    passed++;
  } else {
    console.error(`FAIL: ${description}`);
    failed++;
  }
};

// Mock Setup
const createMockSocket = () => ({
  emittedEvents: [],
  emit: function (event, data) {
    this.emittedEvents.push({ event, data });
  },
  on: function () { }
});

const createMockLocalStorage = (store = {}) => ({
  getItem: (key) => store[key] || null
});

// The logic under test (extracted from useOnlineGame.js)
const executeRejoinLogic = (socket, localStorage, mySessionId) => {
  if (mySessionId) {
    const lastRoomId = localStorage.getItem('lastRoomId');
    if (lastRoomId) {
      console.log(`[Mock] Auto-rejoining room ${lastRoomId} with session ${mySessionId}`);
      socket.emit('rejoinRoom', { roomId: lastRoomId, playerId: mySessionId });
    }
  }
};

try {
  // Scenario 1: Everything present
  {
    console.log('\nScenario 1: Valid Session and Room ID');
    const socket = createMockSocket();
    const ls = createMockLocalStorage({ 'lastRoomId': 'ROOM_123' });
    const sessionId = 'USER_ABC';

    executeRejoinLogic(socket, ls, sessionId);

    assert('Emit called exactly once', socket.emittedEvents.length === 1);
    const call = socket.emittedEvents[0];
    assert('Emitted "rejoinRoom"', call && call.event === 'rejoinRoom');
    assert('Correct roomId', call && call.data.roomId === 'ROOM_123');
    assert('Correct playerId', call && call.data.playerId === 'USER_ABC');
  }

  // Scenario 2: No Room ID stored
  {
    console.log('\nScenario 2: No stored Room ID');
    const socket = createMockSocket();
    const ls = createMockLocalStorage({}); // empty
    const sessionId = 'USER_ABC';

    executeRejoinLogic(socket, ls, sessionId);

    assert('Emit NOT called', socket.emittedEvents.length === 0);
  }

  // Scenario 3: No Session ID (e.g. first load or error)
  {
    console.log('\nScenario 3: No Session ID');
    const socket = createMockSocket();
    const ls = createMockLocalStorage({ 'lastRoomId': 'ROOM_123' });
    const sessionId = null;

    executeRejoinLogic(socket, ls, sessionId);

    assert('Emit NOT called', socket.emittedEvents.length === 0);
  }

  console.log('---------------------------------------------------');
  if (failed === 0) {
    console.log(`ALL TESTS PASSED (${passed}/${passed})`);
    process.exit(0);
  } else {
    console.error(`${failed} TESTS FAILED`);
    process.exit(1);
  }

} catch (err) {
  console.error('An error occurred during testing:', err);
  process.exit(1);
}
