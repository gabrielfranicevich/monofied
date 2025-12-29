import { Play } from '../../Icons';
import PrimaryButton from '../../shared/PrimaryButton';

const StartGameButton = ({ isHost, onStart, playerCount }) => {
  if (isHost) {
    return (
      <PrimaryButton
        onClick={onStart}
        disabled={playerCount < 3}
      >
        <Play size={24} />
        EMPEZAR PARTIDA
      </PrimaryButton>
    );
  }

  return (
    <div className="text-center text-brand-wood/60 font-bold animate-pulse py-5">
      Esperando al anfitrión...
    </div>
  );
};

export default StartGameButton;
