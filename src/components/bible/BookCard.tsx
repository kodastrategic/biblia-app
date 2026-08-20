import type { Book } from '../../types';
import { cn } from '../../lib/cn';

interface BookCardProps {
  book: Book;
  readChapters: Set<number>;
  onToggleChapter: (chapter: number) => void;
}

export function BookCard({ book, readChapters, onToggleChapter }: BookCardProps) {
  const chapters = Array.from({ length: book.chapters }, (_, i) => i + 1);
  const progress = book.chapters > 0 ? (readChapters.size / book.chapters) * 100 : 0;
  const complete = readChapters.size === book.chapters;

  return (
    <div className="rounded-2xl border border-line bg-panel/60 backdrop-blur-sm p-5 transition-all hover:border-line-strong">
      <div className="mb-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-fg">{book.name}</h3>
          {complete && (
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              ✓ Completo
            </span>
          )}
        </div>
        {book.period && <p className="text-xs text-brand mt-1 italic">📅 {book.period}</p>}

        <div className="flex items-center gap-2 mt-3">
          <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand to-accent transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-muted tabular-nums">
            {readChapters.size}/{book.chapters}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-1.5">
        {chapters.map((chapter) => {
          const isRead = readChapters.has(chapter);
          return (
            <button
              key={chapter}
              onClick={() => onToggleChapter(chapter)}
              title={`Capítulo ${chapter}`}
              className={cn(
                'w-full aspect-square flex items-center justify-center text-[13px] font-medium rounded-md border transition-all active:scale-90',
                isRead
                  ? 'bg-gradient-to-br from-brand to-accent border-transparent text-white shadow-[0_4px_12px_-4px_rgba(47,164,255,0.5)]'
                  : 'border-line-strong text-fg/80 hover:border-brand/50 hover:text-fg hover:bg-white/5',
              )}
            >
              {chapter}
            </button>
          );
        })}
      </div>
    </div>
  );
}