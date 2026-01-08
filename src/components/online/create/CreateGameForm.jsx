import { MessageSquare, Users } from '../../Icons';
import InputField from '../../shared/InputField';
import PlayerCounter from '../../shared/PlayerCounter';

const CreateGameForm = ({
  playerName,
  setPlayerName,
  newGameSettings,
  setNewGameSettings,
  onSubmit,
  getRandomName
}) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSubmit();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto space-y-6 pr-2">
      {/* Host Name */}
      <InputField
        label="Tu Nombre"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        placeholder="Tu nombre (Host)"
        autoFocus
        onKeyDown={handleKeyDown}
        className="p-4 rounded-2xl text-lg" // Custom large style
      />

      {/* Game Name */}
      <InputField
        label="Nombre de la Partida"
        value={newGameSettings.name}
        onChange={(e) => setNewGameSettings({ ...newGameSettings, name: e.target.value })}
        placeholder="Ej: Papus :v"
        onKeyDown={handleKeyDown}
        className="p-4 rounded-2xl text-lg" // Custom large style
      />

      {/* Players Count */}
      <div className="space-y-2">
        <div className="flex items-center justify-between ml-1">
          <label className="text-sm font-bold text-brand-wood uppercase tracking-wider">Cantidad de Jugadores</label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={newGameSettings.players === 2}
              onChange={(e) => setNewGameSettings(s => ({
                ...s,
                players: e.target.checked ? 2 : 3
              }))}
              className="w-4 h-4 accent-brand-bronze"
            />
            <span className="text-xs font-bold text-brand-wood/70">Ilimitados</span>
          </label>
        </div>
        <PlayerCounter
          count={newGameSettings.players === 2 ? '∞' : newGameSettings.players}
          onIncrement={() => setNewGameSettings(s => ({ ...s, players: s.players + 1 }))}
          onDecrement={() => setNewGameSettings(s => ({ ...s, players: Math.max(3, s.players - 1) }))}
          min={3}
          accordion={false}
        />
      </div>

      {/* Game Type */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-brand-wood uppercase tracking-wider ml-1">Tipo de Juego</label>

        <button
          onClick={() => setNewGameSettings({ ...newGameSettings, type: 'chat' })}
          className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${newGameSettings.type === 'chat'
            ? 'bg-brand-wood text-white border-brand-dark shadow-[4px_4px_0px_0px_#2C1810]'
            : 'bg-white text-brand-wood border-brand-wood/20 hover:border-brand-wood/50'
            }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${newGameSettings.type === 'chat' ? 'bg-white/20' : 'bg-brand-wood/10'}`}>
              <MessageSquare size={24} />
            </div>
            <span className="font-bold text-lg">Por Chat</span>
          </div>
          <p className={`text-sm leading-relaxed ${newGameSettings.type === 'chat' ? 'text-white/80' : 'text-brand-wood/60'}`}>
            Cada jugador da una pista por chat en orden. La votación es al final. Si descubren al Mono, este puede adivinar la palabra para ganar.
          </p>
        </button>

        <button
          onClick={() => setNewGameSettings({ ...newGameSettings, type: 'in_person' })}
          className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${newGameSettings.type === 'in_person'
            ? 'bg-brand-wood text-white border-brand-dark shadow-[4px_4px_0px_0px_#2C1810]'
            : 'bg-white text-brand-wood border-brand-wood/20 hover:border-brand-wood/50'
            }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${newGameSettings.type === 'in_person' ? 'bg-white/20' : 'bg-brand-wood/10'}`}>
              <Users size={24} />
            </div>
            <span className="font-bold text-lg">En Persona</span>
          </div>
          <p className={`text-sm leading-relaxed ${newGameSettings.type === 'in_person' ? 'text-white/80' : 'text-brand-wood/60'}`}>
            La app reparte roles y palabras. El resto del juego (pistas y votación) ocurre en persona hablando.
          </p>
        </button>
      </div>
    </div>
  );
};

export default CreateGameForm;
