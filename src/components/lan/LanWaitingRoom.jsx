import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, MessageSquare, Play, ChevronDown, ChevronUp, Edit2, Eye } from '../Icons';
import { THEMES } from '../../data/constants';

const LanWaitingRoom = ({ roomData, isHost, leaveRoom, startGame, updateRoomSettings }) => {
  const [themesExpanded, setThemesExpanded] = useState(false);
  const [monosExpanded, setMonosExpanded] = useState(false);

  const selectedThemes = roomData.settings.selectedThemes || ['básico'];
  const numMonos = roomData.settings.numMonos || 1;
  const currentPlayers = roomData.players.length;
  // Same logic as SetupScreen: Max monos is ceil(players / 2) - 1
  // e.g. 3 players -> 1 mono. 4 players -> 1 mono. 5 players -> 2 monos.
  const maxMonos = Math.max(1, Math.ceil(currentPlayers / 2) - 1);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && isHost && currentPlayers >= 3) {
        startGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHost, currentPlayers, startGame]);

  // Fix: Auto-adjust numMonos if maxMonos drops below current setting
  useEffect(() => {
    if (isHost && numMonos > maxMonos) {
      updateRoomSettings({ numMonos: maxMonos });
    }
  }, [isHost, numMonos, maxMonos, updateRoomSettings]);

  const toggleTheme = (theme) => {
    if (!isHost) return;

    if (selectedThemes.includes(theme)) {
      // Don't allow removing the last theme
      if (selectedThemes.length > 1) {
        const newThemes = selectedThemes.filter(t => t !== theme);
        updateRoomSettings({ selectedThemes: newThemes });
      }
    } else {
      const newThemes = [...selectedThemes, theme];
      updateRoomSettings({ selectedThemes: newThemes });
    }
  };

  const addMono = () => {
    if (!isHost) return;
    if (numMonos < maxMonos) {
      updateRoomSettings({ numMonos: numMonos + 1 });
    }
  };

  const removeMono = () => {
    if (!isHost) return;
    if (numMonos > 1) {
      updateRoomSettings({ numMonos: numMonos - 1 });
    }
  };

  return (
    <div className="p-6 relative z-10 h-full flex flex-col">
      <div className="relative mb-6 flex items-center justify-center">
        <button
          onClick={leaveRoom}
          className="absolute left-0 p-2 rounded-xl hover:bg-brand-wood/10 text-brand-wood transition-all active:scale-95"
          title="Salir"
        >
          <ArrowLeft size={28} />
        </button>
        <div className="text-center">
          <h1 className="text-xl font-bold text-brand-wood/60 uppercase tracking-widest">SALA</h1>
          <h2 className="text-4xl font-bold text-brand-wood tracking-wider">{roomData.roomName}</h2>
        </div>
      </div>

      <div className="bg-white/50 p-4 rounded-2xl border-2 border-brand-wood/10 mb-6 text-center">
        <div className="flex items-center justify-center gap-4 text-brand-wood font-bold">
          <div className="flex items-center gap-2">
            <Users size={20} />
            <span>{roomData.players.length}/{roomData.settings.players}</span>
          </div>
          <div className="w-px h-6 bg-brand-wood/20"></div>
          <div className="flex items-center gap-2">
            {roomData.settings.type === 'chat' ? <MessageSquare size={20} /> : <Users size={20} />}
            <span className="uppercase text-sm">{roomData.settings.type === 'chat' ? 'Chat' : 'En Persona'}</span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="space-y-4">
          <div>
            <button
              onClick={() => setThemesExpanded(!themesExpanded)}
              className="w-full flex items-center justify-between p-4 bg-white rounded-2xl hover:bg-brand-beige/20 transition-all border-2 border-brand-wood shadow-[4px_4px_0px_0px_rgba(93,64,55,1)] active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(93,64,55,1)]"
            >
              <div className="flex items-center gap-3">
                <div className="bg-brand-mustard p-2 rounded-lg text-white">
                  <Edit2 size={20} />
                </div>
                <div className="text-left">
                  <h2 className="text-lg font-bold text-brand-wood leading-tight">Temas</h2>
                  <span className="text-xs text-brand-wood/70 font-bold uppercase tracking-wide">{selectedThemes.length} seleccionados</span>
                </div>
              </div>
              {themesExpanded ? <ChevronUp size={24} className="text-brand-wood" /> : <ChevronDown size={24} className="text-brand-wood" />}
            </button>
            {themesExpanded && (
              <div className="mt-4 p-4 bg-brand-wood/5 rounded-2xl border-2 border-brand-wood/10 border-dashed">
                <div className="grid grid-cols-2 gap-3">
                  {Object.keys(THEMES).map(theme => (
                    <button
                      key={theme}
                      onClick={() => toggleTheme(theme)}
                      disabled={!isHost}
                      className={`p-3 rounded-xl font-bold capitalize transition-all border-2 ${selectedThemes.includes(theme)
                        ? 'bg-brand-bronze text-white border-brand-wood shadow-[2px_2px_0px_0px_rgba(93,64,55,1)]'
                        : 'bg-white text-brand-wood border-brand-wood/20 hover:border-brand-wood/50'
                        } ${!isHost ? 'cursor-not-allowed opacity-70' : ''}`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
                {!isHost && (
                  <div className="text-center text-xs text-brand-wood/60 font-bold mt-3 italic">
                    Solo el anfitrión puede cambiar los temas
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <button
              onClick={() => setMonosExpanded(!monosExpanded)}
              className="w-full flex items-center justify-between p-4 bg-white rounded-2xl hover:bg-brand-beige/20 transition-all border-2 border-brand-wood shadow-[4px_4px_0px_0px_rgba(93,64,55,1)] active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(93,64,55,1)]"
            >
              <div className="flex items-center gap-3">
                <div className="bg-brand-pastel-peach p-2 rounded-lg text-brand-wood">
                  <Eye size={20} />
                </div>
                <div className="text-left">
                  <h2 className="text-lg font-bold text-brand-wood leading-tight">Monos</h2>
                  <span className="text-xs text-brand-wood/70 font-bold uppercase tracking-wide">{numMonos} mono{numMonos > 1 ? 's' : ''}</span>
                </div>
              </div>
              {monosExpanded ? <ChevronUp size={24} className="text-brand-wood" /> : <ChevronDown size={24} className="text-brand-wood" />}
            </button>
            {monosExpanded && (
              <div className="mt-4 p-4 bg-brand-wood/5 rounded-2xl border-2 border-brand-wood/10 border-dashed">
                <div className="flex items-center gap-4">
                  <button
                    onClick={removeMono}
                    disabled={!isHost || numMonos <= 1}
                    className="w-12 h-12 rounded-xl bg-brand-pastel-peach border-2 border-brand-wood text-brand-wood font-bold text-2xl hover:brightness-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[2px_2px_0px_0px_rgba(93,64,55,1)] active:translate-y-0.5 active:shadow-none flex items-center justify-center"
                  >
                    -
                  </button>
                  <div className="flex-1 text-center">
                    <div className="text-5xl font-bold text-brand-wood">{numMonos}</div>
                    <div className="text-xs font-bold uppercase text-brand-wood/50 tracking-widest mt-1">MONO{numMonos > 1 ? 'S' : ''}</div>
                    <div className="text-xs font-bold uppercase text-brand-wood/50 tracking-widest mt-1">MAX: {maxMonos}</div>
                  </div>
                  <button
                    onClick={addMono}
                    disabled={!isHost || numMonos >= maxMonos}
                    className="w-12 h-12 rounded-xl bg-brand-pastel-mint border-2 border-brand-wood text-brand-wood font-bold text-2xl hover:brightness-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[2px_2px_0px_0px_rgba(93,64,55,1)] active:translate-y-0.5 active:shadow-none flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
                {!isHost && (
                  <div className="text-center text-xs text-brand-wood/60 font-bold mt-3 italic">
                    Solo el anfitrión puede cambiar los monos
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mb-6">
        <h3 className="text-sm font-bold text-brand-wood uppercase tracking-wider mb-3 ml-1">Jugadores</h3>
        <div className="space-y-2">
          {roomData.players.map((p, i) => (
            <div key={p.id} className="bg-white p-3 rounded-xl border-2 border-brand-wood/10 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-bronze text-white flex items-center justify-center font-bold">
                {i + 1}
              </div>
              <span className="font-bold text-brand-wood flex-1">{p.name}</span>
              {p.id === roomData.hostId && (
                <span className="text-xs font-bold bg-brand-mustard text-white px-2 py-1 rounded-md uppercase">Host</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {isHost ? (
        <button
          onClick={startGame}
          disabled={roomData.players.length < 3}
          className="w-full bg-brand-wood text-white py-5 rounded-2xl font-bold text-xl shadow-[4px_4px_0px_0px_#2C1810] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#2C1810] active:translate-y-1 active:shadow-[2px_2px_0px_0px_#2C1810] transition-all flex items-center justify-center gap-3 border-2 border-brand-dark disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
        >
          <Play size={24} />
          EMPEZAR PARTIDA
        </button>
      ) : (
        <div className="text-center text-brand-wood/60 font-bold animate-pulse py-5">
          Esperando al anfitrión...
        </div>
      )}
    </div>
  );
};

export default LanWaitingRoom;
