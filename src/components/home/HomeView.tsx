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

      <div className="flex justify-center mb-10 md:mb-14">
        <Button size="lg" onClick={onOpenLibrary}>
          <BookOpen className="w-5 h-5" />
          Ir para um capítulo
        </Button>
      </div>

      <div className="mb-10 md:mb-14">
        <FeedCard marks={marks} onOpenMarks={onOpenMarks} onOpenLibrary={onOpenLibrary} />
      </div>

      <section>
        <ProgressCard percentage={percentage} countRead={countRead} userName={userName} />
      </section>
    </div>
  );
}
