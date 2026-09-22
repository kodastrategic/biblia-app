import { BookOpen, History, NotebookPen } from 'lucide-react';
import { TOTAL_CHAPTERS } from '../../data/books';
import type { LastRead } from '../../hooks/useLastRead';

interface HomeHubProps {
  percentage: number;
  countRead: number;
  planLabel: string;
  userName?: string;
  lastRead: LastRead | null;
  onOpenLibrary: () => void;
  onOpenLastRead: () => void;
  memoriasPendingCount: number;
  onOpenMemorias: () => void;
}

export function HomeHub({
  percentage,
  countRead,
  planLabel,
  userName,
  lastRead,
  onOpenLibrary,
  onOpenLastRead,
  memoriasPendingCount,
  onOpenMemorias,
}: HomeHubProps) {
  return (
    <div className="relative overflow-hidden clip-card rounded-3xl border border-line bg-panel/80 backdrop-blur-md p-5 md:p-7 shadow-card">
      <div className="absolute -top-20 -right-16 w-56 h-56 rounded-full bg-[radial-gradient(circle_at_center,rgba(47,164,255,0.22)_0%,transparent_70%)]" />
      <div className="absolute -bottom-24 -left-16 w-56 h-56 rounded-full bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.16)_0%,transparent_70%)]" />

      <div className="relative grid gap-6 md:grid-cols-[1fr_280px] md:items-center">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.3em] text-brand font-bold mb-3">
            Progresso de Leitura
          </p>

          <div className="flex items-end gap-4">
            <p className="text-5xl md:text-6xl font-serif font-semibold text-gradient leading-none shrink-0">
              {percentage.toFixed(2).replace('.', ',')}%
            </p>
            <p className="text-sm text-muted pb-1 min-w-0">
              {userName ? `${userName}, você já leu ` : 'Você já leu '}
              <span className="text-fg font-semibold">{countRead}</span> de{' '}
              <span className="text-fg font-semibold">{TOTAL_CHAPTERS}</span> capítulos.
            </p>
          </div>

          <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand to-accent transition-all duration-700"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-dim">
            <span>66 livros</span>
            <span>Plano: {planLabel}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={onOpenLibrary}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-brand to-accent text-white text-sm font-bold shadow-[0_8px_24px_-8px_rgba(47,164,255,0.6)] hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            Ir para um capítulo
          </button>

          <button
            onClick={onOpenLastRead}
            disabled={!lastRead}
            title={lastRead ? `Abrir ${lastRead.book} ${lastRead.chapter}` : 'Ainda não há capítulo recente'}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-line-strong text-fg text-sm font-semibold hover:bg-white/5 active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none min-w-0"
          >
            <History className="w-4 h-4 shrink-0 text-muted" />
            <span className="truncate">
              {lastRead ? `Continuar · ${lastRead.book} ${lastRead.chapter}` : 'Continuar lendo'}
            </span>
          </button>

          <button
            onClick={onOpenMemorias}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 text-fg text-sm font-semibold hover:bg-white/10 active:scale-[0.98] transition-all"
          >
            <NotebookPen className="w-4 h-4 shrink-0 text-brand" />
            <span className="flex-1 text-left truncate">Meus Lembretes</span>
            {memoriasPendingCount > 0 && (
              <span className="shrink-0 px-1.5 py-0.5 rounded-full bg-amber-400/15 text-amber-300 text-[10px] font-bold">
                {memoriasPendingCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}