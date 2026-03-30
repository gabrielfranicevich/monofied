import { STOPWORDS } from './stopwords.js';

const isValidWord = (w, originalWord) =>
  w.length > 2 &&           // block single chars / noise
  !STOPWORDS.has(w) &&
  !w.includes(originalWord.toLowerCase()) &&
  !originalWord.toLowerCase().includes(w);

/** Pick a random item from an array, optionally skipping the first `skip` entries */
const pickRandom = (arr, skip = 0) => {
  const pool = arr.slice(skip);
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
};

/** Fetch related Spanish words from Datamuse */
const fetchRelated = async (word, max = 20) => {
  try {
    const res = await fetch(
      `https://api.datamuse.com/words?v=es&ml=${encodeURIComponent(word)}&max=${max}`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data || []).map(d => d.word).filter(w => isValidWord(w, word));
  } catch {
    return [];
  }
};

export const generateHint = async (word) => {
  if (!word) return null;

  try {
    // --- Step 1: get a pool of words related to the original keyword ---
    const firstHop = await fetchRelated(word, 25);

    if (firstHop.length > 0) {
      // Skip the top 3 most obvious results, pick randomly from the rest
      const pivot = pickRandom(firstHop, Math.min(3, firstHop.length - 1));

      if (pivot) {
        // --- Step 2: get words related to the pivot (second hop) ---
        const secondHop = await fetchRelated(pivot, 15);
        const filtered = secondHop.filter(w => isValidWord(w, word));

        if (filtered.length > 0) {
          return pickRandom(filtered);
        }

        // If second hop returned nothing useful, fall back to the pivot itself
        return pivot;
      }
    }

    // --- Fallback: Wikipedia extract ---
    const wikiRes = await fetch(
      `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(word)}`
    );
    if (wikiRes.ok) {
      const wikiData = await wikiRes.json();
      if (wikiData.extract) {
        const extracted = wikiData.extract
          .split(/[\s,.;:()"']+/)
          .map(w => w.toLowerCase())
          .filter(w => isValidWord(w, word));

        if (extracted.length > 0) {
          return pickRandom(extracted, Math.min(3, extracted.length - 1));
        }
      }
    }
  } catch (error) {
    console.warn('Failed to generate hint:', error);
  }

  return null;
};
