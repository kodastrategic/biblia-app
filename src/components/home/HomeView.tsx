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
      <div className="mb-8 md:mb-10">
        <DevocionalCard
          currentDay={devocionalCurrentDay}
          totalDays={devocionalTotalDays}
          day={devocionalDay}
          isComplete={devocionalIsComplete}
          onOpen={onOpenDevocional}
        />
      </div>

      <div className="mb-10 md:mb-14">
        <FeedCard marks={marks} onOpenMarks={onOpenMarks} onOpenLibrary={onOpenLibrary} />
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <ProgressCard percentage={percentage} countRead={countRead} userName={userName} />
        <div className="flex flex-col items-center justify-center text-center p-6 md:p-8 rounded-3xl border border-line bg-panel/80 backdrop-blur-md shadow-card">
          <p className="text-sm text-muted max-w-xs leading-relaxed mb-6">
            {userName ? `${userName}, ` : ''}Explore a Bíblia completa, leia capítulos e acompanhe seu progresso.
          </p>
          <Button size="lg" onClick={onOpenLibrary}>
            <BookOpen className="w-5 h-5" />
            Ir para um capítulo
          </Button>
        </div>
      </section>
    </div>
  );
}
