import { NotebookPen, ChevronRight } from 'lucide-react';

interface MemoriasCardProps {
  pendingCount: number;
  onOpen: () => void;
}

export function MemoriasCard({ pendingCount, onOpen }: MemoriasCardProps) {
  return (
    <button
      onClick={onOpen}
      className="w-full flex items-center gap-3 p-3 rounded-xl border border-line bg-panel/40 hover:border-brand/40 hover:bg-panel/70 transition-colors text-left"
    >
      <span className="p-2 rounded-lg bg-brand-soft text-brand shrink-0">
        <NotebookPen className="w-4 h-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-bold text-fg truncate">
          Lembre-se do que Deus fez por você
        </span>
        <span className="block text-[10px] text-dim truncate">
          {pendingCount > 0
            ? `${pendingCount} ${pendingCount === 1 ? 'pedido aguardando' : 'pedidos aguardando'}`
            : 'Registre pedidos e louvores'}
        </span>
      </span>
      <ChevronRight className="w-4 h-4 text-dim shrink-0" />
    </button>
  );
}