import React, { useState, useEffect } from 'react';
import { ArrowLeft } from '../Icons';

const LanPlayingScreen = ({ roomData, playerName, playerId, submitHint, finishTurn, submitVote, leaveRoom, isHost, resetGame, submitMonoGuess }) => {
  const [hint, setHint] = useState('');
  const [selectedVotes, setSelectedVotes] = useState([]);
  const [monoGuess, setMonoGuess] = useState('');
  const [hasLocallySubmitted, setHasLocallySubmitted] = useState(false);

  const myPlayerIndex = roomData.players.findIndex(p => playerId ? p.id === playerId : p.name === playerName);
  const myVotes = roomData.gameData?.votes?.[playerId || roomData.players[myPlayerIndex]?.id];
  const hasVoted = !!myVotes || hasLocallySubmitted;

  const amIMono = roomData.gameData?.monoIndices?.includes(myPlayerIndex);
  const currentTurnPlayer = roomData.gameData?.playerOrder?.[roomData.gameData?.currentTurnIndex || 0];
  const isMyTurn = myPlayerIndex === currentTurnPlayer;
  const gamePhase = roomData.gameData?.state || 'playing';
  const gameType = roomData.settings.type;

  const handleSubmitHint = () => {
    if (hint.trim()) {
      submitHint(hint.trim());
      setHint('');
    }
  };

  const toggleVote = (playerIndex) => {
    if (playerIndex === myPlayerIndex) return;

    const maxVotes = roomData.settings.numMonos || 1;
    if (selectedVotes.includes(playerIndex)) {
      setSelectedVotes(selectedVotes.filter(v => v !== playerIndex));
    } else if (selectedVotes.length < maxVotes) {
      setSelectedVotes([...selectedVotes, playerIndex]);
    }
  };

  const handleSubmitVotes = () => {
    if (selectedVotes.length > 0) {
      submitVote(selectedVotes);
      setHasLocallySubmitted(true);
    }
  };

  const handleSubmitMonoGuess = () => {
    if (monoGuess.trim()) {
      submitMonoGuess(monoGuess.trim());
    }
  };

  const getPlayerHint = (playerIndex) => {
    if (gameType !== 'chat') return null;
    const targetId = roomData.players[playerIndex]?.id;
    const playerHintObj = roomData.gameData?.hints?.find(h => h.playerId ? h.playerId === targetId : h.player === roomData.players[playerIndex].name);
    return playerHintObj ? playerHintObj.text : null;
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        // en persona playing
        if (gamePhase === 'playing' && gameType === 'in_person' && isHost) {
          resetGame();
        }
        // votacion
        else if (gamePhase === 'voting') {
          if (!hasVoted && selectedVotes.length > 0) {
            handleSubmitVotes();
          }
        }
        // resultados
        else if (gamePhase === 'results' && isHost) {
          resetGame();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gamePhase, gameType, isHost, hasVoted, selectedVotes, resetGame, handleSubmitVotes]);

  return (
    <div className="p-6 relative z-10 h-full flex flex-col">
      <div className="relative mb-4 flex items-center justify-center">
        <button
          onClick={leaveRoom}
          className="absolute left-0 p-2 rounded-xl hover:bg-brand-wood/10 text-brand-wood transition-all active:scale-95"
          title="Salir"
        >
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-2xl font-bold text-brand-wood tracking-wider">
          {gamePhase === 'playing' ? 'JUGANDO' :
            gamePhase === 'voting' ? 'VOTACIÓN' :
              gamePhase === 'mono_guessing' ? 'ADIVINANZA' : 'RESULTADOS'}
        </h1>
      </div>

      <div className="mb-4 p-4 bg-white rounded-2xl border-2 border-brand-wood text-center">
        {amIMono ? (
          <div>
            <div className="text-6xl mb-2">🐒</div>
            <div className="text-2xl font-bold text-brand-wood">¡SOS EL MONO!</div>
          </div>
        ) : (
          <div>
            <div className="text-sm font-bold text-brand-wood/50 uppercase tracking-widest mb-2">Tu palabra</div>
            <div className="text-3xl font-bold text-brand-wood">{roomData.gameData?.word?.toUpperCase()}</div>
          </div>
        )}
      </div>

      {gamePhase === 'playing' && gameType === 'in_person' && (
        <div className="flex-1 flex flex-col">
          <div className="bg-white/50 p-4 rounded-2xl border-2 border-brand-wood/10 mb-4">
            <h3 className="text-sm font-bold text-brand-wood/60 uppercase tracking-widest mb-3 text-center">Orden de Turnos</h3>
            <div className="space-y-2">
              {roomData.gameData?.playerOrder?.map((playerIndex, turnIndex) => (
                <div
                  key={turnIndex}
                  className="flex items-center gap-3 bg-white p-3 rounded-xl border border-brand-wood/10"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-bronze text-white flex items-center justify-center font-bold flex-shrink-0">
                    {turnIndex + 1}
                  </div>
                  <span className="font-bold text-brand-wood flex-1">
                    {roomData.players[playerIndex]?.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {isHost ? (
            <button
              onClick={resetGame}
              className="w-full bg-brand-wood text-white py-5 rounded-2xl font-bold text-xl shadow-[4px_4px_0px_0px_#2C1810] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#2C1810] active:translate-y-1 active:shadow-[2px_2px_0px_0px_#2C1810] transition-all border-2 border-brand-dark"
            >
              TERMINAR
            </button>
          ) : (
            <div className="text-center text-brand-wood/60 font-bold py-5">
              Esperando al anfitrión para continuar...
            </div>
          )}
        </div>
      )}

      {gamePhase === 'playing' && gameType === 'chat' && (
        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-white/50 p-4 rounded-2xl border-2 border-brand-wood/10 mb-4 overflow-y-auto max-h-[300px]">
            <h3 className="text-sm font-bold text-brand-wood uppercase mb-3">Pistas</h3>
            <div className="space-y-2">
              {roomData.gameData?.hints?.map((h, i) => (
                <div key={i} className="bg-white p-3 rounded-xl border border-brand-wood/10">
                  <div className="text-xs font-bold text-brand-wood/60 mb-1">{h.player}</div>
                  <div className="font-bold text-brand-wood">{h.text}</div>
                </div>
              )) || (
                  <div className="text-center text-brand-wood/40 italic py-4">Esperando pistas...</div>
                )}
            </div>
          </div>

          {isMyTurn ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitHint()}
                placeholder="Escribe tu pista..."
                className="flex-1 p-4 border-2 border-brand-wood/20 rounded-xl focus:border-brand-bronze focus:outline-none bg-white text-brand-wood placeholder-brand-wood/40 font-bold"
              />
              <button
                onClick={handleSubmitHint}
                disabled={!hint.trim()}
                className="px-6 bg-brand-bronze text-white rounded-xl font-bold shadow-[2px_2px_0px_0px_#5D4037] hover:translate-y-[-1px] active:translate-y-0.5 transition-all border-2 border-brand-wood disabled:opacity-50"
              >
                Enviar
              </button>
            </div>
          ) : (
            <div className="bg-brand-wood/10 rounded-xl p-4 text-center font-bold text-brand-wood/60 animate-pulse">
              Esperando a {currentTurnPlayer !== undefined && roomData.players[currentTurnPlayer]?.name}...
            </div>
          )}
        </div>
      )}

      {gamePhase === 'voting' && (
        <div className="flex-1 flex flex-col">
          <h3 className="text-lg font-bold text-brand-wood mb-4 text-center">
            ¡VOTA {roomData.settings.numMonos > 1 ? 'A LOS MONOS' : 'AL MONO'}!
          </h3>
          <div className="flex-1 overflow-y-auto mb-4">
            <div className="grid grid-cols-1 gap-3">
              {roomData.players.map((player, i) => (
                <button
                  key={i}
                  onClick={() => !hasVoted && toggleVote(i)}
                  disabled={hasVoted || i === myPlayerIndex}
                  className={`p-4 rounded-xl border-2 font-bold transition-all text-left relative ${(hasVoted && myVotes ? myVotes.includes(i) : selectedVotes.includes(i))
                    ? 'bg-brand-bronze text-white border-brand-wood shadow-[2px_2px_0px_0px_rgba(93,64,55,1)]'
                    : (i === myPlayerIndex || hasVoted)
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white text-brand-wood border-brand-wood/20 hover:border-brand-wood/50'
                    }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{player.name} {i === myPlayerIndex && '(Tú)'}</span>
                    {gameType === 'chat' && (
                      <span className={`text-sm font-normal italic ${selectedVotes.includes(i) ? 'text-white/80' : 'text-brand-wood/60'}`}>
                        "{getPlayerHint(i) || '...'}"
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="text-center text-sm font-bold text-brand-wood/60 mb-3">
            {hasVoted ? (myVotes?.length || selectedVotes.length) : selectedVotes.length}/{roomData.settings.numMonos || 1} votos seleccionados
          </div>

          {!hasVoted ? (
            <button
              onClick={handleSubmitVotes}
              disabled={selectedVotes.length === 0}
              className="w-full bg-brand-wood text-white py-5 rounded-2xl font-bold text-xl shadow-[4px_4px_0px_0px_#2C1810] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#2C1810] active:translate-y-1 active:shadow-[2px_2px_0px_0px_#2C1810] transition-all border-2 border-brand-dark disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
            >
              CONFIRMAR VOTOS
            </button>
          ) : (
            <div className="bg-brand-wood/10 rounded-2xl py-5 px-4 text-center border-2 border-dashed border-brand-wood/20">
              <div className="text-brand-wood font-bold animate-pulse">
                Voto enviado. Esperando a los demás...
              </div>
            </div>
          )}
        </div>
      )}

      {gamePhase === 'mono_guessing' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <div className="bg-amber-100 border-2 border-amber-300 p-6 rounded-2xl mb-6 w-full">
            <h3 className="text-xl font-bold text-amber-800 mb-2">¡MONOS DESCUBIERTOS!</h3>
            <p className="text-amber-700">Han sido atrapados, pero tienen una última oportunidad de ganar adivinando la palabra.</p>
          </div>

          {amIMono ? (
            <div className="w-full">
              <p className="text-brand-wood font-bold mb-4">Adivina la palabra secreta para ganar:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={monoGuess}
                  onChange={(e) => setMonoGuess(e.target.value)}
                  placeholder="Palabra secreta..."
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmitMonoGuess()}
                  className="flex-1 p-4 border-2 border-brand-wood/20 rounded-xl focus:border-brand-bronze focus:outline-none bg-white text-brand-wood font-bold"
                />
                <button
                  onClick={handleSubmitMonoGuess}
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
      )}

      {gamePhase === 'results' && (
        <div className="flex-1 flex flex-col">
          <div className={`p-6 rounded-2xl border-2 mb-6 text-center ${roomData.gameData.winner === 'civilians'
            ? 'bg-green-100 border-green-500 text-green-800'
            : 'bg-red-100 border-red-500 text-red-800'
            }`}>
            <h2 className="text-3xl font-black uppercase mb-2">
              {roomData.gameData.winner === 'civilians' ? '¡CIVILES GANAN!' : '¡MONOS GANAN!'}
            </h2>
            <p className="font-bold opacity-80">
              {roomData.gameData.winner === 'civilians'
                ? 'Los monos fueron descubiertos y no adivinaron la palabra.'
                : 'Los monos pasaron desapercibidos o adivinaron la palabra.'}
            </p>
          </div>

          {roomData.gameData?.winnerNames && (
            <div className="text-center mb-6">
              <h3 className="text-sm font-bold text-brand-wood/60 uppercase tracking-widest mb-2">GANADORES</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {roomData.gameData.winnerNames.map((name, i) => (
                  <span key={i} className="px-3 py-1 bg-brand-bronze text-white rounded-lg font-bold shadow-sm border border-brand-wood">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            <div className="bg-white/50 p-4 rounded-2xl border-2 border-brand-wood/10 mb-4">
              <h3 className="text-sm font-bold text-brand-wood/60 uppercase tracking-widest mb-3 text-center">Identidades</h3>
              {roomData.players.map((p, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-brand-wood/5 last:border-0">
                  <span className="font-bold text-brand-wood">{p.name}</span>
                  <span className="text-sm px-2 py-1 rounded-lg bg-white border border-brand-wood/10">
                    {roomData.gameData?.monoIndices?.includes(i) ? '🐒 Mono' : '👤 Civil'}
                  </span>
                </div>
              ))}
            </div>

            {roomData.gameData?.monoGuessResult && (
              <div className="bg-white/50 p-4 rounded-2xl border-2 border-brand-wood/10 mb-4 text-center">
                <h3 className="text-sm font-bold text-brand-wood/60 uppercase tracking-widest mb-2">Intento de los Monos</h3>
                <div className="text-xl font-bold text-brand-wood">"{roomData.gameData.monoGuessResult.guess}"</div>
                <div className={`text-sm font-bold ${roomData.gameData.monoGuessResult.correct ? 'text-green-600' : 'text-red-600'}`}>
                  {roomData.gameData.monoGuessResult.correct ? '¡CORRECTO!' : '¡INCORRECTO!'}
                </div>
              </div>
            )}
          </div>

          {isHost ? (
            <button
              onClick={resetGame}
              className="w-full bg-brand-wood text-white py-5 rounded-2xl font-bold text-xl shadow-[4px_4px_0px_0px_#2C1810] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#2C1810] active:translate-y-1 active:shadow-[2px_2px_0px_0px_#2C1810] transition-all border-2 border-brand-dark"
            >
              VOLVER A JUGAR
            </button>
          ) : (
            <div className="text-center text-brand-wood/60 font-bold py-5">
              Esperando al anfitrión...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LanPlayingScreen;


