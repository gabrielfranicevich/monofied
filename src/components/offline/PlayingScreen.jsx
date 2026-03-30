import { Users, ChevronUp, ChevronDown, Edit2, RotateCcw } from '../Icons';

const PlayingScreen = ({
  gameData, numMonos, resetGame,
  turnOrderExpanded, setTurnOrderExpanded,
  allPlayersExpanded, setAllPlayersExpanded
}) => (
  <div className="p-6 relative z-10">
    <h1 className="text-3xl font-bold text-center mb-8 text-brand-wood tracking-wider">¡A JUGAR!</h1>

    <div className="mb-6">
      <button
        onClick={() => setTurnOrderExpanded(!turnOrderExpanded)}
        className="w-full flex items-center justify-between p-4 bg-white rounded-2xl hover:bg-brand-beige/20 transition-all border-2 border-brand-wood shadow-[4px_4px_0px_0px_rgba(93,64,55,1)] active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(93,64,55,1)]"
      >
        <div className="flex items-center gap-3">
          <div className="bg-brand-mustard p-2 rounded-lg text-white">
            <Users size={20} />
          </div>
          <h2 className="text-lg font-bold text-brand-wood leading-tight uppercase tracking-wide">Orden de Turnos</h2>
        </div>
        {turnOrderExpanded ? <ChevronUp size={24} className="text-brand-wood" /> : <ChevronDown size={24} className="text-brand-wood" />}
      </button>
      {turnOrderExpanded && (
        <div className="mt-4 p-4 bg-brand-pastel-corn/50 rounded-2xl border-2 border-brand-wood shadow-[4px_4px_0px_0px_rgba(93,64,55,0.1)]">
          <div className="space-y-3">
            {gameData.playerOrder.map((playerIndex, i) => (
              <div key={i} className="flex items-center gap-3 text-brand-wood bg-white/50 p-2 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-brand-mustard text-white flex items-center justify-center font-bold shadow-sm border border-brand-wood/20">
                  {i + 1}
                </div>
                <span className="font-bold text-lg">{gameData.players[playerIndex]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>

    <button
      onClick={resetGame}
      className="w-full bg-brand-wood text-white py-5 rounded-2xl font-bold text-xl shadow-[4px_4px_0px_0px_#2C1810] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#2C1810] active:translate-y-1 active:shadow-[2px_2px_0px_0px_#2C1810] transition-all flex items-center justify-center gap-3 border-2 border-brand-dark"
    >
      <RotateCcw size={24} />
      Jugar de Nuevo
    </button>
  </div>
);

export default PlayingScreen;
