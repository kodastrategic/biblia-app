import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, CheckCircle2, Circle, BookOpen, Sparkles } from 'lucide-react';
import type { DailyReading } from '../../types';
import { cn } from '../../lib/cn';

interface DailyReadingCardProps {
  currentDay: number;
  dailyReading: DailyReading;
  onDayChange: (day: number) => void;
  readChapters: Record<string, Set<number>>;
  onToggleChapter: (book: string, chapter: number) => void;
  onReadNow: (book: string, chapter: number) => void;
}

export function DailyReadingCard({
  currentDay,
  dailyReading,
  onDayChange,
  readChapters,
  onToggleChapter,
  onReadNow,
}: DailyReadingCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const totalToday = dailyReading.readings.reduce((sum, r) => sum + r.chapters.length, 0);
  const doneToday = dailyReading.readings.reduce((sum, r) => {
    const set = readChapters[r.book] ?? new Set<number>();
    return sum + r.chapters.filter((c) => set.has(c)).length;
  }, 0);
  const dayProgress = totalToday > 0 ? Math.round((doneToday / totalToday) * 100) : 0;
  const isDayComplete = dayProgress === 100;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-brand/10 via-panel to-accent/10 backdrop-blur-md p-5 md:p-8 shadow-card">
      <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-brand/10 blur-3xl" />

      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-soft border border-brand/30 text-brand">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-wider text-muted">Leitura do Dia</h3>
              <p className="text-lg font-semibold text-fg">
                Dia {currentDay} <span className="text-muted font-normal">de 365</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onDayChange(Math.max(1, currentDay - 1))}
              disabled={currentDay === 1}
              className="p-2 rounded-lg border border-line text-muted hover:text-fg hover:bg-white/5 transition-colors disabled:opacity-30 disabled:pointer-events-none"
              aria-label="Dia anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-muted min-w-[84px] text-center tabular-nums">
              Dia {currentDay}
            </span>
            <button
              onClick={() => onDayChange(Math.min(365, currentDay + 1))}
              disabled={currentDay === 365}
              className="p-2 rounded-lg border border-line text-muted hover:text-fg hover:bg-white/5 transition-colors disabled:opacity-30 disabled:pointer-events-none"
              aria-label="Próximo dia"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted">Progresso de hoje</span>
            <span className="text-sm font-semibold text-fg tabular-nums">
              {doneToday}/{totalToday} capítulos
            </span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand to-accent transition-all duration-500"
              style={{ width: `${dayProgress}%` }}
            />
          </div>
          {isDayComplete && (
            <p className="text-sm text-brand mt-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Dia completo! Parabéns!
            </p>
          )}
        </div>

        <button
          onClick={() => setIsExpanded((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand mb-4"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Capítulos do dia
          <ChevronRight
            className={cn('w-3.5 h-3.5 transition-transform', isExpanded && 'rotate-90')}
          />
        </button>

        {isExpanded && (
          <div className="space-y-4">
            {dailyReading.readings.map((reading, idx) => {
              const set = readChapters[reading.book] ?? new Set<number>();
              const doneInBook = reading.chapters.filter((c) => set.has(c)).length;
              return (
                <div
                  key={`${reading.book}-${idx}`}
                  className="rounded-2xl border border-line bg-ink/40 p-4"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h4 className="text-sm font-semibold text-fg">{reading.book}</h4>
                      <p className="text-xs text-muted mt-0.5">
                        {doneInBook}/{reading.chapters.length} capítulos lidos
                      </p>
                    </div>
                    <button
                      onClick={() => onReadNow(reading.book, reading.chapters[0])}
                      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-brand to-accent text-white text-xs font-bold hover:brightness-110 transition-all active:scale-95"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Ler Agora
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {reading.chapters.map((chapter) => {
                      const isRead = set.has(chapter);
                      return (
                        <button
                          key={chapter}
                          onClick={() => onToggleChapter(reading.book, chapter)}
                          className={cn(
                            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all active:scale-95',
                            isRead
                              ? 'bg-gradient-to-r from-brand to-accent border-transparent text-white'
                              : 'bg-white/5 border-line-strong text-fg/80 hover:border-brand/50',
                          )}
                        >
                          {isRead ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <Circle className="w-3.5 h-3.5" />
                          )}
                          Cap. {chapter}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 p-3.5 rounded-xl border border-brand/20 bg-brand-soft">
          <p className="text-xs text-muted italic">
            💡 Dica: complete a leitura do dia para manter sua sequência e transformar isso em um
            hábito diário!
          </p>
        </div>
      </div>
    </div>
  );
}