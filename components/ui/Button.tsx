'use client';

import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center font-body font-[400] tracking-[0.22em] uppercase transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary:
        'bg-gold text-bg border border-gold hover:bg-gold-hi hover:border-gold-hi',
      ghost:
        'bg-transparent text-text-2 border border-border-2 hover:border-gold-lo hover:text-gold',
      outline:
        'bg-transparent text-gold border border-gold-lo hover:bg-gold hover:text-bg',
    };

    const sizes = {
      sm: 'text-[10px] px-5 py-2',
      md: 'text-[11px] px-9 py-[14px]',
      lg: 'text-[12px] px-11 py-4',
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
