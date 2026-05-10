import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'blue';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        {
          'bg-zinc-800 text-zinc-400 border border-zinc-700': variant === 'default',
          'bg-green-950 text-green-400 border border-green-800': variant === 'success',
          'bg-yellow-950 text-yellow-400 border border-yellow-800': variant === 'warning',
          'bg-red-950 text-red-400 border border-red-800': variant === 'danger',
          'bg-blue-950 text-blue-400 border border-blue-800': variant === 'blue',
        },
        className
      )}
    >
      {children}
    </span>
  );
}
