import { BookOpen } from 'lucide-react';
import type { DailyReading } from '../../types';
import { BOOKS } from '../../data/books';
import { Button } from '../ui/Button';
import { BookCard } from './BookCard';
import { DailyReadingCard } from './DailyReadingCard';

interface BibleViewProps {
  userName?: string;
  percentage: number;
  countRead: number;
  selectedDay: number;
  onDayChange: (day: number) => void;
  dailyReading: DailyReading | null;
  progress: Record<string, Set<number>>;
  onToggleChapter: (book: string, chapter: number) => void;
  onReadNow: (book: string, chapter: number) => void;
  onOpenLibrary: () => void;
}

export function BibleView({
  userName,
  percentage,
  countRead,
  selectedDay,
  onDayChange,
  dailyReading,
  progress,
  onToggleChapter,
  onReadNow,
  onOpenLibrary,
}: BibleViewProps) {
  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8">
      <div className="text-center mb-12 md:mb-16">
        <p className="text-xs uppercase tracking-[0.35em] text-brand font-bold mb-3">
          Progresso de Leitura
        </p>
        <h2 className="text-4xl md:text-6xl font-serif font-semibold text-gradient leading-tight">
          {userName ? `${userName.toUpperCase()}, ` : ''}VOCÊ JÁ LEU {percentage}%
        </h2>
        <p className="text-sm text-muted mt-3">
          {countRead} capítulos lidos de {BOOKS.reduce((s, b) => s + b.chapters, 0)}
        </p>
      </div>

      {dailyReading && (
        <div className="mb-12 md:mb-16">
          <DailyReadingCard
            currentDay={selectedDay}
            dailyReading={dailyReading}
            onDayChange={onDayChange}
            readChapters={progress}
            onToggleChapter={onToggleChapter}
            onReadNow={onReadNow}
          />
        </div>
      )}

      <div className="mb-10 flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-[0.3em] text-dim italic">Bíblia Completa</h3>
        <Button variant="subtle" size="sm" onClick={onOpenLibrary}>
          <BookOpen className="w-3.5 h-3.5" />
          Ir para um capítulo
        </Button>
      </div>

      <div className="space-y-14">
        <section>
          <h3 className="text-center text-xs tracking-[0.3em] uppercase text-dim mb-8 italic">
            Antigo Testamento
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {BOOKS.filter((b) => b.testament === 'old').map((book) => (
              <BookCard
                key={book.name}
                book={book}
                readChapters={progress[book.name] ?? new Set()}
                onToggleChapter={(c) => onToggleChapter(book.name, c)}
              />
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-center text-xs tracking-[0.3em] uppercase text-dim mb-8 italic">
            Novo Testamento
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {BOOKS.filter((b) => b.testament === 'new').map((book) => (
              <BookCard
                key={book.name}
                book={book}
                readChapters={progress[book.name] ?? new Set()}
                onToggleChapter={(c) => onToggleChapter(book.name, c)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}