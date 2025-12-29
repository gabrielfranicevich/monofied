import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Edit2, Eye, Plus, X } from '../../Icons';
import { THEMES } from '../../../data/constants';
import { loadWordLists, saveWordList, deleteWordList } from '../../../utils/customWordLists';
import WordListModal from '../../shared/WordListModal';
import ThemeSelector from '../../shared/ThemeSelector';
import MonoCounter from '../../shared/MonoCounter';

const GameSettingsSection = ({
  isHost,
  selectedThemes,
  onToggleTheme,
  numMonos,
  maxMonos,
  onAddMono,
  onRemoveMono
}) => {
  const [themesExpanded, setThemesExpanded] = useState(false);
  const [monosExpanded, setMonosExpanded] = useState(false);
  const [customLists, setCustomLists] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editingList, setEditingList] = useState(null);

  useEffect(() => {
    setCustomLists(loadWordLists());
  }, []);

  const handleSaveList = (name, words) => {
    saveWordList(name, words);
    setCustomLists(loadWordLists());
  };

  const handleDeleteList = (name) => {
    if (confirm(`¿Eliminar la lista "${name}"?`)) {
      deleteWordList(name);
      setCustomLists(loadWordLists());
      // Remove from selected if it was selected
      if (selectedThemes.includes(name)) {
        onToggleTheme(name);
      }
    }
  };

  const handleEditList = (name) => {
    setEditingList({ name, words: customLists[name] });
    setModalOpen(true);
  };

  const handleOpenCreateModal = (e) => {
    e.stopPropagation();
    setEditingList(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingList(null);
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Themes Selection */}
      <ThemeSelector
        selectedThemes={selectedThemes}
        onToggleTheme={onToggleTheme}
        expanded={themesExpanded}
        setExpanded={setThemesExpanded}
        isHost={isHost}
        customLists={customLists}
        onOpenCreateModal={handleOpenCreateModal}
        onEditList={handleEditList}
        onDeleteList={handleDeleteList}
      />

      {/* Monos Count */}
      <MonoCounter
        numMonos={numMonos}
        onAddMono={onAddMono}
        onRemoveMono={onRemoveMono}
        maxMonos={maxMonos}
        expanded={monosExpanded}
        setExpanded={setMonosExpanded}
        isHost={isHost}
      />

      {/* Word List Modal */}
      <WordListModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveList}
        existingList={editingList}
      />
    </div>
  );
};

export default GameSettingsSection;
