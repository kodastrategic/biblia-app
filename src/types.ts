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
  verseEnd?: number;
  createdAt: number;
}

export type ReadingProgress = Record<string, number[]>;

export interface Memoria {
  id: string;
  text: string;
  kind: 'feito' | 'pedido';
  createdAt: number;
  answeredAt?: number;
}

export interface DevocionalDia {
  dia: number;
  semana_tema: string;
  titulo: string;
  referencia_biblica: string;
  texto_base: string;
  reflexao: string;
  desafio_pratico: string;
  oracao: string;
}

export interface Devocional {
  titulo: string;
  subtitulo: string;
  publico_alvo: string;
  introducao: string;
  estrutura_do_devocional: string[];
  dias: DevocionalDia[];
}