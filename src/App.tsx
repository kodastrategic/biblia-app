import { useEffect, useMemo, useState } from 'react';
import { Toaster, toast } from 'sonner';
import type { BookMark } from './types';
import { BOOKS, getBook } from './data/books';
import { DEVOCIONAL_TOTAL_DAYS, getDevocionalDay } from './data/devocional';
import {
  getCurrentPlanDay,
  getPlanStats,
  getReadingForPlanDay,
  type ReadingPlanConfig,
  DEFAULT_PLAN,
} from './lib/readingPlan';
import { createMark } from './lib/marks';
import { reportCrash } from './lib/crashLog';
import { DEFAULT_TRANSLATION, getTranslation } from './data/translations';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useReadingProgress } from './hooks/useReadingProgress';
import { useMarks } from './hooks/useMarks';
import { useDevotionalProgress } from './hooks/useDevotionalProgress';
import { useLastRead } from './hooks/useLastRead';
import { useMemorias } from './hooks/useMemorias';
import { useBackgroundMusic } from './lib/backgroundMusic';
import { AppShell, type View } from './components/layout/AppShell';
import { HomeView } from './components/home/HomeView';
import { BibleView } from './components/bible/BibleView';
import { ReaderModal } from './components/modals/ReaderModal';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { LibraryModal } from './components/modals/LibraryModal';
import { MarksModal } from './components/modals/MarksModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { DevocionalModal } from './components/modals/DevocionalModal';
import { MemoriasModal } from './components/modals/MemoriasModal';

type Theme = 'dark' | 'light';

