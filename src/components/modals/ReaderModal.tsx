import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  BookOpen,
  Loader2,
  Minus,
  Plus,
  Heart,
  Play,
  Pause,
  Square,
  Volume2,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchChapter } from '../../lib/bible';
import { cn } from '../../lib/cn';
import { TRANSLATIONS, getTranslation } from '../../data/translations';
import { isBrazilianVoice, isPortugueseVoice, rankVoices, voiceGender, voiceLabel, GENDER_ORDER, genderMark } from '../../lib/tts';
import { useTTS } from '../../hooks/useTTS';
import { PIPER_VOICE_SENTINEL, PIPER_VOICE_NAME, warmUpPiper } from '../../lib/piperTTS';
import { Modal } from '../ui/Modal';

interface ReaderModalProps {
  book: string;
  chapter: number;
  totalChapters: number;
  translationId: string;
  translationName: string;
  onClose: () => void;
  onBack: () => void;
  onTranslationChange: (id: string) => void;
  isChapterRead: (book: string, chapter: number) => boolean;
  onMarkAsRead: (book: string, chapter: number) => void;
  onAddMark: (text: string, book: string, chapter: number, verse: number, verseEnd?: number) => void;
  onChapterViewed: (book: string, chapter: number) => void;
}

interface SelectionInfo {
  text: string;
  verse: number;
  verseEnd?: number;
}

function verseFromNode(node: Node | null): number {
  if (!node) return 0;
  const el = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : (node.parentElement as Element | null);
  const verseEl = el?.closest?.('[data-verse]') as HTMLElement | null;
  return verseEl ? Number(verseEl.dataset.verse) : 0;
}

function selectionReference(book: string, chapter: number, verse: number, verseEnd?: number): string {
  return verseEnd && verseEnd > verse ? `${book} ${chapter}:${verse}-${verseEnd}` : `${book} ${chapter}:${verse}`;
}

