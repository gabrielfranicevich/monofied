import React from 'react';
import { Play } from '../../Icons';

const StartGameButton = ({ isHost, onStart, playerCount }) => {
  if (isHost) {
    return (
      <button
        onClick={onStart}
        disabled={playerCount < 3}
        className="w-full bg-brand-wood text-white py-5 rounded-2xl font-bold text-xl shadow-[4px_4px_0px_0px_#2C1810] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#2C1810] active:translate-y-1 active:shadow-[2px_2px_0px_0px_#2C1810] transition-all flex items-center justify-center gap-3 border-2 border-brand-dark disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
      >
        <Play size={24} />
        EMPEZAR PARTIDA
      </button>
    );
  }

  return (
    <div className="text-center text-brand-wood/60 font-bold animate-pulse py-5">
      Esperando al anfitrión...
    </div>
  );
};

export default StartGameButton;
