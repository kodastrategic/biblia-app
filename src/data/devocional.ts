import rawFase1 from './devocional.json';
import rawFase2 from './devocional2.json';
import type { Devocional } from '../types';

export const DEVOCIONAIS: Devocional[] = [rawFase1 as Devocional, rawFase2 as Devocional];

export const DEVOCIONAL_SERIES = DEVOCIONAIS.length;

export function getSeriesTotal(series: number): number {
  const safe = Math.min(Math.max(0, series), DEVOCIONAIS.length - 1);
  return DEVOCIONAIS[safe].dias.length;
}

export function getDevocionalDay(series: number, day: number) {
  const safeSeries = Math.min(Math.max(0, series), DEVOCIONAIS.length - 1);
  const safeDay = Math.min(Math.max(1, day), getSeriesTotal(safeSeries));
  return DEVOCIONAIS[safeSeries].dias.find((d) => d.dia === safeDay) ?? null;
}