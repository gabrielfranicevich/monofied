import { STOPWORDS } from './stopwords.js';

const isTooSimilar = (w1, w2) => {
  let matchCount = 0;
  for (let i = 0; i < Math.min(w1.length, w2.length); i++) {
    if (w1[i] === w2[i]) matchCount++;
    else break;
  }
  // If they share at least 4 starting letters AND that makes up the majority (>50%) 
  // of the shorter word, they are essentially the same word form.
  return matchCount >= 4 && matchCount > Math.min(w1.length, w2.length) * 0.5;
};

const isValidWord = (w, originalWord) => {
  const cw = w.toLowerCase();
  const co = originalWord.toLowerCase();

  return cw.length > 2 &&           // block single chars / noise
    /^[a-záéíóúüñ]+$/.test(cw) && // only letters
    !STOPWORDS.has(cw) &&
    !cw.includes(co) &&
    !co.includes(cw) &&
    !isTooSimilar(cw, co);
};

/** Pick a random item from an array */
const pickRandom = (arr) => {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
};

export const generateHint = async (word) => {
  if (!word) return null;

  try {
    const fetchPromises = [
      // 1. Wikipedia Definition
      fetch(`https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(word)}`)
        .then(r => r.ok ? r.json() : {}).catch(() => ({})),

      // 2. Datamuse Synonyms/Related
      fetch(`https://api.datamuse.com/words?v=es&ml=${encodeURIComponent(word)}&max=20`)
        .then(r => r.ok ? r.json() : []).catch(() => []),

      // 3. Wiktionary Extract (using Action API since REST definition endpoint is unavailble in es)
      fetch(`https://es.wiktionary.org/w/api.php?action=query&prop=extracts&titles=${encodeURIComponent(word)}&format=json&explaintext=1&origin=*`)
        .then(r => r.ok ? r.json() : {}).catch(() => ({})),

      // 4. DuckDuckGo Instant Answers
      fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(word)}&format=json&l=es-es`)
        .then(r => r.ok ? r.json() : {}).catch(() => ({})),

      // 5. Wikidata Description
      fetch(`https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(word)}&language=es&uselang=es&format=json&origin=*`)
        .then(r => r.ok ? r.json() : {}).catch(() => ({})),

      // 6. Local Server Proxy (Slang dicts bypass)
      fetch(`/api/scrape-slang?w=${encodeURIComponent(word)}`)
        .then(r => r.ok ? r.json() : {}).catch(() => ({}))
    ];

    // Wait for all sites simultaneously
    const [wikiData, datamuseData, wiktData, ddgData, wdData, slangData] = await Promise.all(fetchPromises);

    let allWords = [];

    // Parse Wikipedia (Extract top definitional words)
    if (wikiData.description || wikiData.extract) {
      const text = (wikiData.description || '') + ' ' + (wikiData.extract || '');
      const wWords = text.split(/[\s,.;:()"']+/)
        .map(w => w.toLowerCase())
        .filter(w => isValidWord(w, word));
      allWords.push(...wWords.slice(0, 20));
    }

    // Parse Datamuse (Extract all valid related words)
    if (Array.isArray(datamuseData) && datamuseData.length > 0) {
      const dWords = datamuseData.map(d => d.word).filter(w => isValidWord(w, word));
      allWords.push(...dWords);
    }

    // Parse Wiktionary (Extract top definitional words)
    if (wiktData?.query?.pages) {
      const pages = Object.values(wiktData.query.pages);
      if (pages.length > 0 && pages[0].extract) {
        const text = pages[0].extract;
        const wtkWords = text.split(/[\s,.;:()"'{}\[\]]+/)
          .map(w => w.toLowerCase())
          .filter(w => isValidWord(w, word));
        allWords.push(...wtkWords.slice(0, 20));
      }
    }

    // Parse DuckDuckGo
    if (ddgData?.AbstractText || ddgData?.RelatedTopics?.length > 0) {
      const related = (ddgData.RelatedTopics || []).map(t => t.Text || '').join(' ');
      const text = (ddgData.AbstractText || '') + ' ' + related;
      const ddgWords = text.split(/[\s,.;:()"'{}\[\]]+/)
        .map(w => w.toLowerCase())
        .filter(w => isValidWord(w, word));
      allWords.push(...ddgWords.slice(0, 20));
    }

    // Parse Wikidata
    if (wdData?.search?.length > 0) {
      const text = wdData.search[0].description || '';
      const wdWords = text.split(/[\s,.;:()"'{}\[\]]+/)
        .map(w => w.toLowerCase())
        .filter(w => isValidWord(w, word));
      allWords.push(...wdWords.slice(0, 20));
    }

    // Parse Local Scraper Data
    if (slangData?.text) {
      const slangWords = slangData.text.split(/[\s,.;:()"'{}\[\]]+/)
        .map(w => w.toLowerCase())
        .filter(w => isValidWord(w, word));
      allWords.push(...slangWords.slice(0, 20)); // Grabs up to 20 valid raw terms
    }

    // Dedup pooled words
    let uniqueWords = [...new Set(allWords)];

    if (uniqueWords.length > 0) {
      // The very first word is often an obvious direct synonym (e.g. "profesional" for "arquitecto").
      // We skip it, then limit our selection pool to a max of 50 highly relevant words from all sites.
      const skip = Math.min(1, uniqueWords.length - 1);
      const pool = uniqueWords.slice(skip, 50);

      if (pool.length > 0) {
        return pickRandom(pool);
      }
    }
  } catch (error) {
    console.warn('Failed to generate pooled hint:', error);
  }

  return null;
};
