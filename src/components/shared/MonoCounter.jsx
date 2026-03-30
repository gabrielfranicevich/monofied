import { memo } from 'react';
import { Eye } from '../Icons';

const MonoCounter = ({
  numMonos,
  onAddMono,
  onRemoveMono,
  maxMonos,
  isHost = true
}) => (
  <div className="mb-6">
    <div className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border-2 border-brand-wood shadow-[4px_4px_0px_0px_rgba(93,64,55,1)]">
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
    {!isHost && (
      <div className="text-center text-xs text-brand-wood/60 font-bold mt-2 italic">
        Solo el anfitrión puede cambiar los monos
      </div>
    )}
  </div>
);

export default memo(MonoCounter);
