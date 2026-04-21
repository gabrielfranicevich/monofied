import { useState } from 'react';
import { Users, RotateCcw, ArrowLeft, Eye } from '../Icons';

const PlayingScreen = ({
  gameData, numMonos, resetGame, setScreen,
  turnOrderExpanded, setTurnOrderExpanded,
  allPlayersExpanded, setAllPlayersExpanded
}) => {
  const [showMonos, setShowMonos] = useState(false);
  const monoNames = gameData?.monoIndices?.map(index => gameData.players[index]) || [];

  return (
    <div className="p-6 relative z-10">
      <div className="relative mb-8 flex items-center justify-center">
        <button
          onClick={() => {
            setScreen('home');
            window.history.pushState(null, '', '/');
          }}
          className="absolute left-0 p-2 rounded-xl hover:bg-brand-wood/10 text-brand-wood transition-all active:scale-95"
          title="Volver al inicio"
        >
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-3xl font-bold text-brand-wood tracking-wider">¡A JUGAR!</h1>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-brand-mustard p-2 rounded-lg text-white">
            <Users size={20} />
          </div>
          <h2 className="text-lg font-bold text-brand-wood leading-tight uppercase tracking-wide">Orden de Turnos</h2>
        </div>

        <div className="p-4 bg-brand-pastel-corn/50 rounded-2xl border-2 border-brand-wood shadow-[4px_4px_0px_0px_rgba(93,64,55,0.1)]">
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
      </div>

      <div className="mb-6">
        {!showMonos ? (
          <button
            onClick={() => setShowMonos(true)}
            className="w-full bg-brand-burgundy/10 text-black py-4 rounded-2xl font-bold text-lg hover:bg-brand-burgundy hover:text-white border-2 border-brand-burgundy/20 hover:border-brand-burgundy transition-all flex items-center justify-center gap-3"
          >
            <Eye size={24} />
            Revelar Mono{numMonos > 1 ? 's' : ''}
          </button>
        ) : (
          <div className="p-5 bg-brand-burgundy text-black rounded-2xl border-2 border-brand-dark shadow-[4px_4px_0px_0px_#2C1810] text-center animate-pulse-once">
            <h3 className="font-bold text-black/80 text-sm uppercase tracking-wider mb-2">
              {numMonos > 1 ? 'Los Monos eran' : 'El Mono era'}
            </h3>
            <p className="text-2xl font-black">{new Intl.ListFormat('es', { style: 'long', type: 'conjunction' }).format(monoNames)}</p>
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
};

export default PlayingScreen;
