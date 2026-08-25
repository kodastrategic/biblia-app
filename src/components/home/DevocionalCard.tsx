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
      className="group w-full relative overflow-hidden rounded-3xl border border-amber-400/25 bg-gradient-to-br from-amber-400/12 via-orange-500/8 to-amber-400/5 hover:border-amber-400/50 hover:from-amber-400/18 hover:via-orange-500/12 hover:to-amber-400/8 p-6 md:p-8 transition-all active:scale-[0.99] text-left"
    >
      <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-amber-400/10 blur-3xl" />
      <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-orange-500/10 blur-3xl" />

      <div className="relative flex items-center gap-6 md:gap-8">
        <div className="shrink-0 flex flex-col items-center justify-center">
          <div className="text-5xl md:text-6xl font-serif font-bold text-amber-300 leading-none">
            {currentDay}
          </div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-amber-300/70 font-bold mt-1">
            dia
          </div>
        </div>

        <div className="min-w-0 flex-1 border-l border-amber-400/20 pl-6 md:pl-8">
          <p className="text-[10px] uppercase tracking-[0.25em] text-amber-300/90 font-bold mb-1.5">
            <Sunrise className="w-3.5 h-3.5 inline -mt-0.5 mr-1.5" />
            Devocional
          </p>
          <p className="text-base md:text-lg text-fg font-semibold leading-snug mb-1">
            {isComplete
              ? 'Devocional concluído'
              : day?.titulo ?? 'Faça o seu devocional de hoje'}
          </p>
          <p className="text-sm text-muted truncate">
            {day ? `${day.semana_tema} · ${day.referencia_biblica}` : `${currentDay} de ${totalDays} dias`}
          </p>
        </div>

        <div className="shrink-0 flex flex-col items-center gap-2">
          <ChevronRight className="w-5 h-5 text-muted group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all" />
          <span className="text-[10px] text-dim font-mono tabular-nums">
            {currentDay}/{totalDays}
          </span>
        </div>
      </div>
    </button>
  );
}
