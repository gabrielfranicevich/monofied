import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from '../Icons';

const LanPlayingScreen = ({ roomData, playerName, playerId, submitHint, finishTurn, submitVote, leaveRoom, isHost, resetGame, submitMonoGuess }) => {
  const [hint, setHint] = useState('');
  const [selectedVotes, setSelectedVotes] = useState([]);
  const [monoGuess, setMonoGuess] = useState('');
  const [hasLocallySubmitted, setHasLocallySubmitted] = useState(false);
  const scrollRef = useRef(null);

  // ID-based logic (Requires server refactor to monoIds/playerOrderIds)
  // Fallback support if server sends indices (transitional, though we plan to update server next)
  // We assume server sends gameData with 'monoIds' and 'playerOrderIds'.

  const myPlayer = roomData.players.find(p => p.playerId === playerId) || {};
  const myId = myPlayer.playerId || playerId; // Use session ID

  const gameData = roomData.gameData || {};
  const amIMono = gameData.monoIds ? gameData.monoIds.includes(myId) : (gameData.monoIndices?.includes(roomData.players.findIndex(p => p.playerId === myId)));

  const currentTurnPlayerId = gameData.playerOrderIds ? gameData.playerOrderIds[gameData.currentTurnIndex || 0] : null;
  const isMyTurn = currentTurnPlayerId === myId;

  const gamePhase = gameData.state || 'playing';
  const gameType = roomData.settings.type;

  // My Votes from server
  const myServerVotes = gameData.votes?.[myId]; // Array of target IDs
  const hasVoted = !!myServerVotes || hasLocallySubmitted;

  // Auto-scroll hints
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [gameData.hints]);

  const handleSubmitHint = () => {
    if (hint.trim()) {
      submitHint(hint.trim());
      setHint('');
    }
  };

  const toggleVote = (targetPlayerId) => {
    if (targetPlayerId === myId) return;

    const maxVotes = roomData.settings.numMonos || 1;

    // Check if ID is in selectedVotes
    if (selectedVotes.includes(targetPlayerId)) {
      setSelectedVotes(selectedVotes.filter(id => id !== targetPlayerId));
    } else {
      if (selectedVotes.length < maxVotes) {
        setSelectedVotes([...selectedVotes, targetPlayerId]);
      } else {
        // Auto-replace: Remove first (oldest), add new
        const newVotes = [...selectedVotes.slice(1), targetPlayerId];
        setSelectedVotes(newVotes);
      }
    }
  };

  const handleSubmitVotes = () => {
    if (selectedVotes.length > 0) {
      submitVote(selectedVotes); // Sends IDs now
      setHasLocallySubmitted(true);
    }
  };

  const handleSubmitMonoGuess = () => {
    if (monoGuess.trim()) {
      submitMonoGuess(monoGuess.trim());
    }
  };

  const getPlayerHint = (targetId) => {
    if (gameType !== 'chat') return null;
    const playerHintObj = gameData.hints?.find(h => h.playerId === targetId);
    return playerHintObj ? playerHintObj.text : null;
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        if (gamePhase === 'playing' && gameType === 'in_person' && isHost) {
          resetGame();
        }
        else if (gamePhase === 'voting') {
          if (!hasVoted && selectedVotes.length > 0) {
            handleSubmitVotes();
          }
        }
        else if (gamePhase === 'results' && isHost) {
          resetGame();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gamePhase, gameType, isHost, hasVoted, selectedVotes, resetGame, handleSubmitVotes]);

  // Determine current turn player name safely
  const currentTurnPlayer = roomData.players.find(p => p.playerId === currentTurnPlayerId);

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

      <div className="mb-4 p-4 bg-white rounded-2xl border-2 border-brand-wood text-center shadow-sm relative overflow-hidden">
        {amIMono ? (
          <div>
            <div className="text-6xl mb-2 animate-bounce">🐒</div>
            <div className="text-2xl font-bold text-brand-wood">¡SOS EL MONO!</div>
            {(gamePhase === 'results') && (
              <div className="mt-2 text-brand-wood/60 font-bold">La palabra era: <span className="text-brand-wood uppercase">{gameData.word}</span></div>
            )}
          </div>
        ) : (
          <div>
            <div className="text-sm font-bold text-brand-wood/50 uppercase tracking-widest mb-2">Tu palabra</div>
            <div className="text-3xl font-bold text-brand-wood">{gameData.word?.toUpperCase()}</div>
          </div>
        )}
      </div>

      {/* Turn Notification */}
      {gamePhase === 'playing' && isMyTurn && (
        <div className="mb-4 bg-brand-mustard p-3 rounded-xl shadow-md border-2 border-brand-wood animate-pulse">
          <div className="text-white font-bold text-xl uppercase tracking-widest text-center">
            ¡ES TU TURNO!
          </div>
        </div>
      )}



      {/* Playing Phase: In Person */}
      {gamePhase === 'playing' && gameType === 'in_person' && (
        <div className="flex-1 flex flex-col">
          <div className="bg-white/50 p-4 rounded-2xl border-2 border-brand-wood/10 mb-4">
            {gameData.playerOrderIds?.map((pid, idx) => {
              const p = roomData.players.find(pl => pl.playerId === pid);
              if (!p) return null;
              return (
                <div key={pid} className={`flex items-center gap-3 p-3 rounded-xl mb-2 ${pid === currentTurnPlayerId ? 'bg-brand-mustard text-white shadow-md transform scale-105' : 'bg-white text-brand-wood/60'}`}>
                  <div className="font-bold">{idx + 1}.</div>
                  <div className="font-bold flex-1">{p.name}</div>
                </div>
              );
            })}
          </div>
          {isHost && (
            <button onClick={resetGame} className="w-full bg-brand-wood text-white py-4 rounded-xl font-bold">TERMINAR</button>
          )}
        </div>
      )}

      {/* Playing Phase: Chat */}
      {gamePhase === 'playing' && gameType === 'chat' && (
        <div className="flex-NONE">
          {isMyTurn ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitHint()}
                placeholder="Escribe tu pista..."
                autoFocus
                className="flex-1 p-4 border-2 border-brand-wood/20 rounded-xl focus:border-brand-bronze focus:outline-none bg-white text-brand-wood font-bold"
              />
              <button
                onClick={handleSubmitHint}
                disabled={!hint.trim()}
                className="px-6 bg-brand-bronze text-white rounded-xl font-bold shadow-[2px_2px_0px_0px_#5D4037] active:translate-y-0.5 active:shadow-none transition-all"
              >
                Enviar
              </button>
            </div>
          ) : (
            <div className="bg-brand-wood/10 rounded-xl p-4 text-center font-bold text-brand-wood/60 animate-pulse">
              Esperando a {currentTurnPlayer?.name || '...'}...
            </div>
          )}
        </div>
      )}

      {/* Voting Phase */}
      {gamePhase === 'voting' && (
        <div className="flex-1 flex flex-col">
          <h3 className="text-lg font-bold text-brand-wood mb-4 text-center">
            VOTA A LOS MONOS ({selectedVotes.length}/{roomData.settings.numMonos})
          </h3>
          <div className="flex-1 overflow-y-auto mb-4">
            <div className="grid grid-cols-1 gap-2">
              {roomData.players.map((player) => (
                <button
                  key={player.playerId}
                  onClick={() => !hasVoted && toggleVote(player.playerId)}
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
              onClick={handleSubmitVotes}
              disabled={selectedVotes.length === 0}
              className="w-full bg-brand-wood text-white py-4 rounded-xl font-bold shadow-[4px_4px_0px_0px_#2C1810] active:translate-y-1 active:shadow-none disabled:opacity-50"
            >
              VOTAR
            </button>
          ) : (
            <div className="text-center font-bold text-brand-wood/50">Voto enviado...</div>
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

      {/* Results Phase */}
      {gamePhase === 'results' && (
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
            <button onClick={resetGame} className="w-full mt-4 bg-brand-wood text-white py-4 rounded-xl font-bold">VOLVER AL LOBBY</button>
          )}
        </div>
      )}
    </div>
  );
};

export default LanPlayingScreen;
