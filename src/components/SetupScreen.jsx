import React, { memo } from 'react';
import { ArrowLeft, Edit2, ChevronUp, ChevronDown, Users, Eye, Play } from './Icons';
import { THEMES } from '../data/constants';

const ThemeSelector = memo(({ selectedThemes, toggleTheme, expanded, setExpanded }) => (
  <div className="mb-6">
    <button
      onClick={() => setExpanded(!expanded)}
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
      {expanded ? <ChevronUp size={24} className="text-brand-wood" /> : <ChevronDown size={24} className="text-brand-wood" />}
    </button>
    {expanded && (
      <div className="mt-4 p-4 bg-brand-wood/5 rounded-2xl border-2 border-brand-wood/10 border-dashed">
        <div className="grid grid-cols-2 gap-3">
          {Object.keys(THEMES).map(theme => (
            <button
              key={theme}
              onClick={() => toggleTheme(theme)}
              className={`p-3 rounded-xl font-bold capitalize transition-all border-2 ${selectedThemes.includes(theme)
                ? 'bg-brand-bronze text-white border-brand-wood shadow-[2px_2px_0px_0px_rgba(93,64,55,1)]'
                : 'bg-white text-brand-wood border-brand-wood/20 hover:border-brand-wood/50'
                }`}
            >
              {theme}
            </button>
          ))}
        </div>
      </div>
    )}
  </div>
));

const PlayerCounter = memo(({ numPlayers, addPlayer, removePlayer, expanded, setExpanded, maxMonos }) => (
  <div className="mb-6">
    <button
      onClick={() => setExpanded(!expanded)}
      className="w-full flex items-center justify-between p-4 bg-white rounded-2xl hover:bg-brand-beige/20 transition-all border-2 border-brand-wood shadow-[4px_4px_0px_0px_rgba(93,64,55,1)] active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(93,64,55,1)]"
    >
      <div className="flex items-center gap-3">
        <div className="bg-brand-pastel-mint p-2 rounded-lg text-brand-wood">
          <Users size={20} />
        </div>
        <div className="text-left">
          <h2 className="text-lg font-bold text-brand-wood leading-tight">Jugadores</h2>
          <span className="text-xs text-brand-wood/70 font-bold uppercase tracking-wide">{numPlayers} personas</span>
        </div>
      </div>
      {expanded ? <ChevronUp size={24} className="text-brand-wood" /> : <ChevronDown size={24} className="text-brand-wood" />}
    </button>
    {expanded && (
      <div className="mt-4 p-4 bg-brand-wood/5 rounded-2xl border-2 border-brand-wood/10 border-dashed">
        <div className="flex items-center gap-4">
          <button
            onClick={removePlayer}
            className="w-12 h-12 rounded-xl bg-brand-pastel-peach border-2 border-brand-wood text-brand-wood font-bold text-2xl hover:brightness-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[2px_2px_0px_0px_rgba(93,64,55,1)] active:translate-y-0.5 active:shadow-none flex items-center justify-center"
            disabled={numPlayers <= 3}
          >
            -
          </button>
          <div className="flex-1 text-center">
            <div className="text-5xl font-bold text-brand-wood">{numPlayers}</div>
            <div className="text-xs font-bold uppercase text-brand-wood/50 tracking-widest mt-1">MAX MONOS: {maxMonos}</div>
          </div>
          <button
            onClick={addPlayer}
            className="w-12 h-12 rounded-xl bg-brand-pastel-mint border-2 border-brand-wood text-brand-wood font-bold text-2xl hover:brightness-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[2px_2px_0px_0px_rgba(93,64,55,1)] active:translate-y-0.5 active:shadow-none flex items-center justify-center"
            disabled={numPlayers >= 1000}
          >
            +
          </button>
        </div>
      </div>
    )}
  </div>
));

const MonoCounter = memo(({ numMonos, addMono, removeMono, maxMonos, expanded, setExpanded }) => (
  <div className="mb-6">
    <button
      onClick={() => setExpanded(!expanded)}
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
      {expanded ? <ChevronUp size={24} className="text-brand-wood" /> : <ChevronDown size={24} className="text-brand-wood" />}
    </button>
    {expanded && (
      <div className="mt-4 p-4 bg-brand-wood/5 rounded-2xl border-2 border-brand-wood/10 border-dashed">
        <div className="flex items-center gap-4">
          <button
            onClick={removeMono}
            className="w-12 h-12 rounded-xl bg-brand-pastel-peach border-2 border-brand-wood text-brand-wood font-bold text-2xl hover:brightness-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[2px_2px_0px_0px_rgba(93,64,55,1)] active:translate-y-0.5 active:shadow-none flex items-center justify-center"
            disabled={numMonos <= 1}
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
            className="w-12 h-12 rounded-xl bg-brand-pastel-mint border-2 border-brand-wood text-brand-wood font-bold text-2xl hover:brightness-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[2px_2px_0px_0px_rgba(93,64,55,1)] active:translate-y-0.5 active:shadow-none flex items-center justify-center"
            disabled={numMonos >= maxMonos}
          >
            +
          </button>
        </div>
      </div>
    )}
  </div>
));

