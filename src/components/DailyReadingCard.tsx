import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, CheckCircle2, Circle, BookOpen } from 'lucide-react';
import { DailyReading } from '../utils/readingPlan';

interface DailyReadingCardProps {
  currentDay: number;
  dailyReading: DailyReading;
  onDayChange: (day: number) => void;
  readChapters: Record<string, Set<number>>;
  onToggleChapter: (book: string, chapter: number) => void;
  onReadNow: (book: string, chapter: number, totalChapters: number) => void;
}

export function DailyReadingCard({
  currentDay,
  dailyReading,
  onDayChange,
  readChapters,
  onToggleChapter,
  onReadNow,
}: DailyReadingCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!dailyReading) return null;

  // Calcular progresso do dia
  const totalChaptersToday = dailyReading.readings.reduce(
    (sum, reading) => sum + reading.chapters.length,
    0
  );
  
  const completedChaptersToday = dailyReading.readings.reduce((sum, reading) => {
    const bookChapters = readChapters[reading.book] || new Set();
    const completed = reading.chapters.filter(ch => bookChapters.has(ch)).length;
    return sum + completed;
  }, 0);

  const dayProgress = totalChaptersToday > 0 
    ? Math.round((completedChaptersToday / totalChaptersToday) * 100) 
    : 0;

  const isDayComplete = dayProgress === 100;

  return (
    <div className="bg-gradient-to-br from-[#2FA4FF]/10 to-[#8B5CF6]/10 backdrop-blur-sm rounded-2xl p-4 md:p-8 border border-white/20 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 md:w-6 md:h-6 text-[#2FA4FF]" />
          <div>
            <h3 className="text-xs md:text-sm text-[#DADADA] uppercase tracking-wider">
              Leitura do Dia
            </h3>
            <p className="text-lg md:text-2xl mt-1">Dia {currentDay} de 365</p>
          </div>
        </div>
        
        {/* Day Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onDayChange(Math.max(1, currentDay - 1))}
            disabled={currentDay === 1}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Dia anterior"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <span className="text-xs md:text-sm text-[#DADADA] min-w-[60px] text-center">
            Dia {currentDay}
          </span>
          <button
            onClick={() => onDayChange(Math.min(365, currentDay + 1))}
            disabled={currentDay === 365}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Próximo dia"
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs md:text-sm text-[#DADADA]">
            Progresso de hoje
          </span>
          <span className="text-xs md:text-sm font-medium">
            {completedChaptersToday}/{totalChaptersToday} capítulos
          </span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#2FA4FF] to-[#8B5CF6] transition-all duration-500"
            style={{ width: `${dayProgress}%` }}
          />
        </div>
        {isDayComplete && (
          <p className="text-xs md:text-sm text-[#2FA4FF] mt-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Dia completo! Parabéns! 🎉
          </p>
        )}
      </div>

      {/* Reading List */}
      <div className="space-y-4">
        {dailyReading.readings.map((reading, idx) => {
          const bookChapters = readChapters[reading.book] || new Set();
          const completedInBook = reading.chapters.filter(ch => 
            bookChapters.has(ch)
          ).length;
          
          return (
            <div
              key={`${reading.book}-${idx}`}
              className="bg-white/5 rounded-lg p-4 border border-white/10"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-sm md:text-base mb-1">{reading.book}</h4>
                  <p className="text-xs text-[#DADADA]">
                    {completedInBook}/{reading.chapters.length} capítulos lidos
                  </p>
                </div>
                <button
                  onClick={() => onReadNow(reading.book, reading.chapters[0], reading.chapters.length)}
                  className="px-3 py-1.5 rounded-md text-xs md:text-sm bg-gradient-to-r from-[#2FA4FF] to-[#8B5CF6] hover:opacity-90 text-white transition-opacity flex items-center gap-1.5"
                  title="Abrir leitor bíblico"
                >
                  <BookOpen className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden md:inline">Ler Agora</span>
                </button>
              </div>
              
              {/* Chapter List */}
              <div className="flex flex-wrap gap-2">
                {reading.chapters.map((chapter) => {
                  const isRead = bookChapters.has(chapter);
                  return (
                    <button
                      key={chapter}
                      onClick={() => onToggleChapter(reading.book, chapter)}
                      className={`
                        px-3 py-1.5 rounded-md text-xs md:text-sm transition-all
                        flex items-center gap-1.5
                        ${isRead
                          ? 'bg-gradient-to-r from-[#2FA4FF] to-[#8B5CF6] text-white'
                          : 'bg-white/10 text-white hover:bg-white/20'
                        }
                      `}
                    >
                      {isRead ? (
                        <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4" />
                      ) : (
                        <Circle className="w-3 h-3 md:w-4 md:h-4" />
                      )}
                      Cap. {chapter}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick tip */}
      <div className="mt-6 p-3 bg-white/5 rounded-lg border border-[#2FA4FF]/30">
        <p className="text-xs text-[#DADADA] italic">
          💡 Dica: Complete a leitura do dia para manter sua sequência e transformar isso em um hábito diário!
        </p>
      </div>
    </div>
  );
}