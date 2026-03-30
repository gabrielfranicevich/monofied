import { memo } from 'react';
import { Eye } from '../Icons';

const MonoCounter = ({
  numMonos,
  onAddMono,
  onRemoveMono,
  maxMonos,
  isHost = true,
  showMonoHints,
  onToggleMonoHints,
}) => (
  <div className="mb-6">
    <div className="w-full bg-white rounded-2xl border-2 border-brand-wood shadow-[4px_4px_0px_0px_rgba(93,64,55,1)]">
      {/* Main counter row */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="bg-brand-pastel-peach p-2 rounded-lg text-brand-wood flex-shrink-0">
            <Eye size={20} />
          </div>
          <div className="text-left">
            <h2 className="text-lg font-bold text-brand-wood leading-tight">Monos</h2>
            <span className="text-xs text-brand-wood/70 font-bold uppercase tracking-wide">Máx: {maxMonos}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRemoveMono}
            disabled={!isHost || numMonos <= 1}
            className="w-10 h-10 rounded-xl bg-brand-pastel-peach border-2 border-brand-wood text-brand-wood font-bold text-xl hover:brightness-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[2px_2px_0px_0px_rgba(93,64,55,1)] active:translate-y-0.5 active:shadow-none flex items-center justify-center flex-shrink-0"
          >
            -
          </button>
          <div className="text-2xl font-bold text-brand-wood min-w-[24px] text-center">
            {numMonos}
          </div>
          <button
            onClick={onAddMono}
            disabled={!isHost || numMonos >= maxMonos}
            className="w-10 h-10 rounded-xl bg-brand-pastel-mint border-2 border-brand-wood text-brand-wood font-bold text-xl hover:brightness-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[2px_2px_0px_0px_rgba(93,64,55,1)] active:translate-y-0.5 active:shadow-none flex items-center justify-center flex-shrink-0"
          >
            +
          </button>
        </div>
      </div>

      {/* Hints toggle row — only rendered when the prop is provided */}
      {onToggleMonoHints !== undefined && showMonoHints !== undefined && (
        <div className="flex items-center justify-between px-4 py-2 border-t-2 border-brand-wood/10">
          <span className="text-xs font-bold text-brand-wood/60 uppercase tracking-wide">
            Pistas para monos
          </span>
          {isHost ? (
            <button
              onClick={onToggleMonoHints}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors border-2 border-brand-wood ${showMonoHints ? 'bg-brand-pastel-mint' : 'bg-brand-wood/20'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white border-2 border-brand-wood transition-transform ${showMonoHints ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          ) : (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${showMonoHints ? 'text-brand-wood bg-brand-pastel-mint border-brand-wood/20' : 'text-brand-wood/40 bg-brand-wood/10 border-brand-wood/10'}`}>
              {showMonoHints ? 'Sí' : 'No'}
            </span>
          )}
        </div>
      )}
    </div>

    {!isHost && (
      <div className="text-center text-xs text-brand-wood/60 font-bold mt-2 italic">
        Solo el anfitrión puede cambiar los monos
      </div>
    )}
  </div>
);

export default memo(MonoCounter);
