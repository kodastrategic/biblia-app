import type { ReactNode } from 'react';
import { BookOpen, Home, Settings } from 'lucide-react';
import { cn } from '../../lib/cn';

export type View = 'home' | 'bible';

interface AppShellProps {
  view: View;
  onNavigate: (view: View) => void;
  onOpenSettings: () => void;
  children: ReactNode;
}

export function AppShell({ view, onNavigate, onOpenSettings, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-ambient text-fg font-sans overflow-x-hidden">
      <header className="fixed top-0 inset-x-0 h-16 md:h-[72px] bg-ink/70 backdrop-blur-xl border-b border-line z-40">
        <div className="max-w-6xl mx-auto h-full px-5 md:px-8 flex items-center justify-between">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-baseline gap-1 font-serif italic text-xl md:text-2xl text-fg"
          >
            Bible
            <span className="text-gradient-brand font-semibold not-italic">Life</span>
          </button>

          <nav className="flex items-center gap-2">
            {view === 'bible' && (
              <button
                onClick={() => onNavigate('home')}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-line text-muted hover:text-fg hover:bg-white/5 transition-all active:scale-95"
              >
                <Home className="w-4 h-4" />
                <span className="hidden md:inline text-xs font-semibold uppercase tracking-widest">
                  Início
                </span>
              </button>
            )}
            <button
              onClick={() => onNavigate('bible')}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all active:scale-95',
                view === 'bible'
                  ? 'bg-brand-soft border-brand/30 text-brand'
                  : 'border-line text-muted hover:text-fg hover:bg-white/5',
              )}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden md:inline text-xs font-bold uppercase tracking-widest">
                Bíblia
              </span>
            </button>
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl border border-line text-muted hover:text-fg hover:bg-white/5 transition-all active:scale-95"
              aria-label="Configurações"
            >
              <Settings className="w-4 h-4" />
            </button>
          </nav>
        </div>
      </header>

      <main className="pt-24 md:pt-32 pb-20">{children}</main>

      <footer className="border-t border-line py-8">
        <p className="text-center text-xs text-dim">
          Bible Life · NVI — Nova Versão Internacional · Seus dados ficam salvos localmente no seu
          navegador.
        </p>
      </footer>
    </div>
  );
}