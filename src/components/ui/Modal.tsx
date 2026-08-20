import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  position?: 'center' | 'right' | 'full';
}

const positionClass: Record<NonNullable<ModalProps['position']>, string> = {
  center: 'inset-0 flex items-center justify-center p-4',
  right: 'inset-0 flex justify-end',
  full: 'inset-0 flex items-center justify-center',
};

export function Modal({ open, onClose, children, position = 'center' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = 'unset';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className={cn('fixed inset-0 z-50', positionClass[position])} role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      {children}
    </div>,
    document.body,
  );
}

export function ModalHeader({
  title,
  subtitle,
  onClose,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-line">
      <div className="min-w-0">
        <h2 className="text-lg font-semibold text-fg truncate">{title}</h2>
        {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
      </div>
      <button
        onClick={onClose}
        className="shrink-0 p-2 rounded-lg text-muted hover:text-fg hover:bg-white/5 transition-colors"
        aria-label="Fechar"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}