import { BookOpen, History } from 'lucide-react';
import type { BookMark, DevocionalDia } from '../../types';
import type { LastRead } from '../../hooks/useLastRead';
import { Button } from '../ui/Button';
import { ProgressCard } from './ProgressCard';
import { FeedCard } from './FeedCard';
import { DevocionalCard } from './DevocionalCard';
import { MemoriasCard } from './MemoriasCard';

interface HomeViewProps {
  marks: BookMark[];
  percentage: number;
  countRead: number;
  planLabel: string;
  userName?: string;
  devocionalCurrentDay: number;
  devocionalTotalDays: number;
  devocionalDay: DevocionalDia | null;
  devocionalIsComplete: boolean;
  onOpenDevocional: () => void;
  onOpenLibrary: () => void;
  onOpenMarks: () => void;
  lastRead: LastRead | null;
  onOpenLastRead: () => void;
  memoriasPendingCount: number;
  onOpenMemorias: () => void;
}

export function HomeView({
  marks,
  percentage,
  countRead,
  planLabel,
  userName,
  devocionalCurrentDay,
  devocionalTotalDays,
  devocionalDay,
  devocionalIsComplete,
  onOpenDevocional,
  onOpenLibrary,
  onOpenMarks,
  lastRead,
  onOpenLastRead,
  memoriasPendingCount,
  onOpenMemorias,
}: HomeViewProps) {
  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8">
      <div className="mb-4">
        <MemoriasCard pendingCount={memoriasPendingCount} onOpen={onOpenMemorias} />
      </div>

      <div className="mb-8 md:mb-10">
        <DevocionalCard
          currentDay={devocionalCurrentDay}
          totalDays={devocionalTotalDays}
          day={devocionalDay}
          isComplete={devocionalIsComplete}
          onOpen={onOpenDevocional}
        />
      </div>

      <div className="flex flex-wrap justify-center items-center gap-3 mb-10 md:mb-14">
        <Button size="lg" onClick={onOpenLibrary}>
          <BookOpen className="w-5 h-5" />
          Ir para um capítulo
        </Button>
        <Button variant="outline" size="md" disabled={!lastRead} onClick={onOpenLastRead}>
          <History className="w-4 h-4" />
          Último capítulo
        </Button>
      </div>

      <div className="mb-10 md:mb-14">
        <FeedCard marks={marks} onOpenMarks={onOpenMarks} onOpenLibrary={onOpenLibrary} />
      </div>

      <section>
        <ProgressCard percentage={percentage} countRead={countRead} planLabel={planLabel} userName={userName} />
      </section>
    </div>
  );
}
