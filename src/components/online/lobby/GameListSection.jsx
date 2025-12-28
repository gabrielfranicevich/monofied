import { ChevronDown, ChevronUp } from '../../Icons';
import GameItem from './GameItem';

const GameListSection = ({
  title,
  subtitle,
  icon,
  games,
  isExpanded,
  onToggle,
  onJoin,
  headerClassName = "bg-white",
  showCount = false
}) => {
  if (games.length === 0) return null;

  return (
    <div className="mb-4">
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-4 rounded-2xl hover:brightness-95 transition-all border-2 border-brand-wood shadow-[4px_4px_0px_0px_rgba(93,64,55,1)] active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(93,64,55,1)] ${headerClassName}`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg text-white ${title.includes('LAN') ? 'bg-brand-wood' : 'bg-brand-mustard'}`}>
            {icon}
          </div>
          <div className="text-left">
            <h2 className="text-lg font-bold text-brand-wood leading-tight uppercase tracking-wide">{title}</h2>
            {subtitle && (
              <span className="text-xs text-brand-wood/70 font-bold">{subtitle}</span>
            )}
          </div>
        </div>
        {isExpanded ? <ChevronUp size={24} className="text-brand-wood" /> : <ChevronDown size={24} className="text-brand-wood" />}
      </button>

      {isExpanded && (
        <div className={`mt-2 p-4 rounded-2xl border-2 border-brand-wood/10 border-dashed ${title.includes('LAN') ? 'bg-brand-pastel-mint/30' : 'bg-brand-wood/5 max-h-[300px] overflow-y-auto pr-2'}`}>
          <div className="space-y-3">
            {games.map((game) => (
              <GameItem
                key={game.id}
                game={game}
                onJoin={onJoin}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameListSection;
