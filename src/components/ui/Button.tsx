import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

type Variant = 'primary' | 'outline' | 'ghost' | 'subtle';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const variantClass: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-brand to-accent text-white shadow-[0_8px_24px_-8px_rgba(47,164,255,0.6)] hover:brightness-110 active:scale-[0.98]',
  outline:
    'border border-line-strong text-fg hover:bg-white/5 active:scale-[0.98]',
  ghost: 'text-muted hover:text-fg hover:bg-white/5',
  subtle: 'bg-white/5 text-fg hover:bg-white/10 active:scale-[0.98]',
};

const sizeClass: Record<Exclude<ButtonProps['size'], undefined>, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3.5 text-base rounded-2xl gap-2.5',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none',
        variantClass[variant],
        sizeClass[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}