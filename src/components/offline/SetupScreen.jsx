import React, { memo, useState } from 'react';
import { ArrowLeft, Edit2, ChevronUp, ChevronDown, Play, X, Plus, GripVertical, Users } from '../Icons';
import { THEMES } from '../../data/constants';

import ThemeSelector from '../shared/ThemeSelector';
import MonoCounter from '../shared/MonoCounter';
import PrimaryButton from '../shared/PrimaryButton';
import InputField from '../shared/InputField';
import WordListModal from '../shared/WordListModal';

const PlayerSection = memo(({ playerNames, numPlayers, updatePlayerName, generateRandomName, addPlayer, removePlayer, removePlayerAt, reorderPlayer, expanded, setExpanded }) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (index !== dragOverIndex) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      reorderPlayer(draggedIndex, index);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="mb-8">
      <div className="w-full bg-white rounded-2xl border-2 border-brand-wood shadow-[4px_4px_0px_0px_rgba(93,64,55,1)]">
        <div className="flex items-center justify-between p-4 flex-wrap sm:flex-nowrap gap-4">
          <div
            className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
            onClick={() => setExpanded(!expanded)}
          >
            <div className="bg-brand-pastel-mint p-2 rounded-lg text-brand-wood flex-shrink-0">
              <Users size={20} />
            </div>
            <div className="text-left overflow-hidden">
              <h2 className="text-lg font-bold text-brand-wood leading-tight truncate">Jugadores</h2>
              <span className="text-xs text-brand-wood/70 font-bold uppercase tracking-wide block truncate">
                {playerNames.slice(0, numPlayers).filter(n => n.trim()).length}/{numPlayers} listos
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:pl-4 sm:border-l-2 sm:border-brand-wood/10">
            <button
              onClick={(e) => { e.stopPropagation(); removePlayer(); }}
              disabled={numPlayers <= 3}
              className="w-10 h-10 rounded-xl bg-brand-pastel-peach border-2 border-brand-wood text-brand-wood font-bold text-xl hover:brightness-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0px_0px_rgba(93,64,55,1)] active:translate-y-0.5 active:shadow-none"
            >
              -
            </button>
            <div className="text-2xl font-bold text-brand-wood min-w-[30px] text-center">
              {numPlayers}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); addPlayer(); }}
              className="w-10 h-10 rounded-xl bg-brand-pastel-mint border-2 border-brand-wood text-brand-wood font-bold text-xl hover:brightness-95 transition-all flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0px_0px_rgba(93,64,55,1)] active:translate-y-0.5 active:shadow-none"
            >
              +
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 ml-1 hover:bg-brand-wood/10 rounded-xl transition-colors text-brand-wood"
            >
              {expanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </button>
          </div>
        </div>
      </div>
      {expanded && (
        <div className="mt-4 p-4 bg-brand-wood/5 rounded-2xl border-2 border-brand-wood/10 border-dashed">
          <div className="space-y-3">
            {Array.from({ length: numPlayers }).map((_, i) => (
              <div
                key={i}
                draggable
                onDragStart={(e) => handleDragStart(e, i)}
                onDragOver={(e) => handleDragOver(e, i)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, i)}
                onDragEnd={handleDragEnd}
                className={`flex gap-2 items-center p-2 rounded-xl border border-transparent transition-all ${draggedIndex === i ? 'opacity-50 border-brand-wood/30' : ''} ${dragOverIndex === i ? 'bg-brand-wood/10 scale-[1.02] shadow-sm' : ''}`}
              >
                <div className="cursor-grab active:cursor-grabbing text-brand-wood/40 hover:text-brand-wood transition-colors p-1">
                  <GripVertical size={20} />
                </div>
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
                  className="w-12 h-12 rounded-xl bg-brand-bronze border-2 border-brand-wood text-white hover:bg-brand-wood transition-all flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(93,64,55,1)] active:translate-y-0.5 active:shadow-none shrink-0"
                  title="Nombre aleatorio"
                >
                  <Edit2 size={20} />
                </button>
                <button
                  onClick={() => removePlayerAt(i)}
                  disabled={numPlayers <= 3}
                  className="w-12 h-12 rounded-xl bg-red-400 border-2 border-brand-wood text-white hover:bg-red-500 transition-all flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(93,64,55,1)] active:translate-y-0.5 active:shadow-none disabled:opacity-50 disabled:shadow-none disabled:translate-y-0 shrink-0"
                  title="Eliminar jugador"
                >
                  <X size={20} />
                </button>
              </div>
            ))}

            <button
              onClick={addPlayer}
              className="w-full flex items-center justify-center gap-2 mt-2 p-3 rounded-xl bg-white/50 border-2 border-brand-wood/30 border-dashed text-brand-wood/70 font-bold hover:bg-white hover:border-brand-wood/60 hover:text-brand-wood transition-all"
            >
              <Plus size={20} /> Añadir Jugador
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

const SetupScreen = ({
  setScreen, selectedThemes, toggleTheme, themesExpanded, setThemesExpanded,
  numPlayers, addPlayer, removePlayer, removePlayerAt, reorderPlayer, playersExpanded, setPlayersExpanded, maxMonos,
  numMonos, addMono, removeMono, monosExpanded, setMonosExpanded,
  playerNames, updatePlayerName, generateRandomName, namesExpanded, setNamesExpanded,
  showMonoHints, setShowMonoHints,
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

    <PlayerSection
      playerNames={playerNames}
      numPlayers={numPlayers}
      updatePlayerName={updatePlayerName}
      generateRandomName={generateRandomName}
      addPlayer={addPlayer}
      removePlayer={removePlayer}
      removePlayerAt={removePlayerAt}
      reorderPlayer={reorderPlayer}
      expanded={namesExpanded || playersExpanded}
      setExpanded={setNamesExpanded}
    />

    <MonoCounter
      numMonos={numMonos}
      onAddMono={addMono}
      onRemoveMono={removeMono}
      maxMonos={maxMonos}
      showMonoHints={showMonoHints}
      onToggleMonoHints={() => setShowMonoHints(!showMonoHints)}
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
