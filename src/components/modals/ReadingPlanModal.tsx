import { useEffect, useState } from 'react';
import { CalendarRange, Check, ChevronsRight, AlertTriangle, Sparkles, Target } from 'lucide-react';
import { toast } from 'sonner';
import { TOTAL_CHAPTERS } from '../../data/books';
import type { ReadingPlanConfig } from '../../lib/readingPlan';
import { getPlanStats, MAX_IDEAL_CHAPTERS } from '../../lib/readingPlan';
import { Modal, ModalHeader } from '../ui/Modal';
import { Button } from '../ui/Button';
import { cn } from '../../lib/cn';

interface ReadingPlanModalProps {
  open: boolean;
  onClose: () => void;
  config: ReadingPlanConfig;
  readChapters: Record<string, Set<number>>;
  onSave: (config: ReadingPlanConfig) => void;
}

const PERIOD_OPTIONS = [30, 60, 90, 180, 365, 730];

export function ReadingPlanModal({
  open,
  onClose,
  config,
  readChapters,
  onSave,
}: ReadingPlanModalProps) {
  const [mode, setMode] = useState<ReadingPlanConfig['mode']>(config.mode);
  const [chaptersPerDay, setChaptersPerDay] = useState(config.chaptersPerDay);
  const [periodDays, setPeriodDays] = useState(config.periodDays);

  useEffect(() => {
    if (open) {
      setMode(config.mode);
      setChaptersPerDay(config.chaptersPerDay);
      setPeriodDays(config.periodDays);
    }
  }, [open, config]);

  const draft: ReadingPlanConfig =
    mode === 'chapters' ? { mode, chaptersPerDay, periodDays } : { mode, chaptersPerDay, periodDays };

  const stats = getPlanStats({ mode, chaptersPerDay, periodDays }, readChapters);
  const isHeavy = stats.chaptersPerDay > MAX_IDEAL_CHAPTERS;
  const readCount = TOTAL_CHAPTERS - stats.remaining;
  const readPct = Math.round((readCount / TOTAL_CHAPTERS) * 100);

  const handleApply = () => {
    onSave(draft);
    toast.success('Plano de leitura atualizado!', {
      description: isHeavy
        ? `Ritmo de ${stats.chaptersPerDay} capítulos/dia. Tente manter no máximo 5 para criar o hábito.`
        : `${stats.totalDays} dias · ${stats.chaptersPerDay} capítulos por dia.`,
      duration: 4000,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} position="center">
      <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto scrollbar-thin rounded-2xl bg-ink-2 border border-line shadow-2xl animate-scale-in">
        <ModalHeader title="Plano de Leitura" subtitle="Adapte a leitura diária ao seu ritmo" onClose={onClose} />

        <div className="p-6 space-y-6">
          <div className="p-4 rounded-xl border border-brand/20 bg-brand-soft">
            <p className="text-xs text-muted leading-relaxed">
              <strong className="text-fg">Como funciona:</strong> o app monta o plano com base nos
              capítulos que você já leu — do Gênesis ao Apocalipse. Se você pular um dia, o plano é
              recalculado e a leitura pendente entra no próximo dia.
            </p>
          </div>

          <div className="space-y-3">
            <span className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted">
              <Target className="w-3.5 h-3.5 text-brand" />
              Modo do plano
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMode('chapters')}
                className={cn(
                  'p-4 rounded-2xl border text-left transition-all active:scale-[0.98]',
                  mode === 'chapters'
                    ? 'border-brand/50 bg-brand-soft'
                    : 'border-line bg-white/5 hover:border-brand/30',
                )}
              >
                <span className="text-lg">📖</span>
                <span className="block text-sm font-semibold text-fg mt-2">Capítulos por dia</span>
                <span className="block text-[11px] text-dim mt-1">Você define quantos capítulos ler a cada dia.</span>
              </button>
              <button
                onClick={() => setMode('period')}
                className={cn(
                  'p-4 rounded-2xl border text-left transition-all active:scale-[0.98]',
                  mode === 'period'
                    ? 'border-brand/50 bg-brand-soft'
                    : 'border-line bg-white/5 hover:border-brand/30',
                )}
              >
                <span className="text-lg">🗓️</span>
                <span className="block text-sm font-semibold text-fg mt-2">Período da Bíblia</span>
                <span className="block text-[11px] text-dim mt-1">O app calcula o ritmo para caber no prazo escolhido.</span>
              </button>
            </div>
          </div>

          {mode === 'chapters' && (
            <div className="space-y-3">
              <span className="block text-xs uppercase tracking-wider text-muted">
                Capítulos por dia
              </span>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: MAX_IDEAL_CHAPTERS }, (_, i) => i + 1).map((n) => {
                  const active = n === chaptersPerDay;
                  return (
                    <button
                      key={n}
                      onClick={() => setChaptersPerDay(n)}
                      className={cn(
                        'py-3 rounded-xl border text-sm font-bold transition-all active:scale-95',
                        active
                          ? 'border-brand bg-brand-soft text-brand'
                          : 'border-line text-fg/80 hover:border-brand/40 bg-white/5',
                      )}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-dim italic">Dica: até {MAX_IDEAL_CHAPTERS} capítulos por dia é o ideal para manter o hábito.</p>
            </div>
          )}

          {mode === 'period' && (
            <div className="space-y-3">
              <span className="block text-xs uppercase tracking-wider text-muted">
                Prazo para ler a Bíblia inteira
              </span>
              <div className="grid grid-cols-3 gap-2">
                {PERIOD_OPTIONS.map((days) => {
                  const active = days === periodDays;
                  const label = days === 365 ? '1 ano' : days === 730 ? '2 anos' : `${days} dias`;
                  return (
                    <button
                      key={days}
                      onClick={() => setPeriodDays(days)}
                      className={cn(
                        'py-3 rounded-xl border text-sm font-bold transition-all active:scale-95',
                        active
                          ? 'border-brand bg-brand-soft text-brand'
                          : 'border-line text-fg/80 hover:border-brand/40 bg-white/5',
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-dim italic">Períodos de 365 e 730 dias equivalem a um e dois anos, respectivamente.</p>
            </div>
          )}

          <div className="p-4 rounded-xl border border-line bg-white/5 space-y-2">
            <p className="text-xs text-muted uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-brand" />
              Resumo do plano
            </p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-lg font-bold text-fg">{stats.chaptersPerDay}</p>
                <p className="text-[10px] uppercase tracking-wider text-dim">capítulos/dia</p>
              </div>
              <div>
                <p className="text-lg font-bold text-fg">{stats.totalDays}</p>
                <p className="text-[10px] uppercase tracking-wider text-dim">dias</p>
              </div>
              <div>
                <p className="text-lg font-bold text-fg">{stats.remaining}</p>
                <p className="text-[10px] uppercase tracking-wider text-dim">restantes</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted pt-2">
              <span>{readCount} de {TOTAL_CHAPTERS} já lidos ({readPct}%)</span>
              <span className="flex items-center gap-1 text-brand">
                <ChevronsRight className="w-3.5 h-3.5" />
                Gênesis → Apocalipse
              </span>
            </div>
          </div>

          {isHeavy && (
            <div className="p-3.5 rounded-xl border border-amber-400/30 bg-amber-400/10">
              <p className="text-xs text-amber-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Com esse prazo, você precisaria ler <strong>{stats.chaptersPerDay} capítulos por dia</strong>.
                  O ideal é no máximo {MAX_IDEAL_CHAPTERS} por dia para não sobrecarregar — experimente um prazo maior.
                </span>
              </p>
            </div>
          )}

          <Button className="w-full" onClick={handleApply}>
            <Check className="w-4 h-4" />
            Aplicar plano
          </Button>

          <p className="text-center text-[11px] text-dim flex items-center justify-center gap-1.5">
            <CalendarRange className="w-3.5 h-3.5" />
            O plano se ajusta sozinho conforme você avança.
          </p>
        </div>
      </div>
    </Modal>
  );
}