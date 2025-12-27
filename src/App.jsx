import React, { useState, useEffect } from 'react';
import './App.css';
import { THEMES, SUSTANTIVOS, ADJETIVOS } from './data/constants';
import HomeScreen from './components/HomeScreen';
import SetupScreen from './components/SetupScreen';
import RevealScreen from './components/RevealScreen';
import PlayingScreen from './components/PlayingScreen';
import OnlineLobbyScreen from './components/online/OnlineLobbyScreen';
import OnlineCreateScreen from './components/online/OnlineCreateScreen';
import OnlineWaitingRoom from './components/online/OnlineWaitingRoom';
import OnlinePlayingScreen from './components/online/OnlinePlayingScreen';
import { useSocket } from './hooks/useSocket';

function App() {
  const [screen, setScreen] = useState('home');
  const [selectedThemes, setSelectedThemes] = useState(['básico']);
  const [numPlayers, setNumPlayers] = useState(3);
  const [numMonos, setNumMonos] = useState(1);
  const [playerNames, setPlayerNames] = useState(['', '', '']);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [gameData, setGameData] = useState(null);
  const [wordRevealed, setWordRevealed] = useState(false);

  const [themesExpanded, setThemesExpanded] = useState(false);
  const [playersExpanded, setPlayersExpanded] = useState(false);
  const [monosExpanded, setMonosExpanded] = useState(false);
  const [namesExpanded, setNamesExpanded] = useState(false);

  const [turnOrderExpanded, setTurnOrderExpanded] = useState(true);
  const [allPlayersExpanded, setAllPlayersExpanded] = useState(false);
  const [rulesExpanded, setRulesExpanded] = useState(false);
  const [onlineGamesExpanded, setOnlineGamesExpanded] = useState(true);

  // Online Game State
  const [onlineGames, setOnlineGames] = useState([]);
  const [lanGames, setLanGames] = useState([]);
  const [localIp, setLocalIp] = useState(null);
  const [newGameSettings, setNewGameSettings] = useState({
    name: '',
    players: 3,
    type: 'in_person'
  });
  const [roomId, setRoomId] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [roomData, setRoomData] = useState(null);
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem('playerName') || '';
  });

  // Session ID for persistence
  const [mySessionId] = useState(() => {
    let id = localStorage.getItem('mySessionId');
    if (!id) {
      id = 'user_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
      localStorage.setItem('mySessionId', id);
    }
    return id;
  });

  const { socket, isConnected } = useSocket(setOnlineGames, setLanGames, setScreen, setRoomId, setIsHost, setRoomData);

  // Get local IP via WebRTC for LAN detection
  useEffect(() => {
    const getLocalIp = async () => {
      try {
        const pc = new RTCPeerConnection({ iceServers: [] });
        pc.createDataChannel('');
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        pc.onicecandidate = (e) => {
          if (e.candidate) {
            const parts = e.candidate.candidate.split(' ');
            const ip = parts[4];
            if (ip && ip.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
              setLocalIp(ip);
              pc.close();
            }
          }
        };

        // Timeout cleanup
        setTimeout(() => pc.close(), 5000);
      } catch (err) {
        console.log('Could not detect local IP:', err);
      }
    };
    getLocalIp();
  }, []);

  // Auto-rejoin on refresh/connect
  useEffect(() => {
    if (socket && isConnected) {
      const lastRoomId = localStorage.getItem('lastRoomId');
      if (lastRoomId) {
        socket.emit('rejoinRoom', { roomId: lastRoomId, playerId: mySessionId });
      }
    }
  }, [socket, isConnected, mySessionId]);

  // Persist playerName
  useEffect(() => {
    if (playerName) {
      localStorage.setItem('playerName', playerName);
    }
  }, [playerName]);

  // URL Routing
  useEffect(() => {
    const path = window.location.pathname.substring(1); // Remove leading /
    const pathUpper = path.toUpperCase();

    if (path === 'online') {
      setScreen('online_lobby');
    } else if (pathUpper && pathUpper.length === 4) {
      // 4-letter room code - redirect to /online and set roomId
      setRoomId(pathUpper);
      setScreen('online_lobby');
      window.history.replaceState(null, '', '/online');
    } else if (path) {
      // Clear invalid path
      window.history.replaceState(null, '', '/');
    }

    const handlePopState = () => {
      const newPath = window.location.pathname.substring(1);
      const newPathUpper = newPath.toUpperCase();

      if (newPath === 'online') {
        setScreen('online_lobby');
        setRoomId(null);
      } else if (newPathUpper && newPathUpper.length === 4) {
        setRoomId(newPathUpper);
        setScreen('online_lobby');
        window.history.replaceState(null, '', '/online');
      } else {
        setRoomId(null);
        setScreen('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update URL when entering a game room
  useEffect(() => {
    if ((screen === 'online_waiting' || screen === 'online_playing') && roomData?.id) {
      window.history.pushState(null, '', `/${roomData.id}`);
    } else if (screen === 'online_lobby' || screen === 'online_create') {
      if (!roomId) {
        window.history.pushState(null, '', '/online');
      }
      // If roomId exists, URL is already set to the room code
    } else if (screen === 'home') {
      window.history.pushState(null, '', '/');
    }
  }, [screen, roomData, roomId]);

  const toggleTheme = React.useCallback((theme) => {
    setSelectedThemes(prev => {
      if (prev.includes(theme)) {
        if (prev.length > 1) {
          return prev.filter(t => t !== theme);
        }
        return prev;
      } else {
        return [...prev, theme];
      }
    });
  }, []);

  const updatePlayerName = React.useCallback((index, name) => {
    setPlayerNames(prev => {
      const newNames = [...prev];
      newNames[index] = name;
      return newNames;
    });
    if (index === 0) setPlayerName(name);
  }, []);

  const getRandomName = React.useCallback(() => {
    const sustantivo = SUSTANTIVOS[Math.floor(Math.random() * SUSTANTIVOS.length)];
    const adjetivo = ADJETIVOS[Math.floor(Math.random() * ADJETIVOS.length)];
    return `${sustantivo} ${adjetivo}`;
  }, []);

  const generateRandomName = React.useCallback((index) => {
    const name = getRandomName();
    updatePlayerName(index, name);
  }, [updatePlayerName, getRandomName]);

  const addPlayer = React.useCallback(() => {
    const newNumPlayers = numPlayers + 1;
    setNumPlayers(newNumPlayers);
    setPlayerNames([...playerNames, '']);
    const maxMonos = Math.ceil(newNumPlayers / 2) - 1;
    if (numMonos > maxMonos) {
      setNumMonos(maxMonos);
    }
  }, [numPlayers, playerNames, numMonos]);

  const removePlayer = React.useCallback(() => {
    if (numPlayers > 3) {
      const newNumPlayers = numPlayers - 1;
      setNumPlayers(newNumPlayers);
      setPlayerNames(playerNames.slice(0, -1));
      const maxMonos = Math.ceil(newNumPlayers / 2) - 1;
      if (numMonos > maxMonos) {
        setNumMonos(maxMonos);
      }
    }
  }, [numPlayers, playerNames, numMonos]);

  const addMono = React.useCallback(() => {
    const maxMonos = Math.ceil(numPlayers / 2) - 1;
    if (numMonos < maxMonos) {
      setNumMonos(numMonos + 1);
    }
  }, [numPlayers, numMonos]);

  const removeMono = React.useCallback(() => {
    if (numMonos > 1) {
      setNumMonos(numMonos - 1);
    }
  }, [numMonos]);


  const startGame = () => {
    const allWords = [...new Set(selectedThemes.flatMap(theme => THEMES[theme]))];
    const selectedWord = allWords[Math.floor(Math.random() * allWords.length)];

    const finalPlayerNames = playerNames.slice(0, numPlayers).map((name, i) =>
      name.trim() ? name : `Jugador ${i + 1}`
    );

    const monoIndices = [];
    const availableIndices = Array.from({ length: numPlayers }, (_, i) => i);
    for (let i = 0; i < numMonos; i++) {
      const randomIndex = Math.floor(Math.random() * availableIndices.length);
      monoIndices.push(availableIndices[randomIndex]);
      availableIndices.splice(randomIndex, 1);
    }

    const playerOrder = Array.from({ length: numPlayers }, (_, i) => i);
    for (let i = playerOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [playerOrder[i], playerOrder[j]] = [playerOrder[j], playerOrder[i]];
    }

    setGameData({
      word: selectedWord,
      monoIndices: monoIndices,
      players: finalPlayerNames,
      playerOrder: playerOrder
    });
    setCurrentPlayerIndex(0);
    setWordRevealed(false);
    setScreen('reveal');
  };

  const showWord = () => {
    setWordRevealed(true);
  };

  const nextPlayer = () => {
    if (currentPlayerIndex < numPlayers - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
      setWordRevealed(false);
    } else {
      setScreen('playing');
    }
  };

  const resetGame = () => {
    if (screen.startsWith('online_')) {
      if (isHost && socket) {
        socket.emit('resetGame', { roomId });
      }
      return;
    }
    setScreen('setup');
    setCurrentPlayerIndex(0);
    setGameData(null);
    setWordRevealed(false);
    setMonosExpanded(false);
    setNamesExpanded(false);
    setThemesExpanded(false);
    setPlayersExpanded(false);
    setTurnOrderExpanded(true);
    setAllPlayersExpanded(false);
    setRulesExpanded(false);
  };

  // Online Methods
  const createOnlineGame = (nameOverride) => {
    if (socket) {
      socket.emit('createRoom', {
        playerName: nameOverride || playerName || 'Host',
        roomName: newGameSettings.name,
        settings: {
          players: newGameSettings.players,
          type: newGameSettings.type
        },
        playerId: mySessionId,
        localIp: localIp // Send local IP for LAN detection
      });
      localStorage.setItem('lastRoomId', ''); // Will be set on join confirmation
    }
  };

  const joinOnlineGame = (id, nameOverride) => {
    // go to the game/waiting screen in specific url
    if (socket) {
      socket.emit('joinRoom', { roomId: id, playerName: nameOverride || playerName || 'Jugador', playerId: mySessionId });
      localStorage.setItem('lastRoomId', id);
    }
  };

  const updateRoomSettings = (settings) => {
    if (socket && roomId && isHost) {
      socket.emit('updateSettings', { roomId, settings });
    }
  };

  const leaveRoom = () => {
    if (socket && roomId) {
      socket.emit('leaveRoom', { roomId, playerId: mySessionId });
    }
    // Clear room data but keep player name
    setRoomData(null);
    setRoomId(null);
    setIsHost(false);
    setScreen('online_lobby');
    localStorage.removeItem('lastRoomId');
    window.history.pushState(null, '', '/online');
  };

  const resetOnlineGame = () => {
    if (socket && roomId) {
      socket.emit('resetGame', { roomId });
    }
  };

  const startOnlineGame = () => {
    if (socket && isHost && roomId) {
      const themes = roomData.settings.selectedThemes || ['básico'];
      const allWords = [...new Set(themes.flatMap(theme => THEMES[theme]))];
      socket.emit('startGame', { roomId, words: allWords, numMonos: roomData.settings.numMonos });
    }
  };

  const submitHint = (hint) => {
    if (socket && roomId) {
      socket.emit('submitHint', { roomId, hint });
    }
  };

  const finishTurn = () => {
    if (socket && roomId) {
      socket.emit('finishTurn', { roomId });
    }
  };

  const submitVote = (voteIds) => {
    if (socket && roomId) {
      // Ensure it's an array
      const votes = Array.isArray(voteIds) ? voteIds : [voteIds];
      // Send IDs directly as server logic uses IDs
      socket.emit('submitVote', { roomId, voteIds: votes });
    }
  };

  const submitMonoGuess = (guess) => {
    if (socket && roomId) {
      socket.emit('submitMonoGuess', { roomId, guess });
    }
  };

  const isMono = gameData && gameData.monoIndices.includes(currentPlayerIndex);
  const maxMonos = Math.ceil(numPlayers / 2) - 1;

  return (
    <div className="min-h-screen bg-brand-beige bg-jungle-pattern p-4 flex items-center justify-center font-sans text-brand-wood selection:bg-brand-mustard selection:text-brand-dark">
      <div className="w-full max-w-md bg-brand-cream rounded-3xl shadow-[8px_8px_0px_0px_rgba(93,64,55,0.2)] overflow-hidden border-4 border-brand-wood relative">
        <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-brand-wood/20"></div>
        <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-brand-wood/20"></div>
        <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-brand-wood/20"></div>
        <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-brand-wood/20"></div>

        {screen === 'home' && <HomeScreen setScreen={setScreen} />}

        {screen === 'online_lobby' && (
          <OnlineLobbyScreen
            setScreen={setScreen}
            onlineGames={onlineGames}
            lanGames={lanGames}
            onlineGamesExpanded={onlineGamesExpanded}
            setOnlineGamesExpanded={setOnlineGamesExpanded}
            joinOnlineGame={joinOnlineGame}
            playerName={playerName}
            setPlayerName={setPlayerName}
            roomIdFromUrl={roomId} // Pass the ID from URL if present
            clearRoomId={() => setRoomId(null)}
            socket={socket}
            getRandomName={getRandomName}
            localIp={localIp}
          />
        )}

        {screen === 'online_create' && (
          <OnlineCreateScreen
            setScreen={setScreen}
            newGameSettings={newGameSettings}
            setNewGameSettings={setNewGameSettings}
            onlineGames={onlineGames}
            setOnlineGames={setOnlineGames}
            playerNames={playerNames}
            createOnlineGame={createOnlineGame}
            playerName={playerName}
            setPlayerName={setPlayerName}
            getRandomName={getRandomName}
          />
        )}

        {screen === 'online_waiting' && roomData && (
          <OnlineWaitingRoom
            roomData={roomData}
            isHost={isHost}
            leaveRoom={leaveRoom}
            startGame={startOnlineGame}
            updateRoomSettings={updateRoomSettings}
          />
        )}

        {screen === 'online_playing' && roomData && (
          <OnlinePlayingScreen
            roomData={roomData}
            playerName={playerName}
            playerId={mySessionId}
            submitHint={submitHint}
            finishTurn={finishTurn}
            submitVote={submitVote}
            leaveRoom={leaveRoom}
            isHost={isHost}
            resetGame={resetOnlineGame}
            submitMonoGuess={submitMonoGuess}
          />
        )}

        {screen === 'setup' && (
          <SetupScreen
            setScreen={setScreen}
            selectedThemes={selectedThemes}
            toggleTheme={toggleTheme}
            themesExpanded={themesExpanded}
            setThemesExpanded={setThemesExpanded}
            numPlayers={numPlayers}
            addPlayer={addPlayer}
            removePlayer={removePlayer}
            playersExpanded={playersExpanded}
            setPlayersExpanded={setPlayersExpanded}
            maxMonos={maxMonos}
            numMonos={numMonos}
            addMono={addMono}
            removeMono={removeMono}
            monosExpanded={monosExpanded}
            setMonosExpanded={setMonosExpanded}
            playerNames={playerNames}
            updatePlayerName={updatePlayerName}
            generateRandomName={generateRandomName}
            namesExpanded={namesExpanded}
            setNamesExpanded={setNamesExpanded}
            startGame={startGame}
          />
        )}

        {screen === 'reveal' && gameData && (
          <RevealScreen
            gameData={gameData}
            currentPlayerIndex={currentPlayerIndex}
            numPlayers={numPlayers}
            wordRevealed={wordRevealed}
            showWord={showWord}
            isMono={isMono}
            nextPlayer={nextPlayer}
          />
        )}

        {screen === 'playing' && gameData && (
          <PlayingScreen
            gameData={gameData}
            numMonos={numMonos}
            resetGame={resetGame}
            turnOrderExpanded={turnOrderExpanded}
            setTurnOrderExpanded={setTurnOrderExpanded}
            allPlayersExpanded={allPlayersExpanded}
            setAllPlayersExpanded={setAllPlayersExpanded}
            rulesExpanded={rulesExpanded}
            setRulesExpanded={setRulesExpanded}
          />
        )}
      </div>
    </div>
  );
}

export default App;
