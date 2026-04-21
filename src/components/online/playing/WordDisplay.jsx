import { useState, useEffect } from 'react';
import { generateHints } from '../../../utils/hintGenerator';

/** Returns { text, className } with a mid-dash and smaller font for very long words */
const formatWord = (word) => {
  if (!word) return { text: '', className: '' };
  const upper = word.toUpperCase();
  const len = upper.length;
  if (len > 16) {
    // Insert a dash at roughly the midpoint
    const mid = Math.ceil(len / 2);
    const hyphenated = upper.slice(0, mid) + '-\n' + upper.slice(mid);
    return { text: hyphenated, className: 'text-lg leading-tight' };
  }
  if (len > 11) return { text: upper, className: 'text-2xl' };
  return { text: upper, className: 'text-3xl' };
};

const WordDisplay = ({ amIMono, word, gamePhase, showMonoHints }) => {
  const [hint, setHint] = useState('');

  useEffect(() => {
    if (amIMono && word && showMonoHints) {
      generateHints(word, 1).then(hints => setHint(hints[0] || ''));
    }
  }, [amIMono, word, showMonoHints]);

  return (
    <div className="mb-4 p-4 bg-white rounded-2xl border-2 border-brand-wood text-center shadow-sm relative overflow-hidden">
      {amIMono ? (
        <div>
          <div className="text-6xl mb-2">🐒</div>
          <div className="text-2xl font-bold text-brand-wood">¡SOS EL MONO!</div>
          
          {(gamePhase !== 'results' && hint) && (
            <div className="mt-4 p-3 bg-brand-wood/5 rounded-xl border-2 border-brand-wood/10 border-dashed">
              <div className="text-xs font-bold text-brand-wood/50 uppercase tracking-widest mb-1">Si no sabés qué decir:</div>
              <div className="text-xl font-bold text-brand-bronze uppercase">{hint}</div>
            </div>
          )}

          {(gamePhase === 'results') && (
            <div className="mt-2 text-brand-wood/60 font-bold">La palabra era: <span className="text-brand-wood uppercase">{formatWord(word).text.replace('-\n', '-')}</span></div>
          )}
        </div>
      ) : (
        <div>
          <div className="text-sm font-bold text-brand-wood/50 uppercase tracking-widest mb-2">Tu palabra</div>
          <div className={`${formatWord(word).className} font-bold text-brand-wood whitespace-pre-line`}>{formatWord(word).text}</div>
        </div>
      )}
    </div>
  );
};

export default WordDisplay;