const NameEditor = memo(({ playerNames, numPlayers, updatePlayerName, generateRandomName, expanded, setExpanded }) => (
  <div className="mb-8">
    <button
      onClick={() => setExpanded(!expanded)}
      className="w-full flex items-center justify-between p-4 bg-white rounded-2xl hover:bg-brand-beige/20 transition-all border-2 border-brand-wood shadow-[4px_4px_0px_0px_rgba(93,64,55,1)] active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(93,64,55,1)]"
    >
      <div className="flex items-center gap-3">
        <div className="bg-brand-pastel-lavender p-2 rounded-lg text-brand-wood">
          <Edit2 size={20} />
        </div>
        <div className="text-left">
          <h2 className="text-lg font-bold text-brand-wood leading-tight">Nombres</h2>
          <span className="text-xs text-brand-wood/70 font-bold uppercase tracking-wide">
            {playerNames.slice(0, numPlayers).filter(n => n.trim()).length}/{numPlayers} listos
          </span>
        </div>
      </div>
      {expanded ? <ChevronUp size={24} className="text-brand-wood" /> : <ChevronDown size={24} className="text-brand-wood" />}
    </button>
    {expanded && (
      <div className="mt-4 p-4 bg-brand-wood/5 rounded-2xl border-2 border-brand-wood/10 border-dashed">
        <div className="space-y-3">
          {Array.from({ length: numPlayers }).map((_, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                placeholder={`Jugador ${i + 1}`}
                value={playerNames[i] || ''}
                onChange={(e) => updatePlayerName(i, e.target.value)}
                className="flex-1 p-3 border-2 border-brand-wood/20 rounded-xl focus:border-brand-bronze focus:outline-none bg-white text-brand-wood placeholder-brand-wood/40 font-bold"
              />
              <button
                onClick={() => generateRandomName(i)}
                className="w-12 h-12 rounded-xl bg-brand-bronze border-2 border-brand-wood text-white hover:bg-brand-wood transition-all flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(93,64,55,1)] active:translate-y-0.5 active:shadow-none"
                title="Nombre aleatorio"
              >
                <Edit2 size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
));

const SetupScreen = ({
  setScreen, selectedThemes, toggleTheme, themesExpanded, setThemesExpanded,
  numPlayers, addPlayer, removePlayer, playersExpanded, setPlayersExpanded, maxMonos,
  numMonos, addMono, removeMono, monosExpanded, setMonosExpanded,
  playerNames, updatePlayerName, generateRandomName, namesExpanded, setNamesExpanded,
  startGame
}) => (
  <div className="p-6 relative z-10">
    <div className="relative mb-8 flex items-center justify-center">
      <button
        onClick={() => setScreen('home')}
        className="absolute left-0 p-2 rounded-xl hover:bg-brand-wood/10 text-brand-wood transition-all active:scale-95"
        title="Volver al inicio"
      >
        <ArrowLeft size={28} />
      </button>
      <h1 className="text-4xl font-bold text-brand-wood tracking-wider drop-shadow-sm">🐒 MONO 🐒</h1>
    </div>

    <ThemeSelector
      selectedThemes={selectedThemes}
      toggleTheme={toggleTheme}
      expanded={themesExpanded}
      setExpanded={setThemesExpanded}
    />

    <PlayerCounter
      numPlayers={numPlayers}
      addPlayer={addPlayer}
      removePlayer={removePlayer}
      expanded={playersExpanded}
      setExpanded={setPlayersExpanded}
      maxMonos={maxMonos}
    />

    <MonoCounter
      numMonos={numMonos}
      addMono={addMono}
      removeMono={removeMono}
      maxMonos={maxMonos}
      expanded={monosExpanded}
      setExpanded={setMonosExpanded}
    />

    <NameEditor
      playerNames={playerNames}
      numPlayers={numPlayers}
      updatePlayerName={updatePlayerName}
      generateRandomName={generateRandomName}
      expanded={namesExpanded}
      setExpanded={setNamesExpanded}
    />

    <button
      onClick={startGame}
      className="w-full bg-brand-wood text-white py-5 rounded-2xl font-bold text-xl shadow-[4px_4px_0px_0px_#2C1810] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#2C1810] active:translate-y-1 active:shadow-[2px_2px_0px_0px_#2C1810] transition-all flex items-center justify-center gap-3 border-2 border-brand-dark"
    >
      <Play size={28} />
      JUGAR AHORA
    </button>
  </div>
);

export default SetupScreen;
