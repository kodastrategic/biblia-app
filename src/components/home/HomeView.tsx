import { BookOpen } from 'lucide-react';
import type { BookMark, DevocionalDia } from '../../types';
import { Button } from '../ui/Button';
import { ProgressCard } from './ProgressCard';
import { FeedCard } from './FeedCard';
import { DevocionalCard } from './DevocionalCard';

interface HomeViewProps {
  marks: BookMark[];
  percentage: number;
  countRead: number;
  userName?: string;
  devocionalCurrentDay: number;
  devocionalTotalDays: number;
  devocionalDay: DevocionalDia | null;
  devocionalIsComplete: boolean;
  onOpenDevocional: () => void;
  onOpenLibrary: () => void;
  onOpenMarks: () => void;
}

export function HomeView({
  marks,
  percentage,
  countRead,
  userName,
  devocionalCurrentDay,
  devocionalTotalDays,
  devocionalDay,
  devocionalIsComplete,
  onOpenDevocional,
  onOpenLibrary,
  onOpenMarks,
}: HomeViewProps) {
  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8">
      <section className="text-center mb-14 md:mb-20">
        <p className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand/30 bg-brand-soft text-brand text-[11px] font-bold uppercase tracking-[0.25em] mb-6">
          Bíblia Diária
        </p>
        <h1 className="font-serif italic text-[32px] md:text-[56px] leading-[1.15] text-fg mb-6 max-w-3xl mx-auto">
          Um dia por vez. Um texto por dia.{' '}
          <span className="text-gradient-brand not-italic font-semibold">Uma vida transformada.</span>
        </h1>
        <p className="text-sm md:text-base text-muted max-w-xl mx-auto leading-relaxed mb-9">
          Quando a Palavra ocupa um lugar diário na rotina, o entendimento é ampliado e a paz se
          torna o alicerce de cada decisão.
        </p>
        <Button size="lg" onClick={onOpenLibrary}>
          <BookOpen className="w-5 h-5" />
          Ir para um capítulo
        </Button>
      </section>

      <div className="mb-6 md:mb-8">
        <DevocionalCard
          currentDay={devocionalCurrentDay}
          totalDays={devocionalTotalDays}
          day={devocionalDay}
          isComplete={devocionalIsComplete}
          onOpen={onOpenDevocional}
        />
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <ProgressCard percentage={percentage} countRead={countRead} userName={userName} />
        <FeedCard marks={marks} onOpenMarks={onOpenMarks} onOpenLibrary={onOpenLibrary} />
      </section>
    </div>
  );
}