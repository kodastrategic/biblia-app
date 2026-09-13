import { useEffect, useState } from 'react';
import { User, Save, BookOpenText, Check } from 'lucide-react';
import { toast } from 'sonner';
import { TOTAL_CHAPTERS } from '../../data/books';
import { TRANSLATIONS, getTranslation } from '../../data/translations';
import { Modal, ModalHeader } from '../ui/Modal';
import { Button } from '../ui/Button';
import { cn } from '../../lib/cn';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  userName: string;
  onUserNameChange: (name: string) => void;
  translationId: string;
  onTranslationChange: (id: string) => void;
}

export function SettingsModal({
  open,
  onClose,
  userName,
  onUserNameChange,
  translationId,
  onTranslationChange,
}: SettingsModalProps) {
  const [tempName, setTempName] = useState(userName);

  useEffect(() => {
    if (open) setTempName(userName);
  }, [open, userName]);

  const translation = getTranslation(translationId);

  const handleSave = () => {
    onUserNameChange(tempName.trim());
    toast.success('Configurações salvas!', {
      description: 'Suas preferências foram atualizadas.',
      duration: 3000,
    });
  };

  const handleTranslationPick = (id: string) => {
    onTranslationChange(id);
    toast.success('Tradução atualizada', {
      description: `${getTranslation(id).name} selecionada.`,
      duration: 3000,
    });
  };

  return (
    <Modal open={open} onClose={onClose} position="right" className="w-full max-w-md">
      <div className="relative w-full h-full bg-ink-2 border-l border-line flex flex-col animate-slide-up md:animate-scale-in">
        <ModalHeader title="Configurações" subtitle="Personalize sua experiência" onClose={onClose} />

        <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-6">
          <div className="space-y-3">
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-muted mb-2 block">Seu Nome</span>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Digite seu nome..."
                maxLength={30}
                className="w-full px-4 py-3 bg-white/5 border border-line rounded-xl text-fg placeholder:text-dim focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
              />
            </label>
            <p className="text-xs text-dim italic">
              Seu nome aparecerá no progresso de leitura.
            </p>
          </div>

          <div className="space-y-3">
            <span className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted">
              <BookOpenText className="w-3.5 h-3.5 text-brand" />
              Tradução da Bíblia
            </span>
            <div className="space-y-2">
              {TRANSLATIONS.map((t) => {
                const active = t.id === translationId;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleTranslationPick(t.id)}
                    className={cn(
                      'w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-all active:scale-[0.99]',
                      active
                        ? 'border-brand/50 bg-brand-soft'
                        : 'border-line bg-white/5 hover:border-brand/30 hover:bg-white/[0.06]',
                    )}
                  >
                    <span className="min-w-0 text-left">
                      <span className="flex items-baseline gap-2">
                        <span
                          className={cn(
                            'text-[10px] font-bold uppercase tracking-wider',
                            active ? 'text-brand' : 'text-dim',
                          )}
                        >
                          {t.id.toUpperCase()}
                        </span>
                        <span className="text-sm font-semibold text-fg truncate">{t.name}</span>
                      </span>
                      <span className="block text-[11px] text-dim mt-0.5">
                        {t.publisher ? `${t.publisher}${t.year ? ` · ${t.year}` : ''}` : 'Tradução em português'}
                      </span>
                    </span>
                    {active && <Check className="w-4 h-4 text-brand shrink-0" />}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-dim italic">
              A tradução altera o texto exibido no leitor de capítulos.
            </p>
          </div>

          <Button className="w-full" onClick={handleSave}>
            <Save className="w-4 h-4" />
            Salvar Alterações
          </Button>

          {tempName.trim() && (
            <div className="p-4 rounded-xl border border-line bg-panel/60">
              <p className="text-xs text-muted uppercase tracking-wider mb-2">Pré-visualização</p>
              <p className="text-lg font-serif text-gradient-brand">
                {tempName.trim().toUpperCase()}, VOCÊ JÁ LEU 0%
              </p>
            </div>
          )}

          <div className="border-t border-line pt-6 space-y-3">
            <InfoCard
              emoji="📖"
              title="Tradução atual"
              text={`${translation.name} (${translation.id.toUpperCase()}) — o texto é carregado diretamente do arquivo local, funcionando sem conexão.`}
            />
            <InfoCard
              emoji="💾"
              title="Privacidade"
              text="Todos os dados ficam salvos localmente no seu navegador. Nada é compartilhado."
            />
          </div>

          <div className="p-4 rounded-xl border border-line bg-panel/60">
            <p className="text-xs text-muted uppercase tracking-wider mb-3">Estatísticas</p>
            <div className="space-y-2 text-sm">
              <StatRow label="Total de livros" value="66 livros" />
              <StatRow label="Total de capítulos" value={`${TOTAL_CHAPTERS.toLocaleString('pt-BR')} capítulos`} />
              <StatRow label="Plano de leitura" value="365 dias" />
              <StatRow label="Traduções disponíveis" value={`${TRANSLATIONS.length} versões`} />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function InfoCard({ emoji, title, text }: { emoji: string; title: string; text: string }) {
  return (
    <div className="p-4 rounded-xl border border-brand/20 bg-brand-soft">
      <p className="text-xs text-muted mb-1.5">
        {emoji} <strong className="text-fg">{title}:</strong>
      </p>
      <p className="text-xs text-muted leading-relaxed">{text}</p>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted">{label}</span>
      <span className="text-fg font-semibold">{value}</span>
    </div>
  );
}