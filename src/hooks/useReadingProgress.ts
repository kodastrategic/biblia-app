import { useCallback, useMemo, useState } from 'react';
import { TOTAL_CHAPTERS, getBook } from '../data/books';
import type { ReadingProgress } from '../types';

const STORAGE_KEY = 'bibleReadingProgress';

type ProgressMap = Record<string, Set<number>>;

function loadProgress(): ProgressMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ReadingProgress;
    const map: ProgressMap = {};
    for (const [book, chapters] of Object.entries(parsed)) {
      map[book] = new Set(chapters);
    }
    return map;
  } catch {
    return {};
  }
}

function persist(next: ProgressMap): void {
  const toSave: ReadingProgress = {};
  for (const [book, chapters] of Object.entries(next)) {
    toSave[book] = Array.from(chapters);
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    /* quota ou modo privado */
  }
}

export function useReadingProgress() {
  const [progress, setProgress] = useState<ProgressMap>(loadProgress);

  const toggleChapter = useCallback(
    (book: string, chapter: number): boolean => {
      const next: ProgressMap = {};
      for (const [b, s] of Object.entries(progress)) next[b] = new Set(s);
      if (!next[book]) next[book] = new Set();

      const wasRead = next[book].has(chapter);
      if (wasRead) next[book].delete(chapter);
      else next[book].add(chapter);

      const info = getBook(book);
      const completedBook = Boolean(info && !wasRead && next[book].size === info.chapters);

      setProgress(next);
      persist(next);
      return completedBook;
    },
    [progress],
  );

  const isChapterRead = useCallback(
    (book: string, chapter: number): boolean => progress[book]?.has(chapter) ?? false,
    [progress],
  );

  const countRead = useMemo(
    () => Object.values(progress).reduce((sum, s) => sum + s.size, 0),
    [progress],
  );

  const percentage = useMemo(
    () => (TOTAL_CHAPTERS > 0 ? Math.round((countRead / TOTAL_CHAPTERS) * 100) : 0),
    [countRead],
  );

  return { progress, toggleChapter, isChapterRead, countRead, percentage };
}