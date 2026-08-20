import { useCallback, useEffect, useRef, useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Loader2,
  CheckCircle2,
  Minus,
  Plus,
  Heart,
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchChapter } from '../../lib/bible';
import { cn } from '../../lib/cn';
import { Modal } from '../ui/Modal';

interface ReaderModalProps {
  book: string;
  chapter: number;
  totalChapters: number;
  onClose: () => void;
  isChapterRead: (book: string, chapter: number) => boolean;
  onMarkAsRead: (book: string, chapter: number) => void;
  onAddMark: (text: string, book: string, chapter: number, verse: number) => void;
}

interface SelectionInfo {
  text: string;
  verse: number;
}

export function ReaderModal({
  book,
  chapter,
  totalChapters,
  onClose,
  isChapterRead,
  onMarkAsRead,
  onAddMark,
}: ReaderModalProps) {
  const [currentChapter, setCurrentChapter] = useState(chapter);
  const [verses, setVerses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(18);
  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadId = useRef(0);
  const selectionRef = useRef<SelectionInfo | null>(null);

  useEffect(() => {
    if (!book) return;
    setCurrentChapter(chapter);
  }, [book, chapter]);

  useEffect(() => {
    if (!book) return;
    const id = ++loadId.current;
    const run = async () => {
      setLoading(true);
      setError(null);
      selectionRef.current = null;
      setSelection(null);
      try {
        const data = await fetchChapter(book, currentChapter);
        if (loadId.current !== id) return;
        setVerses(data);
      } catch (err) {
        if (loadId.current !== id) return;
        setError(err instanceof Error ? err.message : 'Erro ao carregar o capítulo.');
      } finally {
        if (loadId.current === id) setLoading(false);
      }
    };
    void run();
    scrollRef.current?.scrollTo({ top: 0 });
  }, [book, currentChapter, reloadKey]);

  const isRead = isChapterRead(book, currentChapter);

  useEffect(() => {
    if (!book) return;
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        selectionRef.current = null;
        setSelection(null);
        return;
      }
      const text = sel.toString().replace(/\s+/g, ' ').trim();
      if (!text) {
        selectionRef.current = null;
        setSelection(null);
        return;
      }
      const range = sel.getRangeAt(0);
      const node: Node = range.commonAncestorContainer;
      const el = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;
      const verseEl = el?.closest('[data-verse]') as HTMLElement | null;
      const verse = verseEl ? Number(verseEl.dataset.verse) : 0;
      if (!verse) {
        selectionRef.current = null;
        setSelection(null);
        return;
      }
      selectionRef.current = { text, verse };
      setSelection({ text, verse });
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [book]);

  const clearSelection = useCallback(() => {
    selectionRef.current = null;
    window.getSelection()?.removeAllRanges();
    setSelection(null);
  }, []);

  const handleMark = () => {
    const current = selectionRef.current;
    if (!current) return;
    onAddMark(current.text, book, currentChapter, current.verse);
    toast.success('Texto favoritado!', {
      description: `Salvo em marcações · ${book} ${currentChapter}:${current.verse}`,
    });
    clearSelection();
  };

  if (!book) return null;

  return (
    <Modal open onClose={onClose} position="full">
      <div className="relative w-full h-full max-w-5xl mx-auto bg-ink-2 border-x border-line flex flex-col md:my-6 md:rounded-2xl md:overflow-hidden md:shadow-[0_0_80px_rgba(0,0,0,0.8)]">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4 md:px-6 py-4 bg-panel border-b border-line shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-brand-soft border border-brand/30 text-brand shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-fg leading-tight truncate">
                {book} {currentChapter}
              </h2>
              <p className="text-[10px] text-dim uppercase tracking-wider mt-0.5">
                NVI · Nova Versão Internacional
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setFontSize((s) => Math.max(12, s - 2))}
              className="p-2 rounded-lg text-muted hover:text-fg hover:bg-white/5 transition-colors"
              aria-label="Diminuir fonte"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setFontSize((s) => Math.min(32, s + 2))}
              className="p-2 rounded-lg text-muted hover:text-fg hover:bg-white/5 transition-colors"
              aria-label="Aumentar fonte"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => onMarkAsRead(book, currentChapter)}
              className={cn(
                'ml-1 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95',
                isRead
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-white/5 text-muted border-line hover:text-fg',
              )}
            >
              {isRead ? 'LIDO' : 'MARCAR COMO LIDO'}
            </button>
            <button
              onClick={handleMark}
              disabled={!selection}
              title={
                selection
                  ? `Favoritar trecho · ${book} ${currentChapter}:${selection.verse}`
                  : 'Selecione um texto para favoritar'
              }
              aria-label="Favoritar trecho selecionado"
              className={cn(
                'ml-1 p-2 rounded-xl border transition-all active:scale-95',
                selection
                  ? 'text-red-400 border-red-400/30 bg-red-500/10 shadow-[0_0_16px_rgba(248,113,113,0.35)]'
                  : 'text-dim border-line hover:text-fg hover:bg-white/5 disabled:cursor-not-allowed',
              )}
            >
              <Heart className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="ml-1 p-2 rounded-lg text-muted hover:text-fg hover:bg-white/5 transition-colors"
              aria-label="Fechar leitor"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          ref={scrollRef}
          onScroll={clearSelection}
          className="flex-1 overflow-y-auto scrollbar-thin px-5 md:px-14 py-8 md:py-12"
        >
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-brand" size={36} />
              <p className="text-xs uppercase tracking-widest text-dim">Carregando capítulo...</p>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-5 px-6">
              <p className="text-muted text-sm">{error}</p>
              <button
                onClick={() => setReloadKey((k) => k + 1)}
                className="px-5 py-2 rounded-xl border border-line text-sm text-fg hover:bg-white/5"
              >
                Tentar novamente
              </button>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              <h3 className="text-center font-serif italic text-2xl md:text-3xl text-fg mb-10">
                {book} {currentChapter}
              </h3>
              <div className="font-serif leading-[1.95]" style={{ fontSize: `${fontSize}px` }}>
                {verses.map((verseText, i) => (
                  <p
                    key={i}
                    data-verse={i + 1}
                    className="mb-5 text-fg/90 transition-colors hover:bg-white/[0.03] rounded-lg px-1 py-0.5"
                  >
                    <sup className="text-brand font-sans font-semibold text-[0.6em] mr-2 select-none">
                      {i + 1}
                    </sup>
                    {verseText}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-between px-4 md:px-6 py-4 bg-panel border-t border-line">
          <button
            onClick={() => setCurrentChapter((c) => Math.max(1, c - 1))}
            disabled={currentChapter === 1}
            className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-fg transition-colors disabled:opacity-20 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-4 h-4" />
            ANTERIOR
          </button>
          <span className="text-xs text-dim font-mono tabular-nums">
            {currentChapter} / {totalChapters}
          </span>
          <button
            onClick={() => setCurrentChapter((c) => Math.min(totalChapters, c + 1))}
            disabled={currentChapter === totalChapters}
            className="inline-flex items-center gap-2 text-sm font-bold text-brand hover:text-brand-strong transition-colors disabled:opacity-20 disabled:pointer-events-none"
          >
            PRÓXIMO
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Modal>
  );
}