import { useMemo, useState } from 'react';
import { Toaster, toast } from 'sonner';
import type { BookMark } from './types';
import { BOOKS, getBook } from './data/books';
import { getDayOfYear, getReadingForDay } from './lib/readingPlan';
import { createMark } from './lib/marks';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useReadingProgress } from './hooks/useReadingProgress';
import { useMarks } from './hooks/useMarks';
import { AppShell, type View } from './components/layout/AppShell';
import { HomeView } from './components/home/HomeView';
import { BibleView } from './components/bible/BibleView';
import { ReaderModal } from './components/modals/ReaderModal';
import { LibraryModal } from './components/modals/LibraryModal';
import { MarksModal } from './components/modals/MarksModal';
import { SettingsModal } from './components/modals/SettingsModal';

export default function App() {
  const [view, setView] = useState<View>('home');
  const [selectedDay, setSelectedDay] = useState(getDayOfYear);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [marksOpen, setMarksOpen] = useState(false);
  const [reader, setReader] = useState<{ book: string; chapter: number; totalChapters: number } | null>(null);
  const [userName, setUserName] = useLocalStorage('bibleUserName', '');

  const { progress, toggleChapter, isChapterRead, countRead, percentage } = useReadingProgress();
  const { marks, addMark, removeMark } = useMarks();

  const dailyReading = useMemo(() => getReadingForDay(selectedDay), [selectedDay]);

  const openReader = (bookName: string, chapter: number) => {
    const info = getBook(bookName);
    setLibraryOpen(false);
    setReader({
      book: bookName,
      chapter,
      totalChapters: info?.chapters ?? 1,
    });
  };

  const handleToggleChapter = (book: string, chapter: number) => {
    const completedBook = toggleChapter(book, chapter);
    if (completedBook) {
      toast.success('Parabéns!', { description: `Você completou o livro de ${book}!` });
    }
  };

  const handleAddMark = (text: string, book: string, chapter: number, verse: number) => {
    addMark(createMark(text, book, chapter, verse));
  };

  const handleOpenMark = (mark: BookMark) => {
    setMarksOpen(false);
    openReader(mark.book, mark.chapter);
  };

  return (
    <>
      <Toaster position="top-center" theme="dark" richColors />
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
            userName={userName}
            onOpenLibrary={() => setLibraryOpen(true)}
            onOpenMarks={() => setMarksOpen(true)}
          />
        ) : (
          <BibleView
            userName={userName}
            percentage={percentage}
            countRead={countRead}
            selectedDay={selectedDay}
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
      <ReaderModal
        book={reader?.book ?? ''}
        chapter={reader?.chapter ?? 1}
        totalChapters={reader?.totalChapters ?? 1}
        onClose={() => setReader(null)}
        isChapterRead={isChapterRead}
        onMarkAsRead={(b, c) => handleToggleChapter(b, c)}
        onAddMark={handleAddMark}
      />
    </>
  );
}