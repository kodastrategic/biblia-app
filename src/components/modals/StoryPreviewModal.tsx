import { X, Quote, BookOpen, Camera } from 'lucide-react';
import type { BookMark } from '../../types';
import { markReference } from '../../lib/marks';

interface StoryPreviewModalProps {
  mark: BookMark | null;
  onClose: () => void;
}

export function StoryPreviewModal({ mark, onClose }: StoryPreviewModalProps) {
  if (!mark) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-[420px] aspect-[9/16] max-h-[82vh] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl shadow-black/60 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-brand via-[#4c1d95] to-[#1e1b4b]" />
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-accent/40 blur-3xl" />
        <div className="absolute -bottom-28 -left-20 w-80 h-80 rounded-full bg-brand/30 blur-3xl" />

        <button
          onClick={onClose}
          aria-label="Fechar pré-visualização"
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/30 text-white/80 hover:text-white hover:bg-black/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative h-full flex flex-col items-center">
          <div className="absolute top-5 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/60">
            <BookOpen className="w-3.5 h-3.5" />
            Bible Life
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-5">
            <Quote className="w-8 h-8 text-white/30" />
            <blockquote className="font-sans text-[22px] md:text-2xl leading-snug text-white">
              “{mark.text}”
            </blockquote>
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-[13px] font-bold text-white/90">
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
    </div>
  );
}