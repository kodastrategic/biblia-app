import { TOTAL_CHAPTERS } from '../../data/books';

interface ProgressCardProps {
  percentage: number;
  countRead: number;
  userName?: string;
}

export function ProgressCard({ percentage, countRead, userName }: ProgressCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-line bg-panel/80 backdrop-blur-md p-6 md:p-8 shadow-card">
      <div className="absolute -top-20 -right-16 w-56 h-56 rounded-full bg-brand/15 blur-3xl" />
      <div className="absolute -bottom-24 -left-16 w-56 h-56 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative">
        <p className="text-xs uppercase tracking-[0.3em] text-brand font-bold mb-4">
          Progresso de Leitura
        </p>

        <p className="text-5xl md:text-6xl font-serif font-semibold text-gradient leading-none mb-2">
          {percentage}%
        </p>
        <p className="text-sm text-muted mb-6">
          {userName ? `${userName}, você já leu ` : 'Você já leu '}
          <span className="text-fg font-semibold">{countRead}</span> de{' '}
          <span className="text-fg font-semibold">{TOTAL_CHAPTERS}</span> capítulos da Bíblia.
        </p>

        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand to-accent transition-all duration-700"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <Stat label="Capítulos lidos" value={String(countRead)} />
          <Stat label="Livros da Bíblia" value="66" />
          <Stat label="Plano" value="365 dias" />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-white/[0.03] px-2 py-3">
      <p className="text-base font-bold text-fg">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-dim mt-1">{label}</p>
    </div>
  );
}