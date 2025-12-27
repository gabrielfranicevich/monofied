import React, { useEffect } from 'react';
import WaitingRoomHeader from './waiting/WaitingRoomHeader';
import RoomStats from './waiting/RoomStats';
import GameSettingsSection from './waiting/GameSettingsSection';
import WaitingPlayerList from './waiting/WaitingPlayerList';
import StartGameButton from './waiting/StartGameButton';

const OnlineWaitingRoom = ({ roomData, isHost, leaveRoom, startGame, updateRoomSettings }) => {
  const selectedThemes = roomData.settings.selectedThemes || ['básico'];
  const numMonos = roomData.settings.numMonos || 1;
  const currentPlayers = roomData.players.length;
  // Same logic as SetupScreen: Max monos is ceil(players / 2) - 1
  // e.g. 3 players -> 1 mono. 4 players -> 1 mono. 5 players -> 2 monos.
  const maxMonos = Math.max(1, Math.ceil(currentPlayers / 2) - 1);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && isHost && currentPlayers >= 3) {
        startGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHost, currentPlayers, startGame]);

  // Fix: Auto-adjust numMonos if maxMonos drops below current setting
  useEffect(() => {
    if (isHost && numMonos > maxMonos) {
      updateRoomSettings({ numMonos: maxMonos });
    }
  }, [isHost, numMonos, maxMonos, updateRoomSettings]);

  const toggleTheme = (theme) => {
    if (!isHost) return;

    if (selectedThemes.includes(theme)) {
      // Don't allow removing the last theme
      if (selectedThemes.length > 1) {
        const newThemes = selectedThemes.filter(t => t !== theme);
        updateRoomSettings({ selectedThemes: newThemes });
      }
    } else {
      const newThemes = [...selectedThemes, theme];
      updateRoomSettings({ selectedThemes: newThemes });
    }
  };

  const addMono = () => {
    if (!isHost) return;
    if (numMonos < maxMonos) {
      updateRoomSettings({ numMonos: numMonos + 1 });
    }
  };

  const removeMono = () => {
    if (!isHost) return;
    if (numMonos > 1) {
      updateRoomSettings({ numMonos: numMonos - 1 });
    }
  };

  return (
    <div className="p-6 relative z-10 h-full flex flex-col">
      <WaitingRoomHeader
        roomName={roomData.roomName}
        roomId={roomData.id}
        onLeave={leaveRoom}
      />

      <RoomStats
        currentPlayers={currentPlayers}
        maxPlayers={roomData.settings.players}
        gameType={roomData.settings.type}
      />

      <GameSettingsSection
        isHost={isHost}
        selectedThemes={selectedThemes}
        onToggleTheme={toggleTheme}
        numMonos={numMonos}
        maxMonos={maxMonos}
        onAddMono={addMono}
        onRemoveMono={removeMono}
      />

      <WaitingPlayerList
        players={roomData.players}
        hostId={roomData.hostId}
      />

      <StartGameButton
        isHost={isHost}
        onStart={startGame}
        playerCount={currentPlayers}
      />
    </div>
  );
};

export default OnlineWaitingRoom;

