import { Eye } from '../Icons';

/** Returns { text, className } with a mid-dash and smaller font for very long words */
const formatWord = (word) => {
  if (!word) return { text: '', className: '' };
  const upper = word.toUpperCase();
  const len = upper.length;
  if (len > 16) {
    const mid = Math.ceil(len / 2);
    const hyphenated = upper.slice(0, mid) + '-\n' + upper.slice(mid);
    return { text: hyphenated, className: 'text-3xl leading-tight' };
  }
  if (len > 11) return { text: upper, className: 'text-4xl' };
  return { text: upper, className: 'text-5xl' };
};

const RevealScreen = ({ gameData, currentPlayerIndex, numPlayers, wordRevealed, showWord, isMono, nextPlayer }) => {
  const monoIndex = gameData?.monoIndices?.indexOf(currentPlayerIndex) ?? -1;
  const hint = monoIndex !== -1 ? gameData?.monoHints?.[monoIndex] : null;

  return (
    <div className="p-6 flex flex-col h-[600px] relative z-10">
    <div className="text-center mb-8">
      <div className="inline-block px-4 py-1 rounded-full bg-brand-wood/10 text-brand-wood font-bold text-xs uppercase tracking-widest mb-3">
        Jugador {currentPlayerIndex + 1} / {numPlayers}
      </div>
      <h2 className="text-3xl font-bold text-brand-wood">
        {gameData.players[currentPlayerIndex] || `Player ${currentPlayerIndex + 1}`}
      </h2>
    </div>

    {!wordRevealed ? (
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 bg-brand-bronze/20 rounded-full blur-3xl transform scale-150"></div>
          <Eye size={80} className="relative z-10 mx-auto text-brand-bronze drop-shadow-md" />
          <p className="mt-6 text-brand-wood/60 font-bold text-lg">¿Estás listo?</p>
        </div>
        <button
          onClick={showWord}
          className="w-full bg-brand-bronze text-white py-5 rounded-2xl font-bold text-xl shadow-[4px_4px_0px_0px_#5D4037] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#5D4037] active:translate-y-1 active:shadow-[2px_2px_0px_0px_#5D4037] transition-all border-2 border-brand-wood"
        >
          Mostrar Palabra
        </button>
      </div>
    ) : (
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          {isMono ? (
            <div className="text-center">
              <div className="text-9xl mb-6 filter drop-shadow-xl">🐒</div>
              <div className="text-3xl font-bold text-brand-wood mb-2">¡SOS EL MONO!</div>
              {(hint && gameData?.showMonoHints !== false) && (
                <div className="mt-8 p-4 bg-brand-wood/5 rounded-2xl border-2 border-brand-wood/10 border-dashed transform -rotate-1">
                  <div className="text-sm font-bold text-brand-wood/50 uppercase tracking-widest mb-1">Si no sabés qué decir, decí esto:</div>
                  <div className="text-2xl font-bold text-brand-bronze uppercase">{hint}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
            <div className="text-sm font-bold text-brand-wood/50 uppercase tracking-widest mb-4">La palabra es</div>
              <div className={`${formatWord(gameData.word).className} font-bold text-brand-wood mb-6 bg-brand-wood/5 p-6 rounded-3xl border-2 border-brand-wood/10 border-dashed whitespace-pre-line`}>
                {formatWord(gameData.word).text}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={nextPlayer}
          className="w-full bg-brand-wood text-white py-5 rounded-2xl font-bold text-xl shadow-[4px_4px_0px_0px_#2C1810] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#2C1810] active:translate-y-1 active:shadow-[2px_2px_0px_0px_#2C1810] transition-all border-2 border-brand-dark"
        >
          {currentPlayerIndex < numPlayers - 1 ? 'Siguiente Jugador' : 'Empezar Partida'}
        </button>
      </div>
    )}
  </div>
  );
};

export default RevealScreen;
