export type Testament = 'old' | 'new';

export interface Book {
  name: string;
  chapters: number;
  testament: Testament;
  period?: string;
}

export interface Reading {
  book: string;
  chapters: number[];
}

export interface DailyReading {
  day: number;
  readings: Reading[];
}

export interface BookMark {
  id: string;
  text: string;
  book: string;
  chapter: number;
  verse: number;
  createdAt: number;
}

export type ReadingProgress = Record<string, number[]>;