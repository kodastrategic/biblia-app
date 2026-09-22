import type { Memoria } from '../types';

const STORAGE_KEY = 'bibleMemorias';

export function loadMemorias(): Memoria[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Memoria[]) : [];
  } catch {
    return [];
  }
}

export function persistMemorias(memorias: Memoria[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memorias));
  } catch {
    /* quota ou modo privado: ignora silenciosamente */
  }
}

export function createMemoria(text: string, kind: Memoria['kind']): Memoria {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text,
    kind,
    createdAt: Date.now(),
    ...(kind === 'feito' ? { answeredAt: Date.now() } : {}),
  };
}

export function formatMemoriaDate(timestamp: number): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(timestamp));
}