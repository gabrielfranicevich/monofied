import { ArrowLeft } from '../../Icons';

const CreateGameHeader = ({ onBack }) => (
  <div className="relative mb-6 flex items-center justify-center">
    <button
      onClick={onBack}
      className="absolute left-0 p-2 rounded-xl hover:bg-brand-wood/10 text-brand-wood transition-all active:scale-95"
      title="Volver"
    >
      <ArrowLeft size={28} />
    </button>
    <h1 className="text-3xl font-bold text-brand-wood tracking-wider drop-shadow-sm">NUEVA PARTIDA</h1>
  </div>
);

export default CreateGameHeader;
