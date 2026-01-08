import { useState } from 'react';
import { ArrowLeft, Check, Copy } from '../../Icons';

const WaitingRoomHeader = ({ roomName, roomId, onLeave }) => {
  const [copied, setCopied] = useState(false);

  const copyGameCode = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(roomId);
        setCopied(true);
      } else {
        // Fallback for non-secure contexts (http on LAN)
        const textArea = document.createElement("textarea");
        textArea.value = roomId;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopied(true);
      }
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <>
      <div className="relative mb-6 flex items-center justify-center">
        <button
          onClick={onLeave}
          className="absolute left-0 p-2 rounded-xl hover:bg-brand-wood/10 text-brand-wood transition-all active:scale-95"
          title="Salir"
        >
          <ArrowLeft size={28} />
        </button>
        <div className="text-center">
          <h1 className="text-xl font-bold text-brand-wood/60 uppercase tracking-widest">SALA</h1>
          <h2 className="text-4xl font-bold text-brand-wood tracking-wider">{roomName}</h2>
        </div>
      </div>

      <div className="bg-brand-pastel-mint/50 p-4 rounded-2xl border-2 border-brand-wood/20 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-brand-wood/60 uppercase tracking-wider">Código de Juego</span>
            <div className="text-3xl font-bold text-brand-wood tracking-[0.3em] mt-1">{roomId}</div>
          </div>
          <button
            onClick={copyGameCode}
            className={`p-3 rounded-xl border-2 transition-all ${copied
              ? 'bg-brand-pastel-mint border-brand-wood text-brand-wood'
              : 'bg-white border-brand-wood/20 text-brand-wood hover:bg-brand-beige/30'
              }`}
            title={copied ? '¡Copiado!' : 'Copiar código'}
          >
            {copied ? <Check size={20} /> : <Copy size={20} />}
          </button>
        </div>
      </div>
    </>
  );
};

export default WaitingRoomHeader;
