import { useCallback, useState } from 'react';
import { DEVOCIONAL_TOTAL_DAYS } from '../data/devocional';

const STORAGE_KEY = 'devocionalProgress';

interface DevotionalProgress {
  lastCompletedDay: number;
}

function loadProgress(): DevotionalProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { lastCompletedDay: 0 };
    const parsed = JSON.parse(raw) as DevotionalProgress;
    return { lastCompletedDay: Number(parsed.lastCompletedDay) || 0 };
  } catch {
    return { lastCompletedDay: 0 };
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

  const currentDay = Math.min(progress.lastCompletedDay + 1, DEVOCIONAL_TOTAL_DAYS);
  const isComplete = progress.lastCompletedDay >= DEVOCIONAL_TOTAL_DAYS;

  const completeDay = useCallback((day: number) => {
    setProgress((prev) => {
      const next = { lastCompletedDay: Math.max(prev.lastCompletedDay, day) };
      persist(next);
      return next;
    });
  }, []);

  return { currentDay, isComplete, completeDay };
}