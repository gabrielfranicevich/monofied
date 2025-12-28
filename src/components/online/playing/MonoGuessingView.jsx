const MonoGuessingView = ({
  amIMono,
  gameData,
  roomData,
  currentTurnPlayerId,
  monoGuess,
  setMonoGuess,
  onSubmitMonoGuess
}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
      <div className="bg-amber-100 border-2 border-amber-300 p-6 rounded-2xl mb-6 w-full">
        <h3 className="text-xl font-bold text-amber-800 mb-2">¡MONOS DESCUBIERTOS!</h3>
        <p className="text-amber-700">Han sido atrapados, pero tienen una última oportunidad de ganar adivinando la palabra.</p>
      </div>

      {amIMono ? (
        <div className="w-full">
          <p className="text-brand-wood font-bold mb-4">Adivina la palabra secreta para ganar:</p>
          {gameData.hints?.map((hint, idx) => {
            const player = roomData.players.find(pl => pl.playerId === hint.playerId);
            if (!player || player.playerId === currentTurnPlayerId) return null;

            return (
              <p key={idx} className="mb-2 text-brand-wood">
                <span className="font-bold">{player.name}: </span>
                <span className="opacity-60">{hint.text}</span>
              </p>
            );
          })}
          <div className="flex gap-2">
            <input
              type="text"
              value={monoGuess}
              onChange={(e) => setMonoGuess(e.target.value)}
              placeholder="Palabra secreta..."
              onKeyDown={(e) => e.key === 'Enter' && onSubmitMonoGuess()}
              className="flex-1 p-4 border-2 border-brand-wood/20 rounded-xl focus:border-brand-bronze focus:outline-none bg-white text-brand-wood font-bold"
            />
            <button
              onClick={onSubmitMonoGuess}
              disabled={!monoGuess.trim()}
              className="px-6 bg-brand-bronze text-white rounded-xl font-bold border-2 border-brand-wood shadow-[2px_2px_0px_0px_#5D4037] active:translate-y-0.5 active:shadow-none transition-all"
            >
              !
            </button>
          </div>
        </div>
      ) : (
        <div className="animate-pulse font-bold text-brand-wood/60">
          Esperando que los monos intenten adivinar...
        </div>
      )}
    </div>
  );
};

export default MonoGuessingView;
