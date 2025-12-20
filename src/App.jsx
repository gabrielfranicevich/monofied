import React, { useState, useEffect } from 'react';
import './App.css';
import { THEMES, SUSTANTIVOS, ADJETIVOS } from './data/constants';
import HomeScreen from './components/HomeScreen';
import SetupScreen from './components/SetupScreen';
import RevealScreen from './components/RevealScreen';
import PlayingScreen from './components/PlayingScreen';
import LanLobbyScreen from './components/lan/LanLobbyScreen';
import LanCreateScreen from './components/lan/LanCreateScreen';
import LanWaitingRoom from './components/lan/LanWaitingRoom';
import LanPlayingScreen from './components/lan/LanPlayingScreen';
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
  const [lanGamesExpanded, setLanGamesExpanded] = useState(true);

  // LAN Game State
  const [lanGames, setLanGames] = useState([]);
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

  // Persist playerName
  useEffect(() => {
    if (playerName) {
      localStorage.setItem('playerName', playerName);
    }
  }, [playerName]);

  const { socket, isConnected } = useSocket(setLanGames, setScreen, setRoomId, setIsHost, setRoomData);

  // URL Routing
  useEffect(() => {
    const path = window.location.pathname.substring(1); // Remove leading /
    const pathUpper = path.toUpperCase();

    if (path === 'lan') {
      setScreen('lan_lobby');
    } else if (pathUpper && pathUpper.length === 4) {
      // 4-letter room code - redirect to /lan and set roomId
      setRoomId(pathUpper);
      setScreen('lan_lobby');
      window.history.replaceState(null, '', '/lan');
    } else if (path) {
      // Clear invalid path
      window.history.replaceState(null, '', '/');
    }

    const handlePopState = () => {
      const newPath = window.location.pathname.substring(1);
      const newPathUpper = newPath.toUpperCase();

      if (newPath === 'lan') {
        setScreen('lan_lobby');
        setRoomId(null);
      } else if (newPathUpper && newPathUpper.length === 4) {
        setRoomId(newPathUpper);
        setScreen('lan_lobby');
        window.history.replaceState(null, '', '/lan');
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
    if ((screen === 'lan_waiting' || screen === 'lan_playing') && roomData?.id) {
      window.history.pushState(null, '', `/${roomData.id}`);
    } else if (screen === 'lan_lobby' || screen === 'lan_create') {
      if (!roomId) {
        window.history.pushState(null, '', '/lan');
      }
      // If roomId exists, URL is already set to the room code
    } else if (screen === 'home') {
      window.history.pushState(null, '', '/');
    }
  }, [screen, roomData, roomId]);

  const toggleTheme = (theme) => {
    if (selectedThemes.includes(theme)) {
      if (selectedThemes.length > 1) {
        setSelectedThemes(selectedThemes.filter(t => t !== theme));
      }
    } else {
      setSelectedThemes([...selectedThemes, theme]);
    }
  };

  const updatePlayerName = (index, name) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
    if (index === 0) setPlayerName(name);
  };

  const getRandomName = () => {
    const sustantivo = SUSTANTIVOS[Math.floor(Math.random() * SUSTANTIVOS.length)];
    const adjetivo = ADJETIVOS[Math.floor(Math.random() * ADJETIVOS.length)];
    return `${sustantivo} ${adjetivo}`;
  };

  const generateRandomName = (index) => {
    updatePlayerName(index, getRandomName());
  };

  const addPlayer = () => {
    const newNumPlayers = numPlayers + 1;
    setNumPlayers(newNumPlayers);
    setPlayerNames([...playerNames, '']);
    const maxMonos = Math.ceil(newNumPlayers / 2) - 1;
    if (numMonos > maxMonos) {
      setNumMonos(maxMonos);
    }
  };

  const removePlayer = () => {
    if (numPlayers > 3) {
      const newNumPlayers = numPlayers - 1;
      setNumPlayers(newNumPlayers);
      setPlayerNames(playerNames.slice(0, -1));
      const maxMonos = Math.ceil(newNumPlayers / 2) - 1;
      if (numMonos > maxMonos) {
        setNumMonos(maxMonos);
      }
    }
  };

  const addMono = () => {
    const maxMonos = Math.ceil(numPlayers / 2) - 1;
    if (numMonos < maxMonos) {
      setNumMonos(numMonos + 1);
    }
  };

  const removeMono = () => {
    if (numMonos > 1) {
      setNumMonos(numMonos - 1);
    }
  };

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
    if (screen.startsWith('lan_')) {
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

  // LAN Methods
  const createLanGame = (nameOverride) => {
    if (socket) {
      socket.emit('createRoom', {
        playerName: nameOverride || playerName || 'Host',
        roomName: newGameSettings.name,
        settings: {
          players: newGameSettings.players,
          type: newGameSettings.type
        }
      });
    }
  };

  const joinLanGame = (id, nameOverride) => {
    // go to the game/waiting screen in specific url
    if (socket) {
      socket.emit('joinRoom', { roomId: id, playerName: nameOverride || playerName || 'Jugador' });
    }
  };

  const updateRoomSettings = (settings) => {
    if (socket && roomId && isHost) {
      socket.emit('updateSettings', { roomId, settings });
    }
  };

  const leaveRoom = () => {
    if (socket && roomId) {
      socket.emit('leaveRoom', { roomId });
    }
    // Clear room data but keep player name
    setRoomData(null);
    setRoomId(null);
    setIsHost(false);
    setScreen('lan_lobby');
    window.history.pushState(null, '', '/lan');
  };

  const resetLanGame = () => {
    if (socket && roomId) {
      socket.emit('resetGame', { roomId });
    }
  };

  const startLanGame = () => {
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

  const submitVote = (votedPlayerIndices) => {
    if (socket && roomId) {
      // Ensure it's an array
      const indices = Array.isArray(votedPlayerIndices) ? votedPlayerIndices : [votedPlayerIndices];
      // Send indices directly as server logic uses indices for mono verification
      socket.emit('submitVote', { roomId, votedPlayerIndices: indices });
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

        {screen === 'lan_lobby' && (
          <LanLobbyScreen
            setScreen={setScreen}
            lanGames={lanGames}
            lanGamesExpanded={lanGamesExpanded}
            setLanGamesExpanded={setLanGamesExpanded}
            joinLanGame={joinLanGame}
            playerName={playerName}
            setPlayerName={setPlayerName}
            roomIdFromUrl={roomId} // Pass the ID from URL if present
            clearRoomId={() => setRoomId(null)}
            socket={socket}
            getRandomName={getRandomName}
          />
        )}

        {screen === 'lan_create' && (
          <LanCreateScreen
            setScreen={setScreen}
            newGameSettings={newGameSettings}
            setNewGameSettings={setNewGameSettings}
            lanGames={lanGames}
            setLanGames={setLanGames}
            playerNames={playerNames}
            createLanGame={createLanGame}
            playerName={playerName}
            setPlayerName={setPlayerName}
            getRandomName={getRandomName}
          />
        )}

        {screen === 'lan_waiting' && roomData && (
          <LanWaitingRoom
            roomData={roomData}
            isHost={isHost}
            leaveRoom={leaveRoom}
            startGame={startLanGame}
            updateRoomSettings={updateRoomSettings}
          />
        )}

        {screen === 'lan_playing' && roomData && (
          <LanPlayingScreen
            roomData={roomData}
            playerName={playerName}
            playerId={socket?.id}
            submitHint={submitHint}
            finishTurn={finishTurn}
            submitVote={submitVote}
            leaveRoom={leaveRoom}
            isHost={isHost}
            resetGame={resetLanGame}
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
