import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Edit2, Eye } from '../../Icons';
import { THEMES } from '../../../data/constants';

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

  return (
    <div className="mb-6 space-y-4">
      {/* Themes Selection */}
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
                  onClick={() => onToggleTheme(theme)}
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

      {/* Monos Count */}
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
                onClick={onRemoveMono}
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
                onClick={onAddMono}
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
  );
};

export default GameSettingsSection;
