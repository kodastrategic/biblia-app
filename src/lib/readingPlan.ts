import type { DailyReading } from '../types';
import { BOOKS } from '../data/books';

export interface ReadingPlanConfig {
  mode: 'chapters' | 'period';
  chaptersPerDay: number;
  periodDays: number;
}

export const MAX_IDEAL_CHAPTERS = 5;

export const DEFAULT_PLAN: ReadingPlanConfig = {
  mode: 'chapters',
  chaptersPerDay: 2,
  periodDays: 365,
};

type ProgressMap = Record<string, Set<number>>;

export interface PlanStats {
  chaptersPerDay: number;
  totalDays: number;
  remaining: number;
}

interface ChapterRef {
  book: string;
  chapter: number;
}

const ALL_CHAPTERS: ChapterRef[] = BOOKS.flatMap((book) =>
  Array.from({ length: book.chapters }, (_, i) => ({ book: book.name, chapter: i + 1 })),
);

function unreadList(read: ProgressMap): ChapterRef[] {
  const list: ChapterRef[] = [];
  for (const ref of ALL_CHAPTERS) {
    const set = read[ref.book];
    if (!set || !set.has(ref.chapter)) list.push(ref);
  }
  return list;
}

function groupConsecutive(refs: ChapterRef[]): DailyReading['readings'] {
  const quiet: DailyReading['readings'] = [];

  for (const ref of refs) {
    const last = quiet[quiet.length - 1];
    if (last && last.book === ref.book && last.chapters[last.chapters.length - 1] === ref.chapter - 1) {
      last.chapters.push(ref.chapter);
    } else {
      quiet.push({ book: ref.book, chapters: [ref.chapter] });
    }
  }

  return quiet;
}

export function getPlanStats(config: ReadingPlanConfig, read: ProgressMap): PlanStats {
  const remaining = unreadList(read).length;

  if (remaining === 0) {
    return { chaptersPerDay: 0, totalDays: 0, remaining: 0 };
  }

  const chaptersPerDay =
    config.mode === 'chapters'
      ? Math.max(1, config.chaptersPerDay)
      : Math.max(1, Math.ceil(remaining / Math.max(1, config.periodDays)));

  return {
    chaptersPerDay,
    totalDays: Math.ceil(remaining / chaptersPerDay),
    remaining,
  };
}

export function getCurrentPlanDay(config: ReadingPlanConfig, read: ProgressMap, countRead: number): number {
  const { chaptersPerDay, totalDays } = getPlanStats(config, read);
  if (totalDays <= 0) return 1;
  if (chaptersPerDay <= 0) return 1;
  return Math.max(1, Math.min(totalDays, Math.floor(countRead / chaptersPerDay) + 1));
}

export function getReadingForPlanDay(
  day: number,
  config: ReadingPlanConfig,
  read: ProgressMap,
): DailyReading | null {
  const { chaptersPerDay, totalDays } = getPlanStats(config, read);
  if (totalDays <= 0 || day < 1 || day > totalDays) return null;

  const unread = unreadList(read);
  const start = (day - 1) * chaptersPerDay;
  const slice = unread.slice(start, start + chaptersPerDay);
  if (slice.length === 0) return null;

  return { day, readings: groupConsecutive(slice) };
}

export function getDayOfYear(date: Date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}