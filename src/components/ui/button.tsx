import React from 'react';
import { cn } from '@/src/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'outline' | 'destructive' | 'hero';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button: React.FC<ButtonProps> = ({ 
  className, 
  variant = 'default', 
  size = 'default', 
  ...props 
}) => {
  const variants = {
    default: 'bg-slate-900 text-white hover:bg-slate-800',
    ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800',
    outline: 'border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800',
    destructive: 'bg-red-500 text-white hover:bg-red-600',
    hero: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30',
  };

  const sizes = {
    default: 'px-4 py-2',
    sm: 'px-3 py-1.5 text-xs',
    lg: 'px-8 py-4 text-lg',
    icon: 'p-2',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-bold transition-all disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
};
