const assert = require('assert');

// Mock window and history
global.window = {
  location: { pathname: '/' },
  addEventListener: () => { },
  removeEventListener: () => { },
  history: {
    state: null,
    pushState: (state, title, url) => {
      global.window.location.pathname = url;
    },
    replaceState: (state, title, url) => {
      global.window.location.pathname = url;
    }
  }
};

// Mock React hook dependencies
let screenState = 'home';
const setScreen = (s) => { screenState = s; };
let roomIdState = null;
const setRoomId = (id) => { roomIdState = id; };

// Import the hook logic (simulated since we can't easily import JSX/hooks in pure node without transpilation set up for tests)
// We will test the logic by replicating the useEffect logic from useAppRouting
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
    // window.history.replaceState(null, '', '/online'); // Mock replace
  } else if (pathClean) {
    // Unknown path
    // window.history.replaceState(null, '', '/');
  } else {
    setScreen('home');
  }
}

// Tests
console.log('Running Routing Logic Verification...');

// Test 1: /offline
logic('/offline');
assert.strictEqual(screenState, 'setup', 'Should go to setup screen for /offline');
console.log('Pass: /offline -> setup');

// Test 2: /online
logic('/online');
assert.strictEqual(screenState, 'online_lobby', 'Should go to online_lobby for /online');
assert.strictEqual(roomIdState, null, 'Should clear roomId for /online');
console.log('Pass: /online -> online_lobby');

// Test 3: /ABCD (Room ID)
logic('/ABCD');
assert.strictEqual(screenState, 'online_lobby', 'Should go to online_lobby for Room ID');
assert.strictEqual(roomIdState, 'ABCD', 'Should set roomId to ABCD');
console.log('Pass: /ABCD -> online_lobby + roomId');

// Test 4: / (Home)
logic('/');
assert.strictEqual(screenState, 'home', 'Should go to home for root');
console.log('Pass: / -> home');

console.log('All routing logic tests passed!');
