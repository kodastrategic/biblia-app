import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, BookOpen, Loader2, CheckCircle2, RefreshCw, Copy, Plus, Minus } from 'lucide-react';
import { fetchBibleChapter, validateBibleText } from '../utils/geminiApi';
import { toast } from 'sonner';

interface BibleReaderProps {
  isOpen: boolean;
  onClose: () => void;
  book: string;
  chapter: number;
  totalChapters: number;
  isRead: boolean;
  onMarkAsRead: () => void;
}

export function BibleReader({
  isOpen,
  onClose,
  book,
  chapter,
  totalChapters,
  isRead,
  onMarkAsRead,
}: BibleReaderProps) {
  const [currentChapter, setCurrentChapter] = useState(chapter);
  const [chapterText, setChapterText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(18);

  useEffect(() => {
    if (isOpen) {
      setCurrentChapter(chapter);
      document.body.style.overflow = 'hidden'; 
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, book, chapter]);

  useEffect(() => {
    if (isOpen) loadChapter();
  }, [isOpen, currentChapter]);

  const loadChapter = async (forceReload = false) => {
    setLoading(true);
    setError(null);
    try {
      const text = await fetchBibleChapter(book, currentChapter);
      setChapterText(text);
    } catch (err) {
      setError('Erro ao carregar o capitulo. Verifique sua conexao.');
    } finally {
      setLoading(false);
    }
  };

  // --- NOVA FUNÇÃO DE DIAGRAMAÇÃO INTELIGENTE ---
  const renderFormattedText = (text: string) => {
    // Divide o texto por qualquer sequência de números
    const parts = text.split(/(\d+)/);
    const elements = [];
    
    let currentVerseNumber = 0;
    let bufferText = ""; // Armazena o texto do versículo atual

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      
      // Se a parte for vazia (pode acontecer no split), ignora
      if (!part) continue;

      // Verifica se a parte é APENAS números
      const isNumber = /^\d+$/.test(part);

      if (isNumber) {
        const num = parseInt(part, 10);
        
        // LÓGICA DE CORREÇÃO:
        // Só consideramos que é um "Novo Versículo" se o número for:
        // 1. O número "1" (se ainda não começamos); OU
        // 2. Exatamente o sucessor do versículo anterior (ex: se estamos no 4, aceitamos o 5).
        // Isso impede que "930" (anos) seja lido como versículo, pois 930 não vem depois do 5.
        const isNextVerse = (currentVerseNumber === 0 && num === 1) || (num === currentVerseNumber + 1);

        if (isNextVerse) {
          // Se tínhamos texto acumulado do versículo anterior, salvamos agora
          if (currentVerseNumber > 0 && bufferText.trim()) {
            elements.push(
              <div key={currentVerseNumber} className="mb-4 flex gap-4 items-start group hover:bg-white/5 p-2 rounded-lg transition-colors">
                <span className="text-[#2FA4FF] font-sans font-bold text-sm mt-1 min-w-[20px] select-none opacity-70 group-hover:opacity-100">{currentVerseNumber}</span>
                <span className="flex-1 text-[#e2e8f0] leading-relaxed">{bufferText}</span>
              </div>
            );
          } else if (bufferText.trim()) {
             // Caso tenha texto ANTES do versículo 1 (títulos ou introduções), renderiza sem número
             elements.push(
                <div key="intro" className="mb-6 text-gray-400 italic text-center text-sm">{bufferText}</div>
             );
          }

          // Reseta o buffer e atualiza o número do versículo atual
          bufferText = "";
          currentVerseNumber = num;
        } else {
          // Se for um número solto no texto (ex: 930 anos), trata como texto normal
          bufferText += part;
        }
      } else {
        // Se não for número, é texto normal, adiciona ao buffer
        bufferText += part;
      }
    }

    // Não esquecer de renderizar o ÚLTIMO versículo que ficou no buffer
    if (currentVerseNumber > 0 && bufferText.trim()) {
      elements.push(
        <div key={currentVerseNumber} className="mb-4 flex gap-4 items-start group hover:bg-white/5 p-2 rounded-lg transition-colors">
          <span className="text-[#2FA4FF] font-sans font-bold text-sm mt-1 min-w-[20px] select-none opacity-70 group-hover:opacity-100">{currentVerseNumber}</span>
          <span className="flex-1 text-[#e2e8f0] leading-relaxed">{bufferText}</span>
        </div>
      );
    }

    // Se a lógica falhar ou o texto for muito curto, retorna o texto simples como fallback
    if (elements.length === 0) return <p className="text-[#e2e8f0] mb-4 whitespace-pre-wrap">{text}</p>;

    return elements;
  };
  // ----------------------------------------------

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 md:p-4 lg:p-10">
      <div 
        className="absolute inset-0 bg-black/98 backdrop-blur-sm" 
        onClick={onClose} 
      />

      <div className="relative w-full h-full max-w-5xl bg-[#0b161d] shadow-[0_0_60px_rgba(0,0,0,1)] md:rounded-2xl flex flex-col overflow-hidden border border-white/10">
        
        <div className="flex items-center justify-between p-4 md:p-6 bg-[#122835] border-b border-white/5">
          <div className="flex items-center gap-4">
            <BookOpen className="w-6 h-6 text-[#2FA4FF]" />
            <div>
              <h2 className="text-white font-bold text-lg md:text-xl">{book} {currentChapter}</h2>
              <p className="text-[10px] text-gray-400 uppercase tracking-tighter">NVI - Nova Versão Internacional</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setFontSize(s => Math.max(12, s-2))} className="p-2 text-gray-400 hover:text-white"><Minus size={18}/></button>
            <button onClick={() => setFontSize(s => Math.min(32, s+2))} className="p-2 text-gray-400 hover:text-white"><Plus size={18}/></button>
            <button 
              onClick={onMarkAsRead}
              className={`ml-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                isRead ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-white/5 text-gray-300 border-white/10'
              }`}
            >
              {isRead ? 'LIDO' : 'MARCAR'}
            </button>
            <button onClick={onClose} className="ml-2 p-2 text-gray-400 hover:text-white">
              <X size={30} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-12 bg-[#0b161d] custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="animate-spin text-[#2FA4FF] mb-4" size={40} />
              <p className="text-gray-500 text-xs tracking-widest uppercase">Buscando na NVI...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <p className="text-gray-400 mb-6">{error}</p>
              <button onClick={() => loadChapter(true)} className="px-6 py-2 bg-white/10 rounded-lg text-sm">Tentar Novamente</button>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              <div 
                className="font-serif leading-[1.8]"
                style={{ fontSize: `${fontSize}px` }}
              >
                {renderFormattedText(chapterText)}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 md:p-6 bg-[#122835] border-t border-white/5 flex justify-between items-center">
          <button 
            onClick={() => setCurrentChapter(c => Math.max(1, c-1))}
            disabled={currentChapter === 1}
            className="flex items-center gap-2 text-sm font-bold text-gray-400 disabled:opacity-10"
          >
            <ChevronLeft /> ANTERIOR
          </button>
          
          <span className="text-[10px] text-gray-500 font-mono">{currentChapter} / {totalChapters}</span>

          <button 
            onClick={() => setCurrentChapter(c => Math.min(totalChapters, c+1))}
            disabled={currentChapter === totalChapters}
            className="flex items-center gap-2 text-sm font-bold text-[#2FA4FF] disabled:opacity-10"
          >
            PRÓXIMO <ChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
}