export default function App() {
  const [view, setView] = useState<View>('home');
  const [selectedDay, setSelectedDay] = useState(1);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [marksOpen, setMarksOpen] = useState(false);
  const [devocionalOpen, setDevocionalOpen] = useState(false);
  const [memoriasOpen, setMemoriasOpen] = useState(false);
  const [reader, setReader] = useState<{ book: string; chapter: number; totalChapters: number } | null>(null);
  const [userName, setUserName] = useLocalStorage('bibleUserName', '');
  const [translationId, setTranslationId] = useLocalStorage('bibleTranslation', DEFAULT_TRANSLATION);
  const [theme, setTheme] = useLocalStorage<Theme>('bibleTheme', 'dark');
  const [planConfig, setPlanConfig] = useLocalStorage<ReadingPlanConfig>('bibleReadingPlan', DEFAULT_PLAN);
  const translation = useMemo(() => getTranslation(translationId), [translationId]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#f4f6fa' : '#2fa4ff');
  }, [theme]);

  const { progress, toggleChapter, isChapterRead, countRead, percentage } = useReadingProgress();
  const { marks, addMark, removeMark } = useMarks();
  const { currentDay: devocionalDay, isComplete: devocionalIsComplete, completeDay } =
    useDevotionalProgress();
  const { start: startMusic, stop: stopMusic } = useBackgroundMusic();
  const { lastRead, recordRead } = useLastRead();
  const {
    memorias,
    pendingCount: memoriasPendingCount,
    addMemoria,
    updateMemoria,
    removeMemoria,
    confirmMemoria,
  } = useMemorias();

  const openDevocional = () => {
    setDevocionalOpen(true);
    startMusic();
  };

  const closeDevocional = () => {
    setDevocionalOpen(false);
    stopMusic();
  };

  const planStats = useMemo(() => getPlanStats(planConfig, progress), [planConfig, progress]);
  const currentPlanDay = useMemo(
    () => getCurrentPlanDay(planConfig, progress, countRead),
    [planConfig, progress, countRead],
  );

  useEffect(() => {
    setSelectedDay(currentPlanDay);
  }, [currentPlanDay]);

  const safeSelectedDay = Math.max(1, Math.min(selectedDay, Math.max(1, planStats.totalDays)));

  const dailyReading = useMemo(
    () => getReadingForPlanDay(safeSelectedDay, planConfig, progress),
    [safeSelectedDay, planConfig, progress],
  );
  const devocionalDayData = useMemo(() => getDevocionalDay(devocionalDay), [devocionalDay]);

  const planLabel =
    planConfig.mode === 'chapters'
      ? `${Math.max(1, planConfig.chaptersPerDay)} cap/dia`
      : `${planConfig.periodDays} dias`;

  const openReader = (bookName: string, chapter: number) => {
    const info = getBook(bookName);
    recordRead(bookName, chapter);
    setLibraryOpen(false);
    setReader({
      book: bookName,
      chapter,
      totalChapters: info?.chapters ?? 1,
    });
  };

  const handleReaderBack = () => {
    setReader(null);
    setLibraryOpen(true);
  };

  const handleToggleChapter = (book: string, chapter: number) => {
    const completedBook = toggleChapter(book, chapter);
    if (completedBook) {
      toast.success('Parabéns!', { description: `Você completou o livro de ${book}!` });
    }
  };

  const handleAddMark = (text: string, book: string, chapter: number, verse: number, verseEnd?: number) => {
    addMark(createMark(text, book, chapter, verse, verseEnd));
  };

  const handleOpenMark = (mark: BookMark) => {
    setMarksOpen(false);
    openReader(mark.book, mark.chapter);
  };

  return (
    <>
      <Toaster position="top-center" theme={theme} richColors />
      <AppShell
        view={view}
        onNavigate={setView}
        onOpenSettings={() => setSettingsOpen(true)}
      >
        {view === 'home' ? (
          <HomeView
            marks={marks}
            percentage={percentage}
            countRead={countRead}
            planLabel={planLabel}
            userName={userName}
            devocionalCurrentDay={devocionalDay}
            devocionalTotalDays={DEVOCIONAL_TOTAL_DAYS}
            devocionalDay={devocionalDayData}
            devocionalIsComplete={devocionalIsComplete}
            onOpenDevocional={openDevocional}
            onOpenLibrary={() => setLibraryOpen(true)}
            onOpenMarks={() => setMarksOpen(true)}
            lastRead={lastRead}
            onOpenLastRead={() => {
              if (lastRead) openReader(lastRead.book, lastRead.chapter);
            }}
            memoriasPendingCount={memoriasPendingCount}
            onOpenMemorias={() => setMemoriasOpen(true)}
          />
        ) : (
          <BibleView
            userName={userName}
            percentage={percentage}
            countRead={countRead}
            selectedDay={safeSelectedDay}
            totalDays={planStats.totalDays}
            planDay={currentPlanDay}
            chaptersPerDay={planStats.chaptersPerDay}
            onDayChange={setSelectedDay}
            dailyReading={dailyReading}
            progress={progress}
            onToggleChapter={handleToggleChapter}
            onReadNow={openReader}
            onOpenLibrary={() => setLibraryOpen(true)}
          />
        )}
      </AppShell>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        userName={userName}
        onUserNameChange={setUserName}
        translationId={translationId}
        onTranslationChange={setTranslationId}
        theme={theme}
        onThemeChange={setTheme}
        planConfig={planConfig}
        onPlanConfigChange={setPlanConfig}
        readChapters={progress}
        percentage={percentage}
        planLabel={planLabel}
      />
      <LibraryModal
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        books={BOOKS}
        readChapters={progress}
        onSelectChapter={openReader}
      />
      <MarksModal
        open={marksOpen}
        onClose={() => setMarksOpen(false)}
        marks={marks}
        onRemoveMark={removeMark}
        onOpenMark={handleOpenMark}
      />
      <ErrorBoundary
        key={reader ? `${reader.book}-${reader.chapter}` : 'idle'}
        onError={(error) => {
          reportCrash('reader', error);
          setReader(null);
          toast.error('O leitor fechou após um erro inesperado.', { description: error.message });
        }}
      >
        <ReaderModal
          book={reader?.book ?? ''}
          chapter={reader?.chapter ?? 1}
          totalChapters={reader?.totalChapters ?? 1}
          translationId={translation.id}
          translationName={translation.name}
          onClose={() => setReader(null)}
          onBack={handleReaderBack}
          onTranslationChange={setTranslationId}
          isChapterRead={isChapterRead}
          onMarkAsRead={(b, c) => handleToggleChapter(b, c)}
          onAddMark={handleAddMark}
        />
      </ErrorBoundary>
      <DevocionalModal
        open={devocionalOpen}
        onClose={closeDevocional}
        initialDay={devocionalDay}
        onCompleteDay={completeDay}
      />
      <MemoriasModal
        open={memoriasOpen}
        onClose={() => setMemoriasOpen(false)}
        memorias={memorias}
        onAdd={addMemoria}
        onUpdate={updateMemoria}
        onRemove={removeMemoria}
        onConfirm={confirmMemoria}
      />
    </>
  );
}