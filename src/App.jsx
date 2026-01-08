import React, { useState, useEffect } from 'react';
import './App.css';
import HomeScreen from './components/HomeScreen';
import SetupScreen from './components/SetupScreen';
import RevealScreen from './components/RevealScreen';
import PlayingScreen from './components/PlayingScreen';
import OnlineLobbyScreen from './components/online/OnlineLobbyScreen';
import OnlineCreateScreen from './components/online/OnlineCreateScreen';
import OnlineWaitingRoom from './components/online/OnlineWaitingRoom';
import OnlinePlayingScreen from './components/online/OnlinePlayingScreen';

import { useSessionId } from './hooks/useSessionId';
import { useLocalIp } from './hooks/useLocalIp';
import { useOfflineGame } from './hooks/useOfflineGame';
import { useOnlineGame } from './hooks/useOnlineGame';
import { useAppRouting } from './hooks/useAppRouting';

function App() {
  const [screen, setScreen] = useState('home');

  // Persist playerName
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem('playerName') || '';
  });

  useEffect(() => {
    if (playerName) {
      localStorage.setItem('playerName', playerName);
    }
  }, [playerName]);

  // Hooks
  const mySessionId = useSessionId();
  const localIp = useLocalIp();

  const offlineGame = useOfflineGame(setScreen);

  const onlineGame = useOnlineGame(setScreen, mySessionId, localIp, playerName);

  // Routing hook consumes state
  useAppRouting(screen, setScreen, onlineGame.roomId, onlineGame.setRoomId, onlineGame.roomData);


  const resetGame = () => {
    if (screen.startsWith('online_')) {
      if (onlineGame.isHost && onlineGame.socket) {
        onlineGame.resetOnlineGame();
      }
      return;
    }
    offlineGame.resetGame();
  };

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
            onlineGames={onlineGame.onlineGames}
            lanGames={onlineGame.lanGames}
            joinOnlineGame={onlineGame.joinOnlineGame}
            playerName={playerName}
            setPlayerName={setPlayerName}
            roomIdFromUrl={onlineGame.roomId}
            clearRoomId={() => onlineGame.setRoomId(null)}
            socket={onlineGame.socket}
            getRandomName={offlineGame.getRandomName}
            localIp={localIp}
          />
        )}

        {screen === 'online_create' && (
          <OnlineCreateScreen
            setScreen={setScreen}
            newGameSettings={onlineGame.newGameSettings}
            setNewGameSettings={onlineGame.setNewGameSettings}
            onlineGames={onlineGame.onlineGames}
            setOnlineGames={onlineGame.setOnlineGames}
            playerNames={offlineGame.playerNames}
            createOnlineGame={onlineGame.createOnlineGame}
            playerName={playerName}
            setPlayerName={setPlayerName}
            getRandomName={offlineGame.getRandomName}
          />
        )}

        {screen === 'online_waiting' && onlineGame.roomData && (
          <OnlineWaitingRoom
            roomData={onlineGame.roomData}
            isHost={onlineGame.isHost}
            leaveRoom={onlineGame.leaveRoom}
            startGame={onlineGame.startOnlineGame}
            updateRoomSettings={onlineGame.updateRoomSettings}
            contributeTheme={onlineGame.contributeTheme}
          />
        )}

        {screen === 'online_playing' && onlineGame.roomData && (
          <OnlinePlayingScreen
            roomData={onlineGame.roomData}
            playerName={playerName}
            playerId={mySessionId}
            submitHint={onlineGame.submitHint}
            finishTurn={onlineGame.finishTurn}
            submitVote={onlineGame.submitVote}
            leaveRoom={onlineGame.leaveRoom}
            isHost={onlineGame.isHost}
            resetGame={onlineGame.resetOnlineGame}
            submitMonoGuess={onlineGame.submitMonoGuess}
          />
        )}

        {screen === 'setup' && (
          <SetupScreen
            setScreen={setScreen}
            selectedThemes={offlineGame.selectedThemes}
            toggleTheme={offlineGame.toggleTheme}
            themesExpanded={offlineGame.themesExpanded}
            setThemesExpanded={offlineGame.setThemesExpanded}
            numPlayers={offlineGame.numPlayers}
            addPlayer={offlineGame.addPlayer}
            removePlayer={offlineGame.removePlayer}
            playersExpanded={offlineGame.playersExpanded}
            setPlayersExpanded={offlineGame.setPlayersExpanded}
            numMonos={offlineGame.numMonos}
            maxMonos={offlineGame.maxMonos}
            addMono={offlineGame.addMono}
            removeMono={offlineGame.removeMono}
            monosExpanded={offlineGame.monosExpanded}
            setMonosExpanded={offlineGame.setMonosExpanded}
            playerNames={offlineGame.playerNames}
            updatePlayerName={offlineGame.updatePlayerName}
            generateRandomName={offlineGame.generateRandomName}
            namesExpanded={offlineGame.namesExpanded}
            setNamesExpanded={offlineGame.setNamesExpanded}
            startGame={offlineGame.startGame}
            // New Custom List Props
            customLists={offlineGame.customLists}
            onSaveList={offlineGame.handleSaveList}
            onDeleteList={offlineGame.handleDeleteList}
            onEditList={offlineGame.handleEditList}
            onOpenCreateModal={offlineGame.handleOpenCreateModal}
            modalOpen={offlineGame.modalOpen}
            onCloseModal={offlineGame.handleCloseModal}
            editingList={offlineGame.editingList}
          />
        )}

        {screen === 'reveal' && offlineGame.gameData && (
          <RevealScreen
            gameData={offlineGame.gameData}
            currentPlayerIndex={offlineGame.currentPlayerIndex}
            numPlayers={offlineGame.numPlayers}
            wordRevealed={offlineGame.wordRevealed}
            showWord={offlineGame.showWord}
            isMono={offlineGame.isMono}
            nextPlayer={offlineGame.nextPlayer}
          />
        )}

        {screen === 'playing' && offlineGame.gameData && (
          <PlayingScreen
            gameData={offlineGame.gameData}
            numMonos={offlineGame.numMonos}
            resetGame={resetGame}
            turnOrderExpanded={offlineGame.turnOrderExpanded}
            setTurnOrderExpanded={offlineGame.setTurnOrderExpanded}
            allPlayersExpanded={offlineGame.allPlayersExpanded}
            setAllPlayersExpanded={offlineGame.setAllPlayersExpanded}
            rulesExpanded={offlineGame.rulesExpanded}
            setRulesExpanded={offlineGame.setRulesExpanded}
          />
        )}
      </div>
    </div>
  );
}

export default App;
