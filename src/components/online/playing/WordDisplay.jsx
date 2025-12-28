const WordDisplay = ({ amIMono, word, gamePhase }) => {
  return (
    <div className="mb-4 p-4 bg-white rounded-2xl border-2 border-brand-wood text-center shadow-sm relative overflow-hidden">
      {amIMono ? (
        <div>
          <div className="text-6xl mb-2 animate-bounce">🐒</div>
          <div className="text-2xl font-bold text-brand-wood">¡SOS EL MONO!</div>
          {(gamePhase === 'results') && (
            <div className="mt-2 text-brand-wood/60 font-bold">La palabra era: <span className="text-brand-wood uppercase">{word}</span></div>
          )}
        </div>
      ) : (
        <div>
          <div className="text-sm font-bold text-brand-wood/50 uppercase tracking-widest mb-2">Tu palabra</div>
          <div className="text-3xl font-bold text-brand-wood">{word?.toUpperCase()}</div>
        </div>
      )}
    </div>
  );
};

export default WordDisplay;
