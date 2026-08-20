import { useEffect, useState } from 'react';
import { Quote, Shuffle, BookOpen } from 'lucide-react';
import type { BookMark } from '../../types';
import { markReference } from '../../lib/marks';

interface FeedCardProps {
  marks: BookMark[];
  onOpenMarks: () => void;
  onOpenLibrary: () => void;
}

export function FeedCard({ marks, onOpenMarks, onOpenLibrary }: FeedCardProps) {
  const [index, setIndex] = useState(0);
  const [swapKey, setSwapKey] = useState(0);

  useEffect(() => {
    if (marks.length === 0) return;
    setIndex(Math.floor(Math.random() * marks.length));
  }, [marks.length]);

  const mark = marks.length > 0 ? marks[index % marks.length] : null;

  const shuffle = () => {
    if (marks.length < 2) return;
    let next = index;
    while (next === index) next = Math.floor(Math.random() * marks.length);
    setIndex(next);
    setSwapKey((k) => k + 1);
  };

  return (
    <div
      onClick={onOpenMarks}
      className="relative overflow-hidden rounded-3xl border border-line bg-panel/80 backdrop-blur-md p-6 md:p-8 shadow-card cursor-pointer group transition-all hover:border-brand/40"
    >
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-accent/15 blur-3xl" />

      {!mark ? (
        <div className="relative flex flex-col items-center justify-center text-center py-8">
          <Quote className="w-8 h-8 text-dim mb-4" />
          <p className="text-sm text-muted leading-relaxed max-w-xs">
            Ainda não há textos marcados. Na Bíblia, selecione um trecho e toque no{' '}
            <span className="text-red-400 font-semibold">coração</span> para guardá-lo aqui.
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenLibrary();
            }}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand to-accent text-white text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all active:scale-95"
          >
            <BookOpen className="w-4 h-4" />
            Ir para um capítulo
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="flex items-center justify-between mb-5">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-brand">
              <Quote className="w-4 h-4" />
              Marcações
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                shuffle();
              }}
              className="p-2 rounded-lg text-muted hover:text-brand hover:bg-white/5 transition-colors"
              aria-label="Mostrar outro texto marcado"
            >
              <Shuffle className="w-4 h-4" />
            </button>
          </div>

          <blockquote
            key={swapKey}
            className="animate-feed-swap font-serif italic text-xl md:text-2xl text-fg/95 leading-relaxed line-clamp-4 min-h-[120px]"
          >
            “{mark.text}”
          </blockquote>

          <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
            <span className="text-xs md:text-sm font-semibold text-brand">{markReference(mark)}</span>
            <span className="text-xs text-dim font-medium">
              {marks.length} {marks.length === 1 ? 'marcação' : 'marcações'} · ver todas
            </span>
          </div>
        </div>
      )}
    </div>
  );
}