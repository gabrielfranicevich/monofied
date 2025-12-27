import { useState, useCallback } from 'react';
import { THEMES, SUSTANTIVOS, ADJETIVOS } from '../data/constants';

export const useOfflineGame = (setScreen) => {
  // Game Setup State
  const [selectedThemes, setSelectedThemes] = useState(['básico']);
  const [numPlayers, setNumPlayers] = useState(3);
  const [numMonos, setNumMonos] = useState(1);
  const [playerNames, setPlayerNames] = useState(['', '', '']);

  // UI State
  const [themesExpanded, setThemesExpanded] = useState(false);
  const [playersExpanded, setPlayersExpanded] = useState(false);
  const [monosExpanded, setMonosExpanded] = useState(false);
  const [namesExpanded, setNamesExpanded] = useState(false);
  const [turnOrderExpanded, setTurnOrderExpanded] = useState(true);
  const [allPlayersExpanded, setAllPlayersExpanded] = useState(false);
  const [rulesExpanded, setRulesExpanded] = useState(false);

  // Game Play State
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [gameData, setGameData] = useState(null);
  const [wordRevealed, setWordRevealed] = useState(false);

  const toggleTheme = useCallback((theme) => {
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

  const updatePlayerName = useCallback((index, name) => {
    setPlayerNames(prev => {
      const newNames = [...prev];
      newNames[index] = name;
      return newNames;
    });
  }, []);

  const getRandomName = useCallback(() => {
    const sustantivo = SUSTANTIVOS[Math.floor(Math.random() * SUSTANTIVOS.length)];
    const adjetivo = ADJETIVOS[Math.floor(Math.random() * ADJETIVOS.length)];
    return `${sustantivo} ${adjetivo}`;
  }, []);

  const generateRandomName = useCallback((index) => {
    const name = getRandomName();
    updatePlayerName(index, name);
  }, [updatePlayerName, getRandomName]);

  const addPlayer = useCallback(() => {
    const newNumPlayers = numPlayers + 1;
    setNumPlayers(newNumPlayers);
    setPlayerNames(prev => [...prev, '']);
    const maxMonos = Math.ceil(newNumPlayers / 2) - 1;
    if (numMonos > maxMonos) {
      setNumMonos(maxMonos);
    }
  }, [numPlayers, numMonos]);

  const removePlayer = useCallback(() => {
    if (numPlayers > 3) {
      const newNumPlayers = numPlayers - 1;
      setNumPlayers(newNumPlayers);
      setPlayerNames(prev => prev.slice(0, -1));
      const maxMonos = Math.ceil(newNumPlayers / 2) - 1;
      if (numMonos > maxMonos) {
        setNumMonos(maxMonos);
      }
    }
  }, [numPlayers, numMonos]);

  const addMono = useCallback(() => {
    const maxMonos = Math.ceil(numPlayers / 2) - 1;
    if (numMonos < maxMonos) {
      setNumMonos(numMonos + 1);
    }
  }, [numPlayers, numMonos]);

  const removeMono = useCallback(() => {
    if (numMonos > 1) {
      setNumMonos(numMonos - 1);
    }
  }, [numMonos]);

  const startGame = useCallback(() => {
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
  }, [selectedThemes, playerNames, numPlayers, numMonos, setScreen]);

  const showWord = useCallback(() => {
    setWordRevealed(true);
  }, []);

  const nextPlayer = useCallback(() => {
    if (currentPlayerIndex < numPlayers - 1) {
      setCurrentPlayerIndex(prev => prev + 1);
      setWordRevealed(false);
    } else {
      setScreen('playing');
    }
  }, [currentPlayerIndex, numPlayers, setScreen]);

  const resetGame = useCallback(() => {
    setScreen('setup');
    setCurrentPlayerIndex(0);
    setGameData(null);
    setWordRevealed(false);
    // Reset UI toggles
    setMonosExpanded(false);
    setNamesExpanded(false);
    setThemesExpanded(false);
    setPlayersExpanded(false);
    setTurnOrderExpanded(true);
    setAllPlayersExpanded(false);
    setRulesExpanded(false);
  }, [setScreen]);

  const isMono = gameData && gameData.monoIndices.includes(currentPlayerIndex);

  return {
    // State
    selectedThemes,
    numPlayers,
    numMonos,
    playerNames,
    currentPlayerIndex,
    gameData,
    wordRevealed,
    themesExpanded,
    playersExpanded,
    monosExpanded,
    namesExpanded,
    turnOrderExpanded,
    allPlayersExpanded,
    rulesExpanded,
    isMono,

    // Setters (for UI toggles mostly)
    setThemesExpanded,
    setPlayersExpanded,
    setMonosExpanded,
    setNamesExpanded,
    setTurnOrderExpanded,
    setAllPlayersExpanded,
    setRulesExpanded,

    // Actions
    toggleTheme,
    updatePlayerName,
    generateRandomName,
    addPlayer,
    removePlayer,
    addMono,
    removeMono,
    startGame,
    showWord,
    nextPlayer,
    resetGame,
    getRandomName
  };
};
