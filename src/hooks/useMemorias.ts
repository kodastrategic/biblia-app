import { useCallback, useState } from 'react';
import type { Memoria } from '../types';
import { loadMemorias, persistMemorias, createMemoria } from '../lib/memorias';

export function useMemorias() {
  const [memorias, setMemorias] = useState<Memoria[]>(loadMemorias);

  const addMemoria = useCallback((text: string, kind: Memoria['kind']) => {
    const next = [createMemoria(text, kind), ...loadMemorias()];
    setMemorias(next);
    persistMemorias(next);
  }, []);

  const updateMemoria = useCallback((id: string, text: string) => {
    setMemorias((prev) => {
      const next = prev.map((m) => (m.id === id ? { ...m, text } : m));
      persistMemorias(next);
      return next;
    });
  }, []);

  const removeMemoria = useCallback((id: string) => {
    setMemorias((prev) => {
      const next = prev.filter((m) => m.id !== id);
      persistMemorias(next);
      return next;
    });
  }, []);

  const confirmMemoria = useCallback((id: string) => {
    setMemorias((prev) => {
      const next = prev.map((m) =>
        m.id === id && !m.answeredAt ? { ...m, answeredAt: Date.now() } : m,
      );
      persistMemorias(next);
      return next;
    });
  }, []);

  const pendingCount = memorias.filter((m) => m.kind === 'pedido' && !m.answeredAt).length;

  return { memorias, pendingCount, addMemoria, updateMemoria, removeMemoria, confirmMemoria };
}