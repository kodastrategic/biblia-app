import { useState, useEffect } from 'react';
import { X, User, Save } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  onUserNameChange: (name: string) => void;
}

export function SettingsPanel({
  isOpen,
  onClose,
  userName,
  onUserNameChange,
}: SettingsPanelProps) {
  const [tempName, setTempName] = useState(userName);

  useEffect(() => {
    setTempName(userName);
  }, [userName]);

  const handleSave = () => {
    onUserNameChange(tempName.trim());
    
    toast.success('✅ Configurações salvas!', {
      description: 'Suas preferências foram atualizadas.',
      duration: 3000,
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Settings Panel */}
      <div className="fixed top-0 right-0 h-full w-full md:w-[480px] bg-gradient-to-br from-[#0b1f2a] to-[#2a0f2f] border-l border-white/20 shadow-2xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-gradient-to-br from-[#0b1f2a] to-[#2a0f2f] z-10">
          <h2 className="text-xl md:text-2xl flex items-center gap-3">
            <User className="w-6 h-6 text-[#2FA4FF]" />
            Configurações
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Profile Section */}
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm text-[#DADADA] uppercase tracking-wider mb-2 block">
                Seu Nome
              </span>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Digite seu nome..."
                maxLength={30}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg 
                         text-white placeholder:text-white/40 
                         focus:outline-none focus:border-[#2FA4FF] focus:ring-2 focus:ring-[#2FA4FF]/20
                         transition-all"
              />
            </label>
            <p className="text-xs text-[#DADADA] italic">
              Personalize sua experiência! Seu nome aparecerá no progresso de leitura.
            </p>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full py-3 bg-gradient-to-r from-[#2FA4FF] to-[#8B5CF6] 
                     rounded-lg hover:opacity-90 transition-opacity
                     flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Salvar Alterações
          </button>

          {/* Preview */}
          {tempName.trim() && (
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-xs text-[#DADADA] mb-2 uppercase tracking-wider">
                Pré-visualização:
              </p>
              <p className="text-lg bg-gradient-to-r from-[#2FA4FF] to-[#8B5CF6] bg-clip-text text-transparent">
                {tempName.trim().toUpperCase()}, VOCÊ JÁ LEU 0%
              </p>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-white/10 my-6" />

          {/* API Info */}
          <div className="space-y-4">
            <div className="p-4 bg-[#2FA4FF]/10 rounded-lg border border-[#2FA4FF]/30">
              <p className="text-xs text-[#DADADA] mb-2">
                ✨ <strong>Leitura Digital:</strong>
              </p>
              <p className="text-xs text-[#DADADA]">
                O app está conectado automaticamente a uma API que fornece os textos bíblicos 
                na tradução ARC (Almeida Revista e Corrigida).
              </p>
            </div>

            <div className="p-4 bg-[#8B5CF6]/10 rounded-lg border border-[#8B5CF6]/30">
              <p className="text-xs text-[#DADADA] mb-2">
                💾 <strong>Cache Local:</strong>
              </p>
              <p className="text-xs text-[#DADADA]">
                Os capítulos que você lê ficam salvos no navegador por 7 dias, 
                permitindo acesso offline e leitura mais rápida.
              </p>
            </div>

            <div className="p-4 bg-[#2FA4FF]/10 rounded-lg border border-[#2FA4FF]/30">
              <p className="text-xs text-[#DADADA]">
                💡 <strong>Privacidade:</strong> Todos os dados ficam salvos localmente no seu navegador. 
                Suas informações e progresso de leitura são privados e não são compartilhados.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <p className="text-xs text-[#DADADA] mb-2 uppercase tracking-wider">
              Estatísticas:
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#DADADA]">Total de livros:</span>
                <span className="text-white">66 livros</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#DADADA]">Total de capítulos:</span>
                <span className="text-white">1.189 capítulos</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#DADADA]">Plano de leitura:</span>
                <span className="text-white">365 dias</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
