import { useEffect, useState, type ElementType, type ReactNode } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Target,
  HeartHandshake,
  CheckCircle2,
  Sunrise,
} from 'lucide-react';
import type { DevocionalDia } from '../../types';
import { DEVOCIONAL_TOTAL_DAYS, getDevocionalDay } from '../../data/devocional';
import { cn } from '../../lib/cn';
import { Modal } from '../ui/Modal';

interface DevocionalModalProps {
  open: boolean;
  onClose: () => void;
  initialDay: number;
  onCompleteDay: (day: number) => void;
}

export function DevocionalModal({ open, onClose, initialDay, onCompleteDay }: DevocionalModalProps) {
  const [day, setDay] = useState(initialDay);

  useEffect(() => {
    if (open) setDay(initialDay);
  }, [open, initialDay]);

  const current = getDevocionalDay(day);
  const done = day < initialDay;

  const complete = () => {
    if (done) return;
    onCompleteDay(day);
    setDay((d) => Math.min(d + 1, DEVOCIONAL_TOTAL_DAYS));
  };

  return (
    <Modal open={open} onClose={onClose} position="full">
      <div className="relative w-full h-full max-w-3xl mx-auto bg-ink-2 border-x border-line flex flex-col md:my-6 md:rounded-2xl md:overflow-hidden md:shadow-[0_0_80px_rgba(0,0,0,0.8)]">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4 md:px-6 py-4 bg-panel border-b border-line shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-amber-400/15 border border-amber-400/30 text-amber-300 shrink-0">
              <Sunrise className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-fg leading-tight truncate">Devocional</h2>
              <p className="text-[10px] text-dim uppercase tracking-wider mt-0.5">
                Dia {day} de {DEVOCIONAL_TOTAL_DAYS}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted hover:text-fg hover:bg-white/5 transition-colors"
            aria-label="Fechar devocional"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-5 md:px-10 py-8 md:py-10">
          {!current ? (
            <div className="h-full flex items-center justify-center text-muted text-sm">
              Dia não encontrado.
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-8">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300 text-[11px] font-bold uppercase tracking-wider">
                  {current.semana_tema}
                </span>
                <h3 className="mt-3 font-serif text-3xl md:text-4xl text-fg leading-tight">
                  {current.titulo}
                </h3>
                <p className="mt-2 text-sm text-muted">Dia {current.dia}</p>
              </div>

              <blockquote className="rounded-2xl border border-line bg-panel/60 p-5">
                <p className="text-xs text-brand font-bold uppercase tracking-wider mb-2">
                  {current.referencia_biblica}
                </p>
                <p className="font-serif italic text-lg md:text-xl text-fg/90 leading-relaxed">
                  “{current.texto_base}”
                </p>
              </blockquote>

              <Section icon={Lightbulb} accent="text-brand" title="Reflexão">
                <p className="text-[15px] leading-relaxed text-fg/85">{current.reflexao}</p>
              </Section>

              <Section icon={Target} accent="text-amber-300" title="Desafio Prático">
                <p className="text-[15px] leading-relaxed text-fg/85">{current.desafio_pratico}</p>
              </Section>

              <Section icon={HeartHandshake} accent="text-red-400" title="Oração">
                <p className="font-serif italic text-[15px] leading-relaxed text-fg/85">
                  {current.oracao}
                </p>
              </Section>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-between gap-2 px-4 md:px-6 py-4 bg-panel border-t border-line">
          <button
            onClick={() => setDay((d) => Math.max(1, d - 1))}
            disabled={day === 1}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-muted hover:text-fg transition-colors disabled:opacity-20 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-4 h-4" />
            DIA ANTERIOR
          </button>

          <button
            onClick={complete}
            disabled={done}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95',
              done
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 cursor-default'
                : 'bg-gradient-to-r from-amber-400 to-orange-500 text-black hover:brightness-110 shadow-[0_8px_24px_-8px_rgba(251,191,36,0.6)]',
            )}
          >
            {done ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Dia concluído
              </>
            ) : (
              <>Concluir Dia {day}</>
            )}
          </button>

          <button
            onClick={() => setDay((d) => Math.min(DEVOCIONAL_TOTAL_DAYS, d + 1))}
            disabled={day === DEVOCIONAL_TOTAL_DAYS}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-300 hover:text-amber-200 transition-colors disabled:opacity-20 disabled:pointer-events-none"
          >
            PRÓXIMO
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Modal>
  );
}

function Section({
  icon: Icon,
  accent,
  title,
  children,
}: {
  icon: ElementType;
  accent: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h4 className={cn('flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] mb-3', accent)}>
        <Icon className="w-4 h-4" />
        {title}
      </h4>
      {children}
    </section>
  );
}