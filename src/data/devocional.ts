import raw from './devocional.json';
import type { Devocional } from '../types';

export const devocional = raw as Devocional;

export const DEVOCIONAL_TOTAL_DAYS = devocional.dias.length;

export function getDevocionalDay(day: number) {
  const safe = Math.min(Math.max(1, day), DEVOCIONAL_TOTAL_DAYS);
  return devocional.dias.find((d) => d.dia === safe) ?? null;
}