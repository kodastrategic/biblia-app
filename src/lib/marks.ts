import type { BookMark } from '../types';

const STORAGE_KEY = 'bibleMarks';

export function loadMarks(): BookMark[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as BookMark[]) : [];
  } catch {
    return [];
  }
}

export function persistMarks(marks: BookMark[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(marks));
  } catch {
    /* quota ou modo privado: ignora silenciosamente */
  }
}

export function createMark(
  text: string,
  book: string,
  chapter: number,
  verse: number,
  verseEnd?: number,
): BookMark {
  const end = verseEnd && verseEnd > verse ? verseEnd : undefined;
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text,
    book,
    chapter,
    verse,
    ...(end ? { verseEnd: end } : {}),
    createdAt: Date.now(),
  };
}

export function markReference(mark: BookMark): string {
  if (mark.verseEnd && mark.verseEnd > mark.verse) {
    return `${mark.book} ${mark.chapter}:${mark.verse}-${mark.verseEnd}`;
  }
  return `${mark.book} ${mark.chapter}:${mark.verse}`;
}

export function formatMarkDate(timestamp: number): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(timestamp));
}