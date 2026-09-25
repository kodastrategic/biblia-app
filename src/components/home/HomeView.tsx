import type { BookMark, DevocionalDia } from '../../types';
import type { LastRead } from '../../hooks/useLastRead';
import { FeedCard } from './FeedCard';
import { DevocionalCard } from './DevocionalCard';
import { HomeHub } from './HomeHub';
import { SearchBooks } from './SearchBooks';

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
  onSelectBook: (name: string) => void;
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
  onSelectBook,
}: HomeViewProps) {
  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8">
      <div className="mb-6 md:mb-8">
        <SearchBooks onSelectBook={onSelectBook} />
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

      <div className="mb-8 md:mb-10">
        <HomeHub
          percentage={percentage}
          countRead={countRead}
          planLabel={planLabel}
          userName={userName}
          lastRead={lastRead}
          onOpenLibrary={onOpenLibrary}
          onOpenLastRead={onOpenLastRead}
          memoriasPendingCount={memoriasPendingCount}
          onOpenMemorias={onOpenMemorias}
        />
      </div>

      <div className="mb-8 md:mb-10">
        <FeedCard marks={marks} onOpenMarks={onOpenMarks} onOpenLibrary={onOpenLibrary} />
      </div>
    </div>
  );
}
