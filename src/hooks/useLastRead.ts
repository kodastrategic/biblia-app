import { useCallback, useState } from 'react';

const STORAGE_KEY = 'bibleLastRead';

export interface LastRead {
  book: string;
  chapter: number;
}

function load(): LastRead | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LastRead;
    if (parsed && typeof parsed.book === 'string' && typeof parsed.chapter === 'number') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function useLastRead() {
  const [lastRead, setLastRead] = useState<LastRead | null>(load);

  const recordRead = useCallback((book: string, chapter: number) => {
    const next: LastRead = { book, chapter };
    setLastRead(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* quota ou modo privado */
    }
  }, []);

  return { lastRead, recordRead };
}