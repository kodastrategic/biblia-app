import { useLayoutEffect, useRef, useState } from 'react';
import { X, Quote, BookOpen, Camera, Type, Palette, ChevronDown } from 'lucide-react';
import type { BookMark } from '../../types';
import { markReference } from '../../lib/marks';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { cn } from '../../lib/cn';

interface StoryPreviewModalProps {
  mark: BookMark | null;
  onClose: () => void;
}

const MAX_FONT = 24;
const MIN_FONT = 14;
const LEAD = 1.45;

type FontChoice = 'sans' | 'serif';

const FONT_OPTIONS: Array<{ id: FontChoice; name: string }> = [
  { id: 'sans', name: 'Sans (Inter)' },
  { id: 'serif', name: 'Serifada (Crimson)' },
];

interface GradientPreset {
  id: string;
  name: string;
  className: string;
}

const GRADIENTS: GradientPreset[] = [
  { id: 'azul', name: 'Azul Noite', className: 'from-brand via-[#4c1d95] to-[#1e1b4b]' },
  { id: 'roxo', name: 'Roxo Neon', className: 'from-violet-600 via-fuchsia-600 to-rose-600' },
  { id: 'ouro', name: 'Ouro', className: 'from-amber-400 via-orange-500 to-rose-600' },
  { id: 'verde', name: 'Esmeralda', className: 'from-emerald-500 via-teal-600 to-cyan-700' },
  { id: 'cereja', name: 'Cereja', className: 'from-rose-500 via-red-600 to-purple-800' },
  { id: 'noite', name: 'Noite', className: 'from-slate-800 via-slate-900 to-black' },
];

export function StoryPreviewModal({ mark, onClose }: StoryPreviewModalProps) {
  const [font, setFont] = useLocalStorage<FontChoice>('storyFont', 'sans');
  const [gradientId, setGradientId] = useLocalStorage<string>('storyGradient', 'azul');
  const [fontSize, setFontSize] = useState(MAX_FONT);
  const [needsScroll, setNeedsScroll] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const gradient = GRADIENTS.find((g) => g.id === gradientId) ?? GRADIENTS[0];
  const chars = mark?.text.length ?? 0;

  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const compute = () => {
      const cardW = card.clientWidth;
      const cardH = card.clientHeight;
      const areaW = Math.max(80, cardW - 64);
      const budgetH = Math.max(120, cardH - 240);

      let size = MAX_FONT;
      let fits = false;
      while (size >= MIN_FONT) {
        const charsPerLine = Math.max(1, Math.floor(areaW / (size * 0.52)));
        const lines = Math.max(1, Math.ceil(chars / charsPerLine));
        const needed = lines * size * LEAD;
        if (needed <= budgetH) {
          fits = true;
          break;
        }
        size--;
      }

      setFontSize(Math.max(MIN_FONT, size));
      setNeedsScroll(!fits);
    };

    compute();
    const observer = new ResizeObserver(compute);
    observer.observe(card);
    return () => observer.disconnect();
  }, [chars]);

  if (!mark) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-3 p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={cardRef}
        className="relative w-full max-w-[460px] aspect-[9/16] max-h-[68vh] rounded-[2.5rem] clip-card-lg overflow-hidden border border-white/10 shadow-2xl shadow-black/60 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={cn('absolute inset-0 bg-gradient-to-br', gradient.className)} />
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.55)_0%,transparent_70%)]" />
        <div className="absolute -bottom-28 -left-20 w-80 h-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(47,164,255,0.45)_0%,transparent_70%)]" />

        <div className="relative h-full flex flex-col items-center">
          <div className="absolute top-5 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/60">
            <BookOpen className="w-3.5 h-3.5" />
            Bible Life
          </div>

          <div
            className={cn(
              'flex-1 flex flex-col items-center px-8 text-center min-h-0 gap-5',
              needsScroll && 'justify-start overflow-y-auto scrollbar-thin py-5',
              !needsScroll && 'justify-center',
            )}
          >
            <Quote className="w-8 h-8 text-white/30 shrink-0" />
            <blockquote
              className={cn('text-white leading-snug text-balance', font === 'serif' && 'font-serif')}
              style={{ fontSize: `${fontSize}px`, lineHeight: LEAD }}
            >
              “{mark.text}”
            </blockquote>
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-[13px] font-bold text-white/90 shrink-0">
              {markReference(mark)}
            </span>
          </div>

          <div className="pb-9 flex flex-col items-center gap-2">
            <p className="inline-flex items-center gap-1.5 text-[11px] text-white/50">
              <Camera className="w-3.5 h-3.5" />
              Tire um print para compartilhar
            </p>
            <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
          </div>
        </div>
      </div>

      <div
        className="flex flex-wrap items-center justify-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <label className="relative inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 pl-3 pr-8 py-1.5 text-white/90">
          <Type className="w-3.5 h-3.5 text-white/50 shrink-0" />
          <select
            value={font}
            onChange={(e) => setFont(e.target.value as FontChoice)}
            className="bg-transparent appearance-none text-xs font-semibold uppercase tracking-wider outline-none [&>option]:bg-ink-2 [&>option]:text-fg"
          >
            {FONT_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/50 pointer-events-none" />
        </label>

        <label className="relative inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 pl-3 pr-8 py-1.5 text-white/90">
          <Palette className="w-3.5 h-3.5 text-white/50 shrink-0" />
          <select
            value={gradient.id}
            onChange={(e) => setGradientId(e.target.value)}
            className="bg-transparent appearance-none text-xs font-semibold uppercase tracking-wider outline-none [&>option]:bg-ink-2 [&>option]:text-fg"
          >
            {GRADIENTS.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/50 pointer-events-none" />
        </label>
      </div>

      <button
        onClick={onClose}
        aria-label="Fechar pré-visualização"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 text-white/80 hover:text-white hover:bg-white/20 transition-colors"
      >
        <X className="w-4 h-4" />
        Fechar
      </button>
    </div>
  );
}