import { useCallback, useState } from 'react';
import type { BookMark } from '../types';
import { loadMarks, persistMarks } from '../lib/marks';

export function useMarks() {
  const [marks, setMarks] = useState<BookMark[]>(loadMarks);

  const addMark = useCallback((mark: BookMark) => {
    const next = [mark, ...marks];
    setMarks(next);
    persistMarks(next);
  }, [marks]);

  const removeMark = useCallback((id: string) => {
    setMarks((prev) => {
      const next = prev.filter((m) => m.id !== id);
      persistMarks(next);
      return next;
    });
  }, []);

  return { marks, addMark, removeMark };
}