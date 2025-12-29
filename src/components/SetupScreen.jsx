import React, { memo } from 'react';
import { ArrowLeft, Edit2, ChevronUp, ChevronDown, Users, Eye, Play } from './Icons';
import { THEMES } from '../data/constants';

import ThemeSelector from './shared/ThemeSelector';
import MonoCounter from './shared/MonoCounter';
import PlayerCounter from './shared/PlayerCounter';
import PrimaryButton from './shared/PrimaryButton';
import InputField from './shared/InputField';
import WordListModal from './shared/WordListModal';




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
              <div className="flex-1">
                <InputField
                  placeholder={`Jugador ${i + 1}`}
                  value={playerNames[i] || ''}
                  onChange={(e) => updatePlayerName(i, e.target.value)}
                  containerClassName="space-y-0"
                />
              </div>
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


// ... (ThemeSelector and MonoCounter imports already exist)

// ... (PlayerCounter and NameEditor inline components remain)



const SetupScreen = ({
  setScreen, selectedThemes, toggleTheme, themesExpanded, setThemesExpanded,
  numPlayers, addPlayer, removePlayer, playersExpanded, setPlayersExpanded, maxMonos,
  numMonos, addMono, removeMono, monosExpanded, setMonosExpanded,
  playerNames, updatePlayerName, generateRandomName, namesExpanded, setNamesExpanded,
  startGame,
  // New props for custom lists
  customLists, onSaveList, onEditList, onDeleteList, onOpenCreateModal,
  modalOpen, onCloseModal, editingList
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
      onToggleTheme={toggleTheme}
      expanded={themesExpanded}
      setExpanded={setThemesExpanded}
      customLists={customLists}
      onOpenCreateModal={onOpenCreateModal}
      onEditList={onEditList}
      onDeleteList={onDeleteList}
    />

    <PlayerCounter
      count={numPlayers}
      onIncrement={addPlayer}
      onDecrement={removePlayer}
      expanded={playersExpanded}
      onToggleExpand={() => setPlayersExpanded(!playersExpanded)}
      min={3}
      max={100}
      showMax={true}
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

    <PrimaryButton onClick={startGame}>
      <Play size={28} />
      JUGAR AHORA
    </PrimaryButton>

    <WordListModal
      isOpen={modalOpen}
      onClose={onCloseModal}
      onSave={onSaveList}
      existingList={editingList}
    />
  </div>
);

export default SetupScreen;
