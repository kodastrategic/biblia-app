import { useMemo, useState } from 'react';
import {
  Plus,
  Trash2,
  Pencil,
  CheckCircle2,
  Check,
  X,
  Sparkles,
  HeartHandshake,
  NotebookPen,
} from 'lucide-react';
import type { Memoria } from '../../types';
import { formatMemoriaDate } from '../../lib/memorias';
import { Modal, ModalHeader } from '../ui/Modal';
import { cn } from '../../lib/cn';

interface MemoriasModalProps {
  open: boolean;
  onClose: () => void;
  memorias: Memoria[];
  onAdd: (text: string, kind: Memoria['kind']) => void;
  onUpdate: (id: string, text: string) => void;
  onRemove: (id: string) => void;
  onConfirm: (id: string) => void;
}

type Tab = 'pedidos' | 'atendidos';

export function MemoriasModal({
  open,
  onClose,
  memorias,
  onAdd,
  onUpdate,
  onRemove,
  onConfirm,
}: MemoriasModalProps) {
  const [tab, setTab] = useState<Tab>('pedidos');
  const [draft, setDraft] = useState('');
  const [draftKind, setDraftKind] = useState<Memoria['kind']>('pedido');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const pedidos = useMemo(
    () =>
      memorias
        .filter((m) => m.kind === 'pedido' && !m.answeredAt)
        .sort((a, b) => b.createdAt - a.createdAt),
    [memorias],
  );

  const atendidos = useMemo(
    () =>
      memorias
        .filter((m) => m.kind === 'feito' || m.answeredAt)
        .sort((a, b) => (b.answeredAt ?? b.createdAt) - (a.answeredAt ?? a.createdAt)),
    [memorias],
  );

  const list = tab === 'pedidos' ? pedidos : atendidos;

  const canSave = draft.trim().length > 0;
  const canSaveEdit = editText.trim().length > 0;

  const submit = () => {
    if (!canSave) return;
    onAdd(draft.trim(), draftKind);
    setDraft('');
  };

  const startEdit = (m: Memoria) => {
    setEditingId(m.id);
    setEditText(m.text);
  };

  const saveEdit = (id: string) => {
    if (!canSaveEdit) return;
    onUpdate(id, editText.trim());
    setEditingId(null);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="relative w-full max-w-2xl h-full md:max-h-[85vh] bg-ink-2 border border-line md:rounded-2xl overflow-hidden flex flex-col animate-scale-in">
        <ModalHeader
          title="Lembretes"
          subtitle={`${pedidos.length} ${pedidos.length === 1 ? 'pedido' : 'pedidos'} aguardando · ${atendidos.length} ${atendidos.length === 1 ? 'lembrete' : 'lembretes'} de gratidão`}
          onClose={onClose}
        />

        <div className="flex items-center gap-2 px-5 md:px-6 pt-4">
          <button
            onClick={() => setTab('pedidos')}
            className={cn(
              'flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-colors',
              tab === 'pedidos'
                ? 'bg-brand-soft text-brand border border-brand/30'
                : 'text-muted hover:text-fg hover:bg-white/5 border border-transparent',
            )}
          >
            <HeartHandshake className="w-4 h-4" />
            Pedidos
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10">{pedidos.length}</span>
          </button>
          <button
            onClick={() => setTab('atendidos')}
            className={cn(
              'flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-colors',
              tab === 'atendidos'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-muted hover:text-fg hover:bg-white/5 border border-transparent',
            )}
          >
            <CheckCircle2 className="w-4 h-4" />
            Atendidos
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10">{atendidos.length}</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-5 md:p-6 space-y-4">
          <div className="rounded-2xl border border-line bg-panel/60 p-4">
            <div className="flex items-center gap-2 mb-3">
              <NotebookPen className="w-4 h-4 text-brand" />
              <p className="text-xs font-bold uppercase tracking-wider text-brand">
                {draftKind === 'pedido' ? 'Estou pedindo a Deus' : 'Deus fez por mim'}
              </p>
            </div>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={2}
              maxLength={1000}
              placeholder={
                draftKind === 'pedido'
                  ? 'O que você está pedindo a Deus?'
                  : 'O que Deus já fez na sua vida?'
              }
              className="w-full resize-none bg-transparent text-sm text-fg placeholder:text-dim/70 focus:outline-none"
            />
            <div className="flex items-center justify-between gap-3 mt-3">
              <div className="flex gap-1.5">
                <button
                  onClick={() => setDraftKind('pedido')}
                  className={cn(
                    'inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors',
                    draftKind === 'pedido'
                      ? 'bg-brand-soft text-brand'
                      : 'text-muted hover:text-fg bg-white/5',
                  )}
                >
                  <HeartHandshake className="w-3.5 h-3.5" />
                  Pedido
                </button>
                <button
                  onClick={() => setDraftKind('feito')}
                  className={cn(
                    'inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors',
                    draftKind === 'feito'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'text-muted hover:text-fg bg-white/5',
                  )}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Já aconteceu
                </button>
              </div>
              <button
                onClick={submit}
                disabled={!canSave}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-brand to-accent text-white hover:brightness-110 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
              >
                <Plus className="w-3.5 h-3.5" />
                Salvar
              </button>
            </div>
          </div>

          {list.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12">
              {tab === 'pedidos' ? (
                <HeartHandshake className="w-10 h-10 text-dim mb-4" />
              ) : (
                <Sparkles className="w-10 h-10 text-dim mb-4" />
              )}
              <p className="text-sm text-muted max-w-xs leading-relaxed">
                {tab === 'pedidos'
                  ? 'Nenhum pedido ainda. Anote o que você está pedindo a Deus e acompanhe quando for respondido.'
                  : 'Nada por aqui ainda. Quando um pedido for atendido, confirme e ele entra neste feed.'}
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {list.map((m) => {
                const editing = editingId === m.id;
                const createdAt = formatMemoriaDate(m.createdAt);
                return (
                  <li
                    key={m.id}
                    className={cn(
                      'rounded-2xl border bg-panel/60 p-4 transition-all',
                      m.kind === 'feito' || m.answeredAt
                        ? 'border-emerald-500/20'
                        : 'border-line',
                    )}
                  >
                    {editing ? (
                      <div>
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={3}
                          maxLength={1000}
                          autoFocus
                          className="w-full resize-none bg-white/5 border border-line rounded-xl p-3 text-sm text-fg focus:outline-none focus:border-brand/50"
                        />
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => saveEdit(m.id)}
                            disabled={!canSaveEdit}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-brand text-white hover:brightness-110 transition-all disabled:opacity-40"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Salvar
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-muted hover:text-fg bg-white/5 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-fg/95 leading-relaxed">{m.text}</p>
                        <div className="flex items-center justify-between gap-3 mt-3">
                          <span className="text-[11px] text-dim">
                            {m.kind === 'feito' ? (
                              <>Aconteceu em {createdAt}</>
                            ) : m.answeredAt ? (
                              <>
                                Pedido em {createdAt} ·{' '}
                                <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Atendido em {formatMemoriaDate(m.answeredAt)}
                                </span>
                              </>
                            ) : (
                              <>Pedido em {createdAt}</>
                            )}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {m.kind === 'pedido' && !m.answeredAt && (
                              <button
                                onClick={() => onConfirm(m.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                                title="Confirmar como pedido atendido"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Atendido
                              </button>
                            )}
                            <button
                              onClick={() => startEdit(m)}
                              className="p-2 rounded-lg text-muted hover:text-brand hover:bg-white/5 transition-colors"
                              aria-label="Editar"
                              title="Editar"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onRemove(m.id)}
                              className="p-2 rounded-lg text-muted hover:text-red-400 hover:bg-white/5 transition-colors"
                              aria-label="Excluir"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}