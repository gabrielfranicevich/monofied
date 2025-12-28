const ResultsView = ({ gameData, roomData, isHost, onReset }) => {
  return (
    <div className="flex-1 flex flex-col p-4">
      <div className={`p-6 rounded-2xl mb-4 text-center border-4 ${gameData.winner === 'civilians' ? 'bg-green-100 border-green-500 text-green-800' : 'bg-red-100 border-red-500 text-red-800'}`}>
        <h2 className="text-3xl font-black uppercase">{gameData.winner === 'civilians' ? '¡CIVILES!' : '¡MONOS!'}</h2>
      </div>
      <div className="bg-white/50 p-4 rounded-xl">
        {roomData.players.map(p => (
          <div key={p.playerId} className="flex justify-between py-2 border-b border-brand-wood/5">
            <span className="font-bold text-brand-wood">{p.name}</span>
            <span className="text-xs font-bold px-2 py-1 rounded bg-white">
              {gameData.monoIds?.includes(p.playerId) ? '🐒 Mono' : '👤 Civil'}
            </span>
          </div>
        ))}
      </div>
      {isHost && (
        <button onClick={onReset} className="w-full mt-4 bg-brand-wood text-white py-4 rounded-xl font-bold">VOLVER AL LOBBY</button>
      )}
    </div>
  );
};

export default ResultsView;
