const WaitingPlayerList = ({ players, hostId }) => (
  <div className="flex-1 overflow-y-auto mb-6">
    <h3 className="text-sm font-bold text-brand-wood uppercase tracking-wider mb-3 ml-1">Jugadores</h3>
    <div className="space-y-2">
      {players.map((p, i) => (
        <div key={p.id} className="bg-white p-3 rounded-xl border-2 border-brand-wood/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-bronze text-white flex items-center justify-center font-bold">
            {i + 1}
          </div>
          <span className="font-bold text-brand-wood flex-1">{p.name}</span>
          {p.id === hostId && (
            <span className="text-xs font-bold bg-brand-mustard text-white px-2 py-1 rounded-md uppercase">Host</span>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default WaitingPlayerList;
