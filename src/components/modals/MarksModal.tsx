import { BookOpen, Trash2, Quote } from 'lucide-react';
import type { BookMark } from '../../types';
import { formatMarkDate, markReference } from '../../lib/marks';
import { Modal, ModalHeader } from '../ui/Modal';
import { Button } from '../ui/Button';

interface MarksModalProps {
  open: boolean;
  onClose: () => void;
  marks: BookMark[];
  onRemoveMark: (id: string) => void;
  onOpenMark: (mark: BookMark) => void;
}

export function MarksModal({ open, onClose, marks, onRemoveMark, onOpenMark }: MarksModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="relative w-full max-w-2xl h-full md:max-h-[80vh] bg-ink-2 border border-line md:rounded-2xl overflow-hidden flex flex-col animate-scale-in">
        <ModalHeader
          title="Textos Marcados"
          subtitle={`${marks.length} ${marks.length === 1 ? 'marcação' : 'marcações'} salvas`}
          onClose={onClose}
        />

        <div className="flex-1 overflow-y-auto scrollbar-thin p-5 md:p-6">
          {marks.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16">
              <Quote className="w-10 h-10 text-dim mb-4" />
              <p className="text-sm text-muted max-w-xs leading-relaxed">
                Nenhum texto marcado ainda. Na Bíblia, selecione um trecho e toque em{' '}
                <span className="text-brand font-semibold">marcar texto</span>.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {marks.map((mark) => (
                <li
                  key={mark.id}
                  className="group rounded-2xl border border-line bg-panel/60 p-4 md:p-5"
                >
                  <p className="font-serif italic text-fg/95 leading-relaxed mb-3">“{mark.text}”</p>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-brand">
                      {markReference(mark)}
                      <span className="text-dim font-normal ml-2">{formatMarkDate(mark.createdAt)}</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onOpenMark(mark)}
                        className="p-2 rounded-lg text-muted hover:text-brand hover:bg-white/5 transition-colors"
                        aria-label="Abrir na Bíblia"
                        title="Abrir na Bíblia"
                      >
                        <BookOpen className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onRemoveMark(mark.id)}
                        className="p-2 rounded-lg text-muted hover:text-red-400 hover:bg-white/5 transition-colors"
                        aria-label="Remover marcação"
                        title="Remover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {marks.length > 0 && (
          <div className="p-4 border-t border-line bg-black/20 flex justify-end">
            <Button variant="subtle" size="sm" onClick={onClose}>
              Fechar
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}