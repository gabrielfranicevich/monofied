import { memo } from 'react';
import { Users, ChevronUp, ChevronDown } from '../Icons';

const PlayerCounter = ({
  count,
  onIncrement,
  onDecrement,
  min,
  max,
  label = "Jugadores",
  subLabel = "",
  accordion = true,
  expanded = true,
  onToggleExpand,
  showMax = false // Show MAX MONOS text
}) => {
  const displayCount = count === '∞' ? '∞' : count;
  const isMin = count <= min;
  const isMax = count >= max;

  const CounterControls = () => (
    <div className="flex items-center gap-4">
      <button
        onClick={onDecrement}
        disabled={isMin}
        className="w-12 h-12 rounded-xl bg-brand-pastel-peach border-2 border-brand-wood text-brand-wood font-bold text-2xl hover:brightness-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[2px_2px_0px_0px_rgba(93,64,55,1)] active:translate-y-0.5 active:shadow-none flex items-center justify-center"
      >
        -
      </button>
      <div className="flex-1 text-center">
        <div className="text-5xl font-bold text-brand-wood">{displayCount}</div>
        {showMax && typeof max === 'number' && (
          <div className="text-xs font-bold uppercase text-brand-wood/50 tracking-widest mt-1">
            MAX MONOS: {Math.ceil(count / 2) - 1} {/* Logic specific to Mono game, maybe should be passed as prop but keeping simple for now */}
          </div>
        )}
      </div>
      <button
        onClick={onIncrement}
        disabled={isMax}
        className="w-12 h-12 rounded-xl bg-brand-pastel-mint border-2 border-brand-wood text-brand-wood font-bold text-2xl hover:brightness-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[2px_2px_0px_0px_rgba(93,64,55,1)] active:translate-y-0.5 active:shadow-none flex items-center justify-center"
      >
        +
      </button>
    </div>
  );

  if (!accordion) {
    return (
      <div className="bg-white p-2 rounded-2xl border-2 border-brand-wood/20">
        <CounterControls />
      </div>
    );
  }

  return (
    <div className="mb-6">
      <button
        onClick={onToggleExpand}
        className="w-full flex items-center justify-between p-4 bg-white rounded-2xl hover:bg-brand-beige/20 transition-all border-2 border-brand-wood shadow-[4px_4px_0px_0px_rgba(93,64,55,1)] active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(93,64,55,1)]"
      >
        <div className="flex items-center gap-3">
          <div className="bg-brand-pastel-mint p-2 rounded-lg text-brand-wood">
            <Users size={20} />
          </div>
          <div className="text-left">
            <h2 className="text-lg font-bold text-brand-wood leading-tight">{label}</h2>
            <span className="text-xs text-brand-wood/70 font-bold uppercase tracking-wide">{subLabel || `${count} personas`}</span>
          </div>
        </div>
        {expanded ? <ChevronUp size={24} className="text-brand-wood" /> : <ChevronDown size={24} className="text-brand-wood" />}
      </button>
      {expanded && (
        <div className="mt-4 p-4 bg-brand-wood/5 rounded-2xl border-2 border-brand-wood/10 border-dashed">
          <CounterControls />
        </div>
      )}
    </div>
  );
};

export default memo(PlayerCounter);
