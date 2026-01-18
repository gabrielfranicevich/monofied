import { describe, it, expect, beforeEach } from 'vitest';

// Mock localStorage for the test
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    clear: () => { store = {}; },
    removeItem: (key) => { delete store[key]; }
  };
})();

global.localStorage = localStorageMock;

const STORAGE_KEY = 'customWordLists';

const loadWordLists = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
};

const saveWordList = (listName, words) => {
  const lists = loadWordLists();
  lists[listName] = words;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
  return true;
};

const deleteWordList = (listName) => {
  const lists = loadWordLists();
  delete lists[listName];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
  return true;
};

describe('Offline Custom Themes Logic', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should save a word list', () => {
    saveWordList('MyList', ['perro', 'gato']);
    const lists = loadWordLists();
    expect(lists['MyList']).toEqual(['perro', 'gato']);
  });

  it('should update an existing list', () => {
    saveWordList('MyList', ['perro', 'gato']);
    saveWordList('MyList', ['apple', 'banana']);
    const lists = loadWordLists();
    expect(lists['MyList']).toEqual(['apple', 'banana']);
  });

  it('should delete a word list', () => {
    saveWordList('MyList', ['perro', 'gato']);
    deleteWordList('MyList');
    const lists = loadWordLists();
    expect(lists['MyList']).toBeUndefined();
  });

  it('should handle multiple lists', () => {
    saveWordList('ListA', ['a']);
    saveWordList('ListB', ['b']);
    const lists = loadWordLists();
    expect(Object.keys(lists).length).toBe(2);
  });
});
