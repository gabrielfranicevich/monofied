import { MessageSquare, Users } from '../../Icons';

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
      <div className="space-y-2">
        <label className="text-sm font-bold text-brand-wood uppercase tracking-wider ml-1">Tu Nombre</label>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Tu nombre (Host)"
          autoFocus
          onKeyDown={handleKeyDown}
          className="w-full p-4 border-2 border-brand-wood/20 rounded-2xl focus:border-brand-bronze focus:outline-none bg-white text-brand-wood placeholder-brand-wood/40 font-bold text-lg"
        />
      </div>

      {/* Game Name */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-brand-wood uppercase tracking-wider ml-1">Nombre de la Partida</label>
        <input
          type="text"
          value={newGameSettings.name}
          onChange={(e) => setNewGameSettings({ ...newGameSettings, name: e.target.value })}
          placeholder="Ej: Papus :v"
          onKeyDown={handleKeyDown}
          className="w-full p-4 border-2 border-brand-wood/20 rounded-2xl focus:border-brand-bronze focus:outline-none bg-white text-brand-wood placeholder-brand-wood/40 font-bold text-lg"
        />
      </div>

      {/* Players Count */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-brand-wood uppercase tracking-wider ml-1">Cantidad de Jugadores</label>
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border-2 border-brand-wood/20">
          <button
            onClick={() => setNewGameSettings(s => ({ ...s, players: Math.max(3, s.players - 1) }))}
            className="w-12 h-12 rounded-xl bg-brand-pastel-peach border-2 border-brand-wood text-brand-wood font-bold text-2xl hover:brightness-95 transition-all flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(93,64,55,1)] active:translate-y-0.5 active:shadow-none"
            disabled={newGameSettings.players <= 3}
          >
            -
          </button>
          <div className="flex-1 text-center">
            <div className="text-3xl font-bold text-brand-wood">{newGameSettings.players}</div>
          </div>
          <button
            onClick={() => setNewGameSettings(s => ({ ...s, players: Math.min(20, s.players + 1) }))}
            className="w-12 h-12 rounded-xl bg-brand-pastel-mint border-2 border-brand-wood text-brand-wood font-bold text-2xl hover:brightness-95 transition-all flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(93,64,55,1)] active:translate-y-0.5 active:shadow-none"
            disabled={newGameSettings.players >= 20}
          >
            +
          </button>
        </div>
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
