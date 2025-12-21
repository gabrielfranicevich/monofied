import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, ChevronDown, ChevronUp, MessageSquare } from '../Icons';

const OnlineLobbyScreen = ({ setScreen, onlineGames = [], onlineGamesExpanded, setOnlineGamesExpanded, joinOnlineGame, playerName, setPlayerName, roomIdFromUrl, clearRoomId, socket, getRandomName }) => {
  const [roomStatus, setRoomStatus] = useState(null);
  const [checkingRoom, setCheckingRoom] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  const targetRoomId = roomIdFromUrl || selectedRoomId;

  // Check room status when targetRoomId changes
  useEffect(() => {
    if (targetRoomId && socket) {
      setCheckingRoom(true);
      socket.emit('checkRoom', { roomId: targetRoomId });

      const handleRoomStatus = (status) => {
        setRoomStatus(status);
        setCheckingRoom(false);
      };

      socket.on('roomStatus', handleRoomStatus);

      return () => {
        socket.off('roomStatus', handleRoomStatus);
      };
    } else {
      setRoomStatus(null);
    }
  }, [targetRoomId, socket]);

  const safeOnlineGames = Array.isArray(onlineGames) ? onlineGames : [];
  const showDirectJoin = !!roomIdFromUrl || !!selectedRoomId;

  return (
    <div className="p-6 relative z-10 h-full flex flex-col">
      <div className="relative mb-6 flex items-center justify-center">
        <button
          onClick={() => {
            if (showDirectJoin) {
              if (roomIdFromUrl && clearRoomId) {
                clearRoomId();
              } else {
                setSelectedRoomId(null);
              }
            } else {
              setScreen('home');
              window.history.pushState(null, '', '/');
            }
          }}
          className="absolute left-0 p-2 rounded-xl hover:bg-brand-wood/10 text-brand-wood transition-all active:scale-95"
          title="Volver al inicio"
        >
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-3xl font-bold text-brand-wood tracking-wider drop-shadow-sm">
          {showDirectJoin ? 'UNIRSE A PARTIDA' : 'PARTIDAS ONLINE'}
        </h1>
      </div>

      {showDirectJoin ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          {checkingRoom ? (
            <div className="text-center text-brand-wood font-bold">
              Verificando sala...
            </div>
          ) : roomStatus && !roomStatus.exists ? (
            <div className="bg-white p-6 rounded-3xl border-4 border-brand-wood shadow-[8px_8px_0px_0px_rgba(93,64,55,1)] w-full text-center">
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-2xl font-bold text-brand-wood mb-2">{roomStatus.error}</h2>
              <p className="text-brand-wood/60 mb-4">La sala "{targetRoomId}" no existe</p>
            </div>
          ) : roomStatus && roomStatus.full ? (
            <div className="bg-white p-6 rounded-3xl border-4 border-brand-wood shadow-[8px_8px_0px_0px_rgba(93,64,55,1)] w-full text-center">
              <div className="text-6xl mb-4">🚫</div>
              <h2 className="text-2xl font-bold text-brand-wood mb-2">{roomStatus.error}</h2>
              <p className="text-brand-wood/60 mb-4">No puedes unirte a esta sala</p>
            </div>
          ) : roomStatus && roomStatus.room ? (
            <div className="bg-white p-6 rounded-3xl border-4 border-brand-wood shadow-[8px_8px_0px_0px_rgba(93,64,55,1)] w-full text-center">
              <h2 className="text-2xl font-bold text-brand-wood mb-2">
                {roomStatus.room.roomName}
              </h2>
              <div className="flex justify-center gap-4 text-brand-wood/60 font-bold uppercase text-sm mb-6">
                <span className="flex items-center gap-1"><Users size={16} /> {roomStatus.room.players.length}/{roomStatus.room.settings.players}</span>
                <span className="flex items-center gap-1">
                  {roomStatus.room.settings.type === 'chat' ? <MessageSquare size={16} /> : <Users size={16} />}
                  {roomStatus.room.settings.type === 'chat' ? 'Chat' : 'Persona'}
                </span>
              </div>

              <div className="space-y-4 text-left">
                <label className="text-sm font-bold text-brand-wood uppercase tracking-wider ml-1">Tu Nombre</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Ingresa tu nombre"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      let finalName = playerName.trim();
                      if (!finalName) {
                        finalName = getRandomName();
                        setPlayerName(finalName);
                      }
                      joinOnlineGame(targetRoomId, finalName);
                    }
                  }}
                  className="w-full p-4 border-2 border-brand-wood/20 rounded-2xl focus:border-brand-bronze focus:outline-none bg-brand-beige/30 text-brand-wood font-bold text-lg text-center"
                />

                <button
                  onClick={() => {
                    let finalName = playerName.trim();
                    if (!finalName) {
                      finalName = getRandomName();
                      setPlayerName(finalName);
                    }
                    joinOnlineGame(targetRoomId, finalName);
                  }}
                  className="w-full bg-brand-mustard text-white py-4 rounded-xl font-bold text-xl shadow-[4px_4px_0px_0px_#5D4037] hover:translate-y-[-2px] active:translate-y-1 transition-all border-2 border-brand-wood"
                >
                  ENTRAR
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <>

          <div className="flex-1 mb-6">
            <div className="mt-4"></div>

            <div className="mt-6 mb-2">
              <button
                onClick={() => setOnlineGamesExpanded(!onlineGamesExpanded)}
                className="w-full flex items-center justify-between p-4 bg-white rounded-2xl hover:bg-brand-beige/20 transition-all border-2 border-brand-wood shadow-[4px_4px_0px_0px_rgba(93,64,55,1)] active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(93,64,55,1)]"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-brand-mustard p-2 rounded-lg text-white">
                    <Users size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-brand-wood leading-tight uppercase tracking-wide">Partidas Disponibles</h2>
                </div>
                {onlineGamesExpanded ? <ChevronUp size={24} className="text-brand-wood" /> : <ChevronDown size={24} className="text-brand-wood" />}
              </button>
            </div>

            {onlineGamesExpanded && (
              <div className="mt-4 p-4 bg-brand-wood/5 rounded-2xl border-2 border-brand-wood/10 border-dashed max-h-[400px] overflow-y-auto pr-2">
                <div className="space-y-3">
                  {safeOnlineGames.length === 0 ? (
                    <div className="text-center py-12 text-brand-wood/50 font-bold">
                      No hay partidas encontradas...
                    </div>
                  ) : (
                    safeOnlineGames.map(game => (
                      <button
                        key={game.id}
                        onClick={() => {
                          if (game.status === 'waiting') {
                            setSelectedRoomId(game.id);
                          }
                        }}
                        disabled={game.status !== 'waiting'}
                        className={`w-full text-left bg-white p-4 rounded-2xl border-2 border-brand-wood shadow-[4px_4px_0px_0px_rgba(93,64,55,0.1)] flex items-center justify-between group transition-all cursor-pointer ${game.status === 'waiting'
                          ? 'hover:border-brand-bronze hover:translate-x-1 focus:border-brand-bronze focus:translate-x-1 focus:outline-none'
                          : 'opacity-70 cursor-not-allowed'
                          }`}
                      >
                        <div>
                          <h3 className="font-bold text-lg text-brand-wood">{game.name}</h3>
                          <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-brand-wood/60 mt-1">
                            <span className="flex items-center gap-1">
                              <Users size={14} /> {game.players}/{game.maxPlayers}
                            </span>
                            <span className="flex items-center gap-1">
                              {game.type === 'chat' ? <MessageSquare size={14} /> : <Users size={14} />}
                              {game.type === 'chat' ? 'Por Chat' : 'En Persona'}
                            </span>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${game.status === 'waiting'
                          ? 'bg-brand-pastel-mint text-brand-wood'
                          : 'bg-brand-wood/10 text-brand-wood/50'
                          }`}>
                          {game.status === 'waiting' ? 'Unirse' : 'Jugando'}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setScreen('online_create')}
            className="w-full bg-brand-wood text-white py-5 rounded-2xl font-bold text-xl shadow-[4px_4px_0px_0px_#2C1810] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#2C1810] active:translate-y-1 active:shadow-[2px_2px_0px_0px_#2C1810] transition-all flex items-center justify-center gap-3 border-2 border-brand-dark"
          >
            <div className="bg-white/20 p-1 rounded-lg">
              <Users size={24} />
            </div>
            CREAR PARTIDA
          </button>
        </>
      )}
    </div>
  );
};

export default OnlineLobbyScreen;
