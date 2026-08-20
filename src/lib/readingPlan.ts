import type { DailyReading } from '../types';
import { BOOKS } from '../data/books';

const TOTAL_DAYS = 365;
const TOTAL_CHAPTERS = BOOKS.reduce((sum, b) => sum + b.chapters, 0);
const CHAPTERS_PER_DAY = TOTAL_CHAPTERS / TOTAL_DAYS;

let planCache: DailyReading[] | null = null;

export function getReadingPlan(): DailyReading[] {
  if (planCache) return planCache;

  const plan: DailyReading[] = [];
  let bookIndex = 0;
  let chapter = 1;

  for (let day = 1; day <= TOTAL_DAYS; day++) {
    const daily: DailyReading = { day, readings: [] };
    const startIdx = Math.floor((day - 1) * CHAPTERS_PER_DAY);
    const endIdx = Math.floor(day * CHAPTERS_PER_DAY);
    let remaining = endIdx - startIdx;

    while (remaining > 0 && bookIndex < BOOKS.length) {
      const book = BOOKS[bookIndex];
      const available = book.chapters - chapter + 1;
      const take = Math.min(remaining, available);

      daily.readings.push({
        book: book.name,
        chapters: Array.from({ length: take }, (_, i) => chapter + i),
      });

      remaining -= take;
      chapter += take;

      if (chapter > book.chapters) {
        bookIndex++;
        chapter = 1;
      }
    }

    plan.push(daily);
  }

  planCache = plan;
  return plan;
}

export function getReadingForDay(day: number): DailyReading | null {
  const safe = Math.min(Math.max(1, day), TOTAL_DAYS);
  return getReadingPlan().find((r) => r.day === safe) ?? null;
}

export function getDayOfYear(date: Date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}