export function ReaderModal({
  book,
  chapter,
  totalChapters,
  translationId,
  translationName,
  onClose,
  onBack,
  onTranslationChange,
  isChapterRead,
  onMarkAsRead,
  onAddMark,
  onChapterViewed,
}: ReaderModalProps) {
  const [currentChapter, setCurrentChapter] = useState(chapter);
  const [verses, setVerses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(18);
  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [translationOpen, setTranslationOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadId = useRef(0);
  const selectionRef = useRef<SelectionInfo | null>(null);

  const tts = useTTS();
  const {
    supported,
    voices: ttsVoices,
    state: ttsState,
    activeVerse,
    voiceURI,
    rate,
    autoAdvance,
    continuous,
    continuousProgress,
    piperStatus,
    play,
    pause: pauseTts,
    resume: resumeTts,
    stop: stopTts,
    setVoiceURI,
    setRate,
    setAutoAdvance,
    setContinuous,
  } = tts;
  const isPiperSelected = voiceURI === PIPER_VOICE_SENTINEL;
  const [voiceOpen, setVoiceOpen] = useState(false);
  const pendingAdvanceRef = useRef<number | null>(null);

  const ptVoices = useMemo(() => {
    const pt = ttsVoices.filter(isPortugueseVoice);
    const br = pt.filter(isBrazilianVoice);
    const source = br.length ? br : pt;
    return rankVoices(source).sort(
      (a, b) => GENDER_ORDER[voiceGender(a)] - GENDER_ORDER[voiceGender(b)],
    );
  }, [ttsVoices]);

  useEffect(() => {
    if (!book) return;
    if (currentChapter !== chapter) setCurrentChapter(chapter);
    stopTts();
  }, [book, chapter, stopTts]);

  useEffect(() => {
    if (!book || !currentChapter) return;
    onChapterViewed(book, currentChapter);
  }, [book, currentChapter, onChapterViewed]);

  useEffect(() => {
    if (!book) stopTts();
  }, [book, stopTts]);

  useEffect(() => {
    if (!book) return;
    const id = ++loadId.current;
    const run = async () => {
      setLoading(true);
      setError(null);
      selectionRef.current = null;
      setSelection(null);
      try {
        const data = await fetchChapter(book, currentChapter, translationId);
        if (loadId.current !== id) return;
        setVerses(data);
        if (pendingAdvanceRef.current !== null && pendingAdvanceRef.current === currentChapter) {
          pendingAdvanceRef.current = null;
          play(data, 0, handleChapterEnd);
        }
      } catch (err) {
        if (loadId.current !== id) return;
        setError(err instanceof Error ? err.message : 'Erro ao carregar o capítulo.');
      } finally {
        if (loadId.current === id) setLoading(false);
      }
    };
    void run();
    scrollRef.current?.scrollTo({ top: 0 });
  }, [book, currentChapter, reloadKey, translationId]);

  const handleChapterEnd = useCallback(() => {
    if (!autoAdvance) return;
    if (currentChapter >= totalChapters) return;
    pendingAdvanceRef.current = currentChapter + 1;
    setCurrentChapter((c) => (c >= totalChapters ? c : c + 1));
  }, [autoAdvance, currentChapter, totalChapters]);

  const togglePlayback = () => {
    if (ttsState === 'playing') {
      pauseTts();
      return;
    }
    if (ttsState === 'paused') {
      resumeTts();
      return;
    }
    if (!verses.length) return;
    play(verses, 0, handleChapterEnd);
  };

  const handleStopAudio = () => {
    pendingAdvanceRef.current = null;
    stopTts();
  };

  const handleVerseClick = (index: number) => {
    if (!verses.length) return;
    const sel = window.getSelection();
    if (sel && sel.toString().trim()) return;
    if (ttsState === 'playing' && activeVerse === index) return;
    play(verses, index, handleChapterEnd);
  };

  const changeRate = (delta: number) => {
    const next = Math.min(1.6, Math.max(0.6, Math.round((rate + delta) * 10) / 10));
    setRate(next);
    if (ttsState === 'playing' && activeVerse >= 0) {
      window.setTimeout(() => {
        play(verses, activeVerse, handleChapterEnd);
      }, 0);
    }
  };

  const handleVoicePick = (voiceUri: string | null) => {
    setVoiceURI(voiceUri);
    setVoiceOpen(false);
    if (voiceUri === PIPER_VOICE_SENTINEL) warmUpPiper();
    if (ttsState === 'playing' && activeVerse >= 0) {
      window.setTimeout(() => {
        play(verses, activeVerse, handleChapterEnd);
      }, 0);
    }
  };

  const goPrevChapter = () => {
    pendingAdvanceRef.current = null;
    stopTts();
    setCurrentChapter((c) => Math.max(1, c - 1));
  };

  const goNextChapter = () => {
    pendingAdvanceRef.current = null;
    stopTts();
    setCurrentChapter((c) => Math.min(totalChapters, c + 1));
  };

  useEffect(() => {
    if (activeVerse < 0) return;
    const container = scrollRef.current;
    if (!container) return;
    const el = container.querySelector(`[data-verse="${activeVerse + 1}"]`);
    if (!el) return;
    const cRect = container.getBoundingClientRect();
    const vRect = el.getBoundingClientRect();
    if (vRect.top < cRect.top || vRect.bottom > cRect.bottom) {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [activeVerse]);

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
      const verseStart = verseFromNode(range.startContainer);
      const verseEnd = verseFromNode(range.endContainer);
      if (!verseStart || !verseEnd) {
        selectionRef.current = null;
        setSelection(null);
        return;
      }
      const start = Math.min(verseStart, verseEnd);
      const end = Math.max(verseStart, verseEnd);
      const info: SelectionInfo =
        end > start ? { text, verse: start, verseEnd: end } : { text, verse: start };
      selectionRef.current = info;
      setSelection(info);
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
    onAddMark(current.text, book, currentChapter, current.verse, current.verseEnd);
    toast.success('Texto favoritado!', {
      description: `Salvo em marcações · ${selectionReference(book, currentChapter, current.verse, current.verseEnd)}`,
    });
    clearSelection();
  };

  const handleTranslationPick = (id: string) => {
    if (id !== translationId) {
      stopTts();
      onTranslationChange(id);
      const t = getTranslation(id);
      toast.success('Tradução alterada', {
        description: `${t.name} (${t.id.toUpperCase()}) · capítulo recarregado.`,
      });
    }
    setTranslationOpen(false);
  };

  if (!book) return null;

  return (
    <Modal open onClose={onClose} position="full">
      <div className="relative w-full h-full max-w-5xl mx-auto bg-ink-2 border-x border-line flex flex-col md:my-6 md:rounded-2xl md:overflow-hidden md:shadow-[0_0_80px_rgba(0,0,0,0.8)]">
        {/* Header */}
        <div className="shrink-0 bg-panel border-b border-line">
          {/* Linha 1: título + fechar */}
          <div className="flex items-center justify-between gap-3 px-4 md:px-6 pt-4 pb-2.5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-brand-soft border border-brand/30 text-brand shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold text-fg leading-tight truncate text-lg">
                  {book} {currentChapter}
                </h2>
                <p className="text-[10px] text-dim uppercase tracking-wider mt-0.5">
                  Capítulo {currentChapter} de {totalChapters}
                </p>
              </div>
            </div>
            <button
              onClick={onBack}
              className="shrink-0 p-2 rounded-lg text-muted hover:text-fg hover:bg-white/5 transition-colors"
              aria-label="Voltar para biblioteca"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Linha 2: barra de controles */}
          <div className="flex items-center justify-between gap-2 px-4 md:px-6 pb-3.5">
            <div className="relative min-w-0">
              <button
                onClick={() => setTranslationOpen((o) => !o)}
                className="inline-flex items-center gap-2 max-w-full px-3 py-2 rounded-xl border border-line bg-white/5 hover:border-brand/40 text-left transition-colors"
                aria-haspopup="listbox"
                aria-expanded={translationOpen}
              >
                <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-brand-soft border border-brand/30 text-brand text-[10px] font-bold">
                  {translationId.toUpperCase()}
                </span>
                <span className="text-xs font-semibold text-fg truncate max-w-[26vw] md:max-w-[250px]">
                  {translationName}
                </span>
                <ChevronDown
                  className={cn('shrink-0 w-3.5 h-3.5 text-muted transition-transform', translationOpen && 'rotate-180')}
                />
              </button>

              {translationOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setTranslationOpen(false)} />
                  <div
                    role="listbox"
                    className="absolute left-0 top-full mt-2 z-20 w-64 max-h-72 overflow-y-auto scrollbar-thin rounded-2xl border border-line bg-panel-2 shadow-2xl shadow-black/50 py-1.5 animate-scale-in"
                  >
                    {TRANSLATIONS.map((t) => {
                      const active = t.id === translationId;
                      return (
                        <button
                          key={t.id}
                          role="option"
                          aria-selected={active}
                          onClick={() => handleTranslationPick(t.id)}
                          className={cn(
                            'w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-left transition-colors',
                            active ? 'bg-brand-soft' : 'hover:bg-white/5',
                          )}
                        >
                          <span className="min-w-0">
                            <span className="block text-xs font-semibold text-fg truncate">
                              <span className={cn('text-[10px] font-bold mr-1.5', active ? 'text-brand' : 'text-dim')}>
                                {t.id.toUpperCase()}
                              </span>
                              {t.name}
                            </span>
                            <span className="block text-[10px] text-dim mt-0.5">
                              {t.publisher ? `Editora ${t.publisher}` : 'Domínio público'}
                            </span>
                          </span>
                          {active && <Check className="w-3.5 h-3.5 text-brand shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <div className="flex items-center gap-0.5 rounded-xl border border-line bg-white/5 p-0.5">
                <button
                  onClick={() => setFontSize((s) => Math.max(12, s - 2))}
                  className="p-1.5 rounded-lg text-muted hover:text-fg hover:bg-white/5 transition-colors"
                  aria-label="Diminuir fonte"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-mono text-dim tabular-nums px-0.5 select-none">
                  {fontSize}
                </span>
                <button
                  onClick={() => setFontSize((s) => Math.min(32, s + 2))}
                  className="p-1.5 rounded-lg text-muted hover:text-fg hover:bg-white/5 transition-colors"
                  aria-label="Aumentar fonte"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => onMarkAsRead(book, currentChapter)}
                className={cn(
                  'px-2.5 md:px-3.5 py-2 rounded-xl text-[11px] md:text-xs font-bold border transition-all active:scale-95',
                  isRead
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-white/5 text-muted border-line hover:text-fg',
                )}
              >
                {isRead ? 'LIDO' : 'MARCAR LIDO'}
              </button>
              <button
                onClick={handleMark}
                disabled={!selection}
                title={
                  selection
                    ? `Favoritar trecho · ${selectionReference(book, currentChapter, selection.verse, selection.verseEnd)}`
                    : 'Selecione um texto para favoritar'
                }
                aria-label="Favoritar trecho selecionado"
                className={cn(
                  'p-2.5 rounded-xl border transition-all active:scale-95',
                  selection
                    ? 'text-red-400 border-red-400/30 bg-red-500/10 shadow-[0_0_16px_rgba(248,113,113,0.35)]'
                    : 'text-dim border-line hover:text-fg hover:bg-white/5 disabled:cursor-not-allowed',
                )}
              >
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Linha 3: áudio (TTS) */}
          {supported && (
            <div className="flex items-center gap-2 px-4 md:px-6 pb-3.5 pt-3 border-t border-line">
              <button
                onClick={togglePlayback}
                disabled={!verses.length}
                aria-label={ttsState === 'playing' ? 'Pausar leitura' : 'Ouvir capítulo'}
                title={ttsState === 'playing' ? 'Pausar' : 'Ouvir este capítulo'}
                className={cn(
                  'flex items-center justify-center shrink-0 h-10 rounded-full border transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none',
                  ttsState === 'playing'
                    ? 'w-10 bg-red-500/15 text-red-400 border-red-400/30'
                    : 'bg-brand text-ink border-brand/50 shadow-glow px-3 md:px-4',
                )}
              >
                {ttsState === 'playing' ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span className="text-[11px] font-bold tracking-wide hidden md:inline">
                      {ttsState === 'paused' ? 'CONTINUAR' : 'OUVIR'}
                    </span>
                  </>
                )}
              </button>

              {ttsState !== 'idle' && (
                <button
                  onClick={handleStopAudio}
                  aria-label="Parar áudio"
                  title="Parar áudio"
                  className="w-9 h-9 shrink-0 rounded-full border border-line bg-white/5 text-muted hover:text-fg hover:bg-white/10 transition-colors flex items-center justify-center"
                >
                  <Square className="w-3 h-3 fill-current" />
                </button>
              )}

              <div className="flex-1 min-w-0 text-center">
                {continuousProgress ? (
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-dim max-w-full truncate">
                    <Loader2 className="w-3 h-3 animate-spin text-brand shrink-0" />
                    <span className="truncate">
                      Preparando leitura contínua... {continuousProgress.done}/{continuousProgress.total}
                    </span>
                  </span>
                ) : isPiperSelected && piperStatus.phase === 'loading' ? (
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-dim max-w-full truncate">
                    <Loader2 className="w-3 h-3 animate-spin text-brand shrink-0" />
                    <span className="truncate">{piperStatus.message ?? 'Baixando voz Piper...'}</span>
                  </span>
                ) : isPiperSelected && piperStatus.phase === 'error' ? (
                  <span className="text-[11px] text-red-400 truncate block">{piperStatus.message}</span>
                ) : (
                  <span className="text-[11px] text-muted tabular-nums truncate block">
                    {ttsState === 'idle'
                      ? (isPiperSelected ? '\u00a0' : '')
                      : ttsState === 'paused'
                        ? 'Pausado'
                        : `Lendo versículo ${activeVerse + 1}/${verses.length}`}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <div
                  className="flex items-center gap-0.5 rounded-xl border border-line bg-white/5 p-0.5"
                  title={`Velocidade: ${rate.toFixed(1)}×`}
                >
                  <button
                    onClick={() => changeRate(-0.1)}
                    aria-label="Diminuir velocidade"
                    className="p-1.5 rounded-lg text-muted hover:text-fg hover:bg-white/5 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono text-dim tabular-nums px-0.5 select-none w-8 text-center">
                    {rate.toFixed(1)}×
                  </span>
                  <button
                    onClick={() => changeRate(0.1)}
                    aria-label="Aumentar velocidade"
                    className="p-1.5 rounded-lg text-muted hover:text-fg hover:bg-white/5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setVoiceOpen((o) => !o)}
                    aria-label="Escolher voz"
                    className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-line bg-white/5 hover:border-brand/40 text-left transition-colors max-w-[110px] md:max-w-[200px]"
                    aria-haspopup="listbox"
                    aria-expanded={voiceOpen}
                  >
                    <Volume2 className="w-4 h-4 text-brand shrink-0" />
                    <span className="text-[11px] font-semibold text-fg truncate">
                      {isPiperSelected
                        ? `${genderMark('male')} ${PIPER_VOICE_NAME}`
                        : (() => {
                            const selected = ptVoices.find((v) => v.voiceURI === voiceURI);
                            return selected
                              ? `${genderMark(voiceGender(selected)) ? `${genderMark(voiceGender(selected))} ` : ''}${selected.name}`
                              : 'Voz automática';
                          })()}
                    </span>
                    <ChevronDown
                      className={cn('w-3.5 h-3.5 text-muted shrink-0 transition-transform', voiceOpen && 'rotate-180')}
                    />
                  </button>

                  {voiceOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setVoiceOpen(false)} />
                      <div
                        role="listbox"
                        className="absolute right-0 top-full mt-2 z-20 w-72 max-h-72 overflow-y-auto scrollbar-thin rounded-2xl border border-line bg-panel-2 shadow-2xl shadow-black/50 py-1.5 animate-scale-in"
                      >
                        <button
                          role="option"
                          aria-selected={voiceURI === null}
                          onClick={() => handleVoicePick(null)}
                          className={cn(
                            'w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-left transition-colors',
                            voiceURI === null ? 'bg-brand-soft' : 'hover:bg-white/5',
                          )}
                        >
                          <span className="text-xs font-semibold text-fg">Voz automática</span>
                          {voiceURI === null && <Check className="w-3.5 h-3.5 text-brand shrink-0" />}
                        </button>
                        <button
                          role="option"
                          aria-selected={isPiperSelected}
                          onClick={() => handleVoicePick(PIPER_VOICE_SENTINEL)}
                          className={cn(
                            'w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-left transition-colors',
                            isPiperSelected ? 'bg-brand-soft' : 'hover:bg-white/5',
                          )}
                        >
                          <span className="min-w-0">
                            <span className="block text-xs font-semibold text-fg truncate">
                              <span className="text-dim">{genderMark('male')}</span> {PIPER_VOICE_NAME}
                            </span>
                            <span className="block text-[10px] text-dim mt-0.5">
                              Offline · masculina · baixa ~80MB na 1ª vez
                            </span>
                          </span>
                          {isPiperSelected && <Check className="w-3.5 h-3.5 text-brand shrink-0" />}
                        </button>
                        <div className="my-1.5 px-3.5">
                          <span className="block text-[9px] uppercase tracking-widest text-dim/70">Vozes do aparelho</span>
                        </div>
                        {ptVoices.map((v) => {
                          const active = v.voiceURI === voiceURI;
                          return (
                            <button
                              key={v.voiceURI}
                              role="option"
                              aria-selected={active}
                              onClick={() => handleVoicePick(v.voiceURI)}
                              className={cn(
                                'w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-left transition-colors',
                                active ? 'bg-brand-soft' : 'hover:bg-white/5',
                              )}
                            >
                              <span className="min-w-0">
                                <span className="block text-xs font-semibold text-fg truncate">
                                  <span className="text-dim">{genderMark(voiceGender(v))}</span>{' '}
                                  {v.name}
                                </span>
                                <span className="block text-[10px] text-dim mt-0.5">
                                  {voiceLabel(v)}
                                </span>
                              </span>
                              {active && <Check className="w-3.5 h-3.5 text-brand shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={() => setContinuous((v) => !v)}
                  aria-pressed={continuous}
                  disabled={!isPiperSelected}
                  title={
                    isPiperSelected
                      ? 'Pré-prepara o capítulo inteiro para continuar tocando com a tela bloqueada'
                      : 'Disponível com a voz Piper'
                  }
                  className={cn(
                    'inline-flex items-center gap-1 px-2.5 py-2 rounded-xl border text-[10px] font-bold transition-colors disabled:opacity-30 disabled:pointer-events-none',
                    continuous
                      ? 'bg-brand-soft border-brand/40 text-brand'
                      : 'bg-white/5 border-line text-muted hover:text-fg',
                  )}
                >
                  <Lock className="w-3 h-3" />
                  CONT.
                  {continuous && <Check className="w-3 h-3" />}
                </button>

                <button
                  onClick={() => setAutoAdvance((v) => !v)}
                  aria-pressed={autoAdvance}
                  title="Ao terminar o capítulo, segue para o próximo sozinho"
                  className={cn(
                    'inline-flex items-center gap-1 px-2.5 py-2 rounded-xl border text-[10px] font-bold transition-colors',
                    autoAdvance
                      ? 'bg-brand-soft border-brand/40 text-brand'
                      : 'bg-white/5 border-line text-muted hover:text-fg',
                  )}
                >
                  AUTO
                  {autoAdvance && <Check className="w-3 h-3" />}
                </button>
              </div>
            </div>
          )}
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
                onClick={() => {
                  stopTts();
                  setReloadKey((k) => k + 1);
                }}
                className="px-5 py-2 rounded-xl border border-line text-sm text-fg hover:bg-white/5"
              >
                Tentar novamente
              </button>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              <h3 className="text-center font-sans font-semibold text-xl md:text-2xl text-fg mb-8">
                {book} {currentChapter}
              </h3>
              <div className="font-sans leading-[1.65]" style={{ fontSize: `${fontSize}px` }}>
                {verses.map((verseText, i) => (
                  <p
                    key={i}
                    data-verse={i + 1}
                    onClick={() => handleVerseClick(i)}
                    title={supported ? 'Ouvir a partir deste versículo' : undefined}
                    className={cn(
                      'mb-3 text-fg/90 rounded-lg px-1 py-0.5 transition-colors',
                      activeVerse === i && 'bg-brand-soft ring-1 ring-brand/40 text-fg',
                      supported && 'cursor-pointer hover:bg-white/5 active:bg-white/10',
                    )}
                  >
                    <sup className="text-brand font-semibold text-[0.6em] mr-1.5 select-none">
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
        <div className="shrink-0 flex items-center justify-between gap-2 px-6 md:px-8 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-panel border-t border-line">
          <button
            onClick={goPrevChapter}
            disabled={currentChapter === 1}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-muted hover:text-fg hover:bg-white/5 transition-colors disabled:opacity-20 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-4 h-4" />
            ANTERIOR
          </button>
          <span className="text-xs text-dim font-mono tabular-nums">
            {currentChapter} / {totalChapters}
          </span>
          <button
            onClick={goNextChapter}
            disabled={currentChapter === totalChapters}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-brand hover:text-brand-strong hover:bg-white/5 transition-colors disabled:opacity-20 disabled:pointer-events-none"
          >
            PRÓXIMO
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Modal>
  );
}