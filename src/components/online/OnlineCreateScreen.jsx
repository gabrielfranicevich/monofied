import CreateGameHeader from './create/CreateGameHeader';
import CreateGameForm from './create/CreateGameForm';
import SlidingToggle from '../shared/SlidingToggle';

const OnlineCreateScreen = ({ setScreen, newGameSettings, setNewGameSettings,
  onlineGames, setOnlineGames, playerNames, createOnlineGame,
  playerName, setPlayerName, getRandomName }) => {
  const handleSubmit = () => {
    let finalName = playerName.trim();
    if (!finalName) {
      finalName = getRandomName();
      setPlayerName(finalName);
    }

    if (createOnlineGame) {
      createOnlineGame(finalName);
    } else {
      // Local fallback for testing/demo without socket
      const newGame = {
        id: Date.now(),
        name: newGameSettings.name || `Partida de ${playerNames[0] || 'Jugador'}`,
        players: 1,
        maxPlayers: newGameSettings.players,
        type: newGameSettings.type,
        status: 'waiting'
      };
      setOnlineGames([...onlineGames, newGame]);
      setScreen('online_lobby');
    }
  };

  return (
    <div className="p-6 relative z-10 h-full flex flex-col">
      <CreateGameHeader
        onBack={() => setScreen('online_lobby')}
        toggleSlot={
          <SlidingToggle
            value={newGameSettings.isPrivate || false}
            onChange={(val) => setNewGameSettings({ ...newGameSettings, isPrivate: val })}
            leftLabel="Pública"
            rightLabel="Privada"
            leftValue={false}
            rightValue={true}
          />
        }
      />

      <CreateGameForm
        playerName={playerName}
        setPlayerName={setPlayerName}
        newGameSettings={newGameSettings}
        setNewGameSettings={setNewGameSettings}
        onSubmit={handleSubmit}
        getRandomName={getRandomName}
      />

      <button
        onClick={handleSubmit}
        className="w-full bg-brand-bronze text-white py-5 rounded-2xl font-bold text-xl shadow-[4px_4px_0px_0px_#5D4037] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#5D4037] active:translate-y-1 active:shadow-[2px_2px_0px_0px_#5D4037] transition-all flex items-center justify-center gap-3 border-2 border-brand-wood mt-4"
      >
        CREAR AHORA
      </button>
    </div>
  );
};

export default OnlineCreateScreen;

