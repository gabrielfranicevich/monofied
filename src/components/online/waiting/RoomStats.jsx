import { Users, MessageSquare } from '../../Icons';

const RoomStats = ({ currentPlayers, maxPlayers, gameType }) => (
  <div className="bg-white/50 p-4 rounded-2xl border-2 border-brand-wood/10 mb-6 text-center">
    <div className="flex items-center justify-center gap-4 text-brand-wood font-bold">
      <div className="flex items-center gap-2">
        <Users size={20} />
        <span>{currentPlayers}/{maxPlayers === 2 ? '∞' : maxPlayers}</span>
      </div>
      <div className="w-px h-6 bg-brand-wood/20"></div>
      <div className="flex items-center gap-2">
        {gameType === 'chat' ? <MessageSquare size={20} /> : <Users size={20} />}
        <span className="uppercase text-sm">{gameType === 'chat' ? 'Chat' : 'En Persona'}</span>
      </div>
    </div>
  </div>
);

export default RoomStats;
