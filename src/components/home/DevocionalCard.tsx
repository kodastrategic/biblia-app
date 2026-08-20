import { Sunrise, ChevronRight } from 'lucide-react';
import type { DevocionalDia } from '../../types';

interface DevocionalCardProps {
  currentDay: number;
  totalDays: number;
  day: DevocionalDia | null;
  isComplete: boolean;
  onOpen: () => void;
}

export function DevocionalCard({ currentDay, totalDays, day, isComplete, onOpen }: DevocionalCardProps) {
  return (
    <button
      onClick={onOpen}
      className="group w-full flex items-center gap-4 rounded-2xl border border-amber-400/25 bg-gradient-to-r from-amber-400/10 to-orange-500/5 hover:border-amber-400/50 hover:bg-amber-400/[0.12] p-4 md:p-5 transition-all active:scale-[0.99] text-left"
    >
      <div className="shrink-0 p-2.5 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300">
        <Sunrise className="w-5 h-5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-[0.25em] text-amber-300/90 font-bold mb-0.5">
          Devocional
        </p>
        <p className="text-sm text-fg font-medium truncate">
          {isComplete
            ? 'Devocional concluído'
            : 'Faça o seu devocional de hoje'}
        </p>
        <p className="text-xs text-muted truncate mt-0.5">
          {day ? `Dia ${currentDay} · ${day.semana_tema} — ${day.titulo}` : `Dia ${currentDay} de ${totalDays}`}
        </p>
      </div>

      <div className="shrink-0 flex items-center gap-2">
        <span className="text-[10px] text-dim font-mono tabular-nums">
          {currentDay}/{totalDays}
        </span>
        <ChevronRight className="w-4 h-4 text-muted group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all" />
      </div>
    </button>
  );
}