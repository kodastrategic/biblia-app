import { useState, useEffect } from 'react';
import { BookCard } from './components/BookCard';
import { DailyReadingCard } from './components/DailyReadingCard';
import { SettingsPanel } from './components/SettingsPanel';
import { BibleReader } from './components/BibleReader';
import { BibleLibrary } from './components/BibleLibrary';
import { Toaster, toast } from 'sonner';
import { getDayOfYear, getReadingForDay } from './utils/readingPlan';
import { Settings, Book as BibleIcon } from 'lucide-react';

interface Book {
  name: string;
  chapters: number;
  testament?: string;
  period?: string;
}

const books: Book[] = [
  { name: "Gênesis", chapters: 50, testament: "old", period: "~4000-1800 a.C." },
  { name: "Êxodo", chapters: 40, testament: "old", period: "~1446 a.C." },
  { name: "Levítico", chapters: 27, testament: "old", period: "~1445 a.C." },
  { name: "Números", chapters: 36, testament: "old", period: "~1445-1405 a.C." },
  { name: "Deuteronômio", chapters: 34, testament: "old", period: "~1405 a.C." },
  { name: "Josué", chapters: 24, testament: "old", period: "~1405-1385 a.C." },
  { name: "Juízes", chapters: 21, testament: "old", period: "~1380-1050 a.C." },
  { name: "Rute", chapters: 4, testament: "old", period: "~1100 a.C." },
  { name: "1 Samuel", chapters: 31, testament: "old", period: "~1100-1010 a.C." },
  { name: "2 Samuel", chapters: 24, testament: "old", period: "~1010-970 a.C." },
  { name: "1 Reis", chapters: 22, testament: "old", period: "~970-850 a.C." },
  { name: "2 Reis", chapters: 25, testament: "old", period: "~850-560 a.C." },
  { name: "1 Crônicas", chapters: 29, testament: "old", period: "~1000-970 a.C." },
  { name: "2 Crônicas", chapters: 36, testament: "old", period: "~970-538 a.C." },
  { name: "Esdras", chapters: 10, testament: "old", period: "~538-457 a.C." },
  { name: "Neemias", chapters: 13, testament: "old", period: "~445-420 a.C." },
  { name: "Ester", chapters: 10, testament: "old", period: "~483-473 a.C." },
  { name: "Jó", chapters: 42, testament: "old", period: "~2000-1800 a.C." },
  { name: "Salmos", chapters: 150, testament: "old", period: "~1440-400 a.C." },
  { name: "Provérbios", chapters: 31, testament: "old", period: "~950-700 a.C." },
  { name: "Eclesiastes", chapters: 12, testament: "old", period: "~935 a.C." },
  { name: "Cântico dos Cânticos", chapters: 8, testament: "old", period: "~965 a.C." },
  { name: "Isaías", chapters: 66, testament: "old", period: "~740-680 a.C." },
  { name: "Jeremias", chapters: 52, testament: "old", period: "~627-580 a.C." },
  { name: "Lamentações", chapters: 5, testament: "old", period: "~586 a.C." },
  { name: "Ezequiel", chapters: 48, testament: "old", period: "~593-571 a.C." },
  { name: "Daniel", chapters: 12, testament: "old", period: "~605-530 a.C." },
  { name: "Oséias", chapters: 14, testament: "old", period: "~755-715 a.C." },
  { name: "Joel", chapters: 3, testament: "old", period: "~835 a.C." },
  { name: "Amós", chapters: 9, testament: "old", period: "~760 a.C." },
  { name: "Obadias", chapters: 1, testament: "old", period: "~840 a.C." },
  { name: "Jonas", chapters: 4, testament: "old", period: "~760 a.C." },
  { name: "Miquéias", chapters: 7, testament: "old", period: "~735-700 a.C." },
  { name: "Naum", chapters: 3, testament: "old", period: "~663-612 a.C." },
  { name: "Habacuque", chapters: 3, testament: "old", period: "~607 a.C." },
  { name: "Sofonias", chapters: 3, testament: "old", period: "~630 a.C." },
  { name: "Ageu", chapters: 2, testament: "old", period: "~520 a.C." },
  { name: "Zacarias", chapters: 14, testament: "old", period: "~520-480 a.C." },
  { name: "Malaquias", chapters: 4, testament: "old", period: "~430 a.C." },
  { name: "Mateus", chapters: 28, testament: "new", period: "~4 a.C.-30 d.C." },
  { name: "Marcos", chapters: 16, testament: "new", period: "~27-30 d.C." },
  { name: "Lucas", chapters: 24, testament: "new", period: "~4 a.C.-30 d.C." },
  { name: "João", chapters: 21, testament: "new", period: "~27-30 d.C." },
  { name: "Atos", chapters: 28, testament: "new", period: "~30-62 d.C." },
  { name: "Romanos", chapters: 16, testament: "new", period: "~57 d.C." },
  { name: "1 Coríntios", chapters: 16, testament: "new", period: "~55 d.C." },
  { name: "2 Coríntios", chapters: 13, testament: "new", period: "~56 d.C." },
  { name: "Gálatas", chapters: 6, testament: "new", period: "~49 d.C." },
  { name: "Efésios", chapters: 6, testament: "new", period: "~60 d.C." },
  { name: "Filipenses", chapters: 4, testament: "new", period: "~61 d.C." },
  { name: "Colossenses", chapters: 4, testament: "new", period: "~60 d.C." },
  { name: "1 Tessalonicenses", chapters: 5, testament: "new", period: "~51 d.C." },
  { name: "2 Tessalonicenses", chapters: 3, testament: "new", period: "~51 d.C." },
  { name: "1 Timóteo", chapters: 6, testament: "new", period: "~63 d.C." },
  { name: "2 Timóteo", chapters: 4, testament: "new", period: "~67 d.C." },
  { name: "Tito", chapters: 3, testament: "new", period: "~63 d.C." },
  { name: "Filemom", chapters: 1, testament: "new", period: "~60 d.C." },
  { name: "Hebreus", chapters: 13, testament: "new", period: "~67 d.C." },
  { name: "Tiago", chapters: 5, testament: "new", period: "~45 d.C." },
  { name: "1 Pedro", chapters: 5, testament: "new", period: "~63 d.C." },
  { name: "2 Pedro", chapters: 3, testament: "new", period: "~66 d.C." },
  { name: "1 João", chapters: 5, testament: "new", period: "~90 d.C." },
  { name: "2 João", chapters: 1, testament: "new", period: "~90 d.C." },
  { name: "3 João", chapters: 1, testament: "new", period: "~90 d.C." },
  { name: "Judas", chapters: 1, testament: "new", period: "~65 d.C." },
  { name: "Apocalipse", chapters: 22, testament: "new", period: "~95 d.C." }
];

export default function App() {
  const [readChapters, setReadChapters] = useState<Record<string, Set<number>>>({});
  const [selectedDay, setSelectedDay] = useState<number>(getDayOfYear());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [readerBook, setReaderBook] = useState('');
  const [readerChapter, setReaderChapter] = useState(1);
  const [readerTotalChapters, setReaderTotalChapters] = useState(1);

  useEffect(() => {
    const saved = localStorage.getItem('bibleReadingProgress');
    if (saved) {
      const parsed = JSON.parse(saved);
      const restored: Record<string, Set<number>> = {};
      for (const [bookName, chapters] of Object.entries(parsed)) {
        restored[bookName] = new Set(chapters as number[]);
      }
      setReadChapters(restored);
    }
    const savedName = localStorage.getItem('bibleUserName');
    if (savedName) setUserName(savedName);
  }, []);

  const saveProgress = (newReadChapters: Record<string, Set<number>>) => {
    const toSave: Record<string, number[]> = {};
    for (const [bookName, chapters] of Object.entries(newReadChapters)) {
      toSave[bookName] = Array.from(chapters);
    }
    localStorage.setItem('bibleReadingProgress', JSON.stringify(toSave));
  };

  const toggleChapter = (bookName: string, chapter: number) => {
    setReadChapters(prev => {
      const newState = { ...prev };
      if (!newState[bookName]) newState[bookName] = new Set();
      else newState[bookName] = new Set(newState[bookName]);
      const wasRead = newState[bookName].has(chapter);
      if (wasRead) newState[bookName].delete(chapter);
      else newState[bookName].add(chapter);
      const book = books.find(b => b.name === bookName);
      if (book && !wasRead && newState[bookName].size === book.chapters) {
        toast.success('🎉 Parabéns!', { description: `Você completou o livro de ${bookName}!` });
      }
      saveProgress(newState);
      return newState;
    });
  };

  const handleReadNow = (bookName: string, chapter: number) => {
    const bookInfo = books.find(b => b.name === bookName);
    const actualTotal = bookInfo ? bookInfo.chapters : 1;
    setReaderBook(bookName);
    setReaderChapter(chapter);
    setReaderTotalChapters(actualTotal);
    setIsReaderOpen(true);
    setIsLibraryOpen(false);
  };

  const totalChaptersCount = books.reduce((sum, book) => sum + book.chapters, 0);
  const readChaptersCount = Object.values(readChapters).reduce((sum, set) => sum + set.size, 0);
  const readingPercentage = totalChaptersCount > 0 ? Math.round((readChaptersCount / totalChaptersCount) * 100) : 0;
  const dailyReading = getReadingForDay(selectedDay);

  return (
    <div className="min-h-screen bg-[#050b0f] text-white flex flex-col font-sans selection:bg-[#2FA4FF]/30">
      <Toaster position="top-center" theme="dark" />

      {/* TOPBAR ISOLADA - Z-INDEX ABSOLUTO */}
      <nav className="fixed top-0 left-0 right-0 h-16 md:h-20 bg-black/40 backdrop-blur-xl border-b border-white/5 z-[9999] flex items-center justify-center px-6">
        <div className="w-full max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-default">
            <div className="w-8 h-8 bg-gradient-to-tr from-[#2FA4FF] to-[#8B5CF6] rounded-lg flex items-center justify-center shadow-lg shadow-[#2FA4FF]/20">
              <BibleIcon size={18} className="text-white" />
            </div>
            <span className="font-serif italic text-lg md:text-xl font-semibold tracking-tight text-white/90">
              Bible Life
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLibraryOpen(true)}
              className="h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[11px] font-bold uppercase tracking-widest transition-all active:scale-95"
            >
              Bíblia
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-95"
            >
              <Settings size={18} className="text-white/70" />
            </button>
          </div>
        </div>
      </nav>

      <main className="w-full max-w-6xl mx-auto px-6 pt-24 md:pt-32 pb-24 space-y-20">
        
        {/* HERO SECTION - REESTRUTURADA */}
        <header className="max-w-3xl space-y-6">
          <h1 className="text-4xl md:text-6xl font-light italic leading-[1.1] text-white/95" style={{ fontFamily: "'Crimson Text', serif" }}>
            Um dia por vez.<br />
            Um texto por dia.<br />
            Uma vida transformada.
          </h1>
          <div className="flex items-center gap-4">
            <div className="h-px w-12 bg-[#2FA4FF]" />
            <p className="text-sm md:text-base text-white/60 leading-relaxed max-w-md">
              A Palavra diária amplia o entendimento e traz a paz que alicerça cada decisão.
            </p>
          </div>
        </header>

        {/* PROGRESSO - REESTRUTURADO */}
        <section className="relative p-8 md:p-12 rounded-[2rem] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#2FA4FF]/10 blur-[100px] -z-10" />
          
          <div className="relative space-y-4">
            <p className="text-[10px] md:text-xs font-bold tracking-[0.4em] uppercase text-[#2FA4FF] opacity-80">
              Progresso de Leitura
            </p>
            <h2 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-white to-[#2FA4FF]/50 bg-clip-text text-transparent leading-tight" style={{ fontFamily: "'Crimson Text', serif" }}>
              {userName ? `${userName.split(' ')[0].toUpperCase()}, VOCÊ JÁ LEU ${readingPercentage}%` : `VOCÊ JÁ LEU ${readingPercentage}%`}
            </h2>
          </div>
        </section>

        {/* LEITURA DIÁRIA */}
        <section>
          <DailyReadingCard
            currentDay={selectedDay}
            dailyReading={dailyReading}
            onDayChange={setSelectedDay}
            readChapters={readChapters}
            onToggleChapter={toggleChapter}
            onReadNow={handleReadNow}
          />
        </section>

        {/* BIBLIOTECA - REORGANIZADA EM SEÇÕES LIMPAS */}
        <div className="space-y-32">
          <section className="space-y-12">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 whitespace-nowrap">Antigo Testamento</span>
              <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {books.filter(b => b.testament === "old").map((book) => (
                <BookCard key={book.name} book={book} readChapters={readChapters[book.name] || new Set()} onToggleChapter={(chapter) => toggleChapter(book.name, chapter)} onReadNow={handleReadNow} />
              ))}
            </div>
          </section>

          <section className="space-y-12">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 whitespace-nowrap">Novo Testamento</span>
              <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {books.filter(b => b.testament === "new").map((book) => (
                <BookCard key={book.name} book={book} readChapters={readChapters[book.name] || new Set()} onToggleChapter={(chapter) => toggleChapter(book.name, chapter)} onReadNow={handleReadNow} />
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* MODAIS E OVERLAYS */}
      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} userName={userName} onUserNameChange={(n) => { setUserName(n); localStorage.setItem('bibleUserName', n); }} />
      <BibleLibrary isOpen={isLibraryOpen} onClose={() => setIsLibraryOpen(false)} books={books as any} readChapters={readChapters} onSelectChapter={handleReadNow} />
      <BibleReader
        isOpen={isReaderOpen}
        onClose={() => setIsReaderOpen(false)}
        book={readerBook}
        chapter={readerChapter}
        totalChapters={readerTotalChapters}
        readChapters={readChapters}
        onMarkAsRead={(b, c) => toggleChapter(b, c)}
      />
    </div>
  );
}
