import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { THEMES } from '../data/constants';

export const useOnlineGame = (setScreen, mySessionId, localIp, playerName) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineGames, setOnlineGames] = useState([]);
  const [lanGames, setLanGames] = useState([]);
  const [roomId, setRoomId] = useState(null);
  const [roomData, setRoomData] = useState(null);

  // Derived State
  const isHost = roomData?.hostPlayerId === mySessionId;

  // Creation Settings
  const [newGameSettings, setNewGameSettings] = useState({
    name: '',
    players: 2, // 2 = unlimited mode, shows as ∞ in UI
    type: 'in_person'
  });


  useEffect(() => {
    const serverUrl = import.meta.env.PROD ? window.location.origin : undefined;
    const newSocket = io(serverUrl);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
      newSocket.emit('requestRoomList');
      if (mySessionId) {
        const lastRoomId = localStorage.getItem('lastRoomId');
        if (lastRoomId) {
          console.log(`Auto-rejoining room ${lastRoomId} with session ${mySessionId}`);
          newSocket.emit('rejoinRoom', { roomId: lastRoomId, playerId: mySessionId });
        }
      }
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    newSocket.on('roomCreated', (room) => {
      console.log('Room created:', room);
      setRoomId(room.id);
      setRoomData(room);
      setScreen('online_waiting');
    });

    newSocket.on('roomList', (rooms) => {
      setOnlineGames(rooms);
    });

    newSocket.on('lanGamesList', (games) => {
      console.log('LAN games list received:', games);
      setLanGames(games);
    });

    newSocket.on('roomJoined', (room) => {
      console.log('Joined room:', room);
      setRoomId(room.id);
      setRoomData(room);
      setScreen('online_waiting');
    });

    newSocket.on('roomUpdated', (room) => {
      console.log('Room updated:', room);
      setRoomData(room);
    });

    newSocket.on('gameStarted', (room) => {
      console.log('Game started:', room);
      setRoomData(room);
      setScreen('online_playing');
    });

    newSocket.on('gameUpdated', (room) => {
      console.log('Game updated:', room);
      setRoomData(room);
    });

    newSocket.on('gameDataUpdated', (gameData) => {
      console.log('Game data updated:', gameData);
      setRoomData(prevRoom => {
        if (!prevRoom) return null;
        return { ...prevRoom, gameData };
      });
    });

    newSocket.on('gameReset', (room) => {
      console.log('Game reset:', room);
      setRoomData(room);
      setScreen('online_waiting');
    });

    newSocket.on('roomClosed', ({ message }) => {
      console.log('Room closed:', message);
      alert(message);
      alert(message);
      setRoomData(null);
      setRoomId(null);
      setScreen('online_lobby');
    });

    newSocket.on('error', (msg) => {
      alert('Error: ' + msg);
    });

    return () => newSocket.close();
  }, [setScreen]); // Removed other dependencies to avoid re-connection loop




  // Actions
  const createOnlineGame = useCallback((nameOverride) => {
    if (socket) {
      socket.emit('createRoom', {
        playerName: nameOverride || playerName || 'Host',
        roomName: newGameSettings.name,
        settings: {
          players: newGameSettings.players,
          type: newGameSettings.type,
          isPrivate: newGameSettings.isPrivate
        },
        playerId: mySessionId,
        localIp: localIp
      });
      localStorage.setItem('lastRoomId', '');
    }
  }, [socket, playerName, newGameSettings, mySessionId, localIp]);

  const joinOnlineGame = useCallback((id, nameOverride) => {
    if (socket) {
      socket.emit('joinRoom', { roomId: id, playerName: nameOverride || playerName || 'Jugador', playerId: mySessionId });
      localStorage.setItem('lastRoomId', id);
    }
  }, [socket, playerName, mySessionId]);

  const updateRoomSettings = useCallback((settings) => {
    if (socket && roomId && isHost) {
      socket.emit('updateSettings', { roomId, settings });
    }
  }, [socket, roomId, isHost]);

  const leaveRoom = useCallback(() => {
    if (socket && roomId) {
      socket.emit('leaveRoom', { roomId, playerId: mySessionId });
    }
    setRoomData(null);
    setRoomId(null);
    setScreen('online_lobby');
    localStorage.removeItem('lastRoomId');
    window.history.pushState(null, '', '/online');
  }, [socket, roomId, mySessionId, setScreen]);

  const resetOnlineGame = useCallback(() => {
    if (socket && roomId) {
      socket.emit('resetGame', { roomId });
    }
  }, [socket, roomId]);

  const contributeTheme = useCallback((themes) => {
    if (socket && roomId) {
      socket.emit('contributeTheme', { roomId, themes });
    }
  }, [socket, roomId]);

  const startOnlineGame = useCallback(() => {
    if (socket && isHost && roomId && roomData) {
      const themes = roomData.settings.selectedThemes || ['básico'];

      // Collect words from built-in themes
      let allWords = [...new Set(themes.flatMap(theme => {
        // Check if it's a contributed theme
        if (theme.startsWith('contributed:')) {
          const contributedTheme = roomData.contributedThemes?.find(t =>
            `contributed:${t.name}:${t.contributorId}` === theme
          );
          return contributedTheme ? contributedTheme.words : [];
        }
        // Regular built-in theme
        return THEMES[theme] || [];
      }))];

      socket.emit('startGame', { roomId, words: allWords, numMonos: roomData.settings.numMonos });
    }
  }, [socket, isHost, roomId, roomData]);

  const submitHint = useCallback((hint) => {
    if (socket && roomId) {
      socket.emit('submitHint', { roomId, hint });
    }
  }, [socket, roomId]);

  const finishTurn = useCallback(() => {
    if (socket && roomId) {
      socket.emit('finishTurn', { roomId });
    }
  }, [socket, roomId]);

  const submitVote = useCallback((voteIds) => {
    if (socket && roomId) {
      const votes = Array.isArray(voteIds) ? voteIds : [voteIds];
      socket.emit('submitVote', { roomId, voteIds: votes });
    }
  }, [socket, roomId]);

  const submitMonoGuess = useCallback((guess) => {
    if (socket && roomId) {
      socket.emit('submitMonoGuess', { roomId, guess });
    }
  }, [socket, roomId]);

  return {
    socket,
    onlineGames,
    setOnlineGames,
    lanGames,
    setLanGames,
    roomId,
    setRoomId,
    isHost,
    roomData,
    setRoomData,
    newGameSettings,
    setNewGameSettings,

    // Actions
    createOnlineGame,
    joinOnlineGame,
    updateRoomSettings,
    leaveRoom,
    resetOnlineGame,
    startOnlineGame,
    contributeTheme,
    submitHint,
    finishTurn,
    submitVote,
    submitMonoGuess
  };
};
