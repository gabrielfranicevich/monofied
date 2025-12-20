import React from 'react';
import { Play, Users } from './Icons';

const HomeScreen = ({ setScreen }) => (
  <div className="p-8 relative z-10 flex flex-col items-center justify-center min-h-[500px]">
    <div className="mb-12 text-center transform hover:scale-105 transition-transform duration-500">
      <div className="text-8xl mb-4 filter drop-shadow-xl animate-bounce">🐒</div>
      <h1 className="text-6xl font-bold text-brand-wood tracking-wider drop-shadow-sm">MONO</h1>
    </div>

    <div className="w-full space-y-6">
      <button
        onClick={() => setScreen('setup')}
        className="w-full bg-brand-wood text-white py-6 rounded-2xl font-bold text-2xl shadow-[4px_4px_0px_0px_#2C1810] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#2C1810] active:translate-y-1 active:shadow-[2px_2px_0px_0px_#2C1810] transition-all flex items-center justify-center gap-4 border-2 border-brand-dark group"
      >
        <Play size={32} className="group-hover:scale-110 transition-transform" />
        Jugar Offline
      </button>

      <button
        onClick={() => {
          setScreen('lan_lobby');
          window.history.pushState(null, '', '/lan');
        }}
        className="w-full bg-brand-wood text-white py-6 rounded-2xl font-bold text-2xl shadow-[4px_4px_0px_0px_#2C1810] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#2C1810] active:translate-y-1 active:shadow-[2px_2px_0px_0px_#2C1810] transition-all flex items-center justify-center gap-4 border-2 border-brand-dark"
      >
        <Users size={32} />
        Jugar en LAN
      </button>
    </div>
  </div>
);

export default HomeScreen;
