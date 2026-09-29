import { useCallback, useState } from 'react';
import { DEVOCIONAL_SERIES, getSeriesTotal } from '../data/devocional';

const STORAGE_KEY = 'devocionalProgress';

interface DevotionalProgress {
  series: number;
  lastCompletedDay: number;
}

function loadProgress(): DevotionalProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { series: 0, lastCompletedDay: 0 };
    const parsed = JSON.parse(raw) as Partial<DevotionalProgress>;
    // migração: progresso antigo (sem série) pertence à fase 1
    if (typeof parsed.series !== 'number') {
      return { series: 0, lastCompletedDay: Number(parsed.lastCompletedDay) || 0 };
    }
    return { series: parsed.series ?? 0, lastCompletedDay: Number(parsed.lastCompletedDay) || 0 };
  } catch {
    return { series: 0, lastCompletedDay: 0 };
  }
}

function persist(progress: DevotionalProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    /* quota ou modo privado */
  }
}

export function useDevotionalProgress() {
  const [progress, setProgress] = useState<DevotionalProgress>(loadProgress);

  const totalDays = getSeriesTotal(progress.series);
  const currentDay = Math.min(progress.lastCompletedDay + 1, totalDays);
  const isComplete = progress.lastCompletedDay >= totalDays;

  const completeDay = useCallback((day: number) => {
    setProgress((prev) => {
      const next: DevotionalProgress = {
        ...prev,
        lastCompletedDay: Math.max(prev.lastCompletedDay, day),
      };
      if (next.lastCompletedDay >= getSeriesTotal(prev.series) && prev.series < DEVOCIONAL_SERIES - 1) {
        next.series += 1;
        next.lastCompletedDay = 0;
      }
      persist(next);
      return next;
    });
  }, []);

  return { currentSeries: progress.series, currentDay, isComplete, completeDay };
}