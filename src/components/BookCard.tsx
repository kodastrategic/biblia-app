interface BookCardProps {
  book: {
    name: string;
    chapters: number;
    period?: string;
  };
  readChapters: Set<number>;
  onToggleChapter: (chapter: number) => void;
}

export function BookCard({ book, readChapters, onToggleChapter }: BookCardProps) {
  const chapters = Array.from({ length: book.chapters }, (_, i) => i + 1);
  const progress = (readChapters.size / book.chapters) * 100;

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 md:p-6 border border-white/10 hover:border-white/20 transition-all">
      {/* Book Title */}
      <div className="mb-4">
        <h3 className="text-base md:text-lg mb-1">{book.name}</h3>
        {book.period && (
          <p className="text-[10px] md:text-xs text-[#2FA4FF] mb-2 italic">
            📅 {book.period}
          </p>
        )}
        <div className="flex items-center gap-2">
          <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#2FA4FF] to-[#8B5CF6] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-[#DADADA]">
            {readChapters.size}/{book.chapters}
          </span>
        </div>
      </div>

      {/* Chapter Grid */}
      <div className="grid grid-cols-6 gap-1.5">
        {chapters.map((chapter) => {
          const isRead = readChapters.has(chapter);
          return (
            <button
              key={chapter}
              onClick={() => onToggleChapter(chapter)}
              className={`
                w-full aspect-square flex items-center justify-center text-[13px] md:text-[15px] font-medium
                border rounded transition-all
                ${isRead 
                  ? 'bg-gradient-to-br from-[#2FA4FF] to-[#8B5CF6] border-transparent text-white' 
                  : 'border-white/30 text-white hover:border-white/60 hover:bg-white/5'
                }
              `}
              title={`Capítulo ${chapter}`}
            >
              {chapter}
            </button>
          );
        })}
      </div>
    </div>
  );
}