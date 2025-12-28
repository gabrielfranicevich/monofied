const VotingView = ({
  roomData,
  gameType,
  myId,
  selectedVotes,
  hasVoted,
  myServerVotes,
  onToggleVote,
  onSubmitVotes,
  getPlayerHint
}) => {
  return (
    <div className="flex-1 flex flex-col">
      <h3 className="text-lg font-bold text-brand-wood mb-4 text-center">
        VOTA A LOS MONOS ({selectedVotes.length}/{roomData.settings.numMonos})
      </h3>
      <div className="flex-1 overflow-y-auto mb-4">
        <div className="grid grid-cols-1 gap-2">
          {roomData.players.map((player) => (
            <button
              key={player.playerId}
              onClick={() => !hasVoted && onToggleVote(player.playerId)}
              disabled={hasVoted || player.playerId === myId}
              className={`p-4 rounded-xl border-2 font-bold transition-all text-left relative ${(hasVoted ? (myServerVotes?.includes(player.playerId)) : selectedVotes.includes(player.playerId))
                ? 'bg-brand-bronze text-white border-brand-wood shadow-md'
                : (player.playerId === myId || hasVoted)
                  ? 'bg-gray-50 text-gray-400 border-gray-100'
                  : 'bg-white text-brand-wood border-brand-wood/20 hover:border-brand-wood/50'
                }`}
            >
              <div className="flex justify-between items-center w-full">
                <span>{player.name} {player.playerId === myId && '(Tú)'}</span>
                {gameType === 'chat' && (
                  <span className={`text-sm font-normal italic ${selectedVotes.includes(player.playerId) ? 'text-white/80' : 'text-brand-wood/60'}`}>
                    "{getPlayerHint(player.playerId) || '...'}"
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
      {!hasVoted ? (
        <button
          onClick={onSubmitVotes}
          disabled={selectedVotes.length === 0}
          className="w-full bg-brand-wood text-white py-4 rounded-xl font-bold shadow-[4px_4px_0px_0px_#2C1810] active:translate-y-1 active:shadow-none disabled:opacity-50"
        >
          VOTAR
        </button>
      ) : (
        <div className="text-center font-bold text-brand-wood/50">Voto enviado...</div>
      )}
    </div>
  );
};

export default VotingView;
