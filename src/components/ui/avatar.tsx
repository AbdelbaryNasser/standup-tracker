import { cn, getInitials } from '@/lib/utils';

interface AvatarProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  title?: string;
}

const COLORS = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-green-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-indigo-500',
  'bg-red-500',
];

function getColor(name: string) {
  const code = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return COLORS[code % COLORS.length];
}

export function Avatar({ name, size = 'md', className, title }: AvatarProps) {
  return (
    <div
      title={title ?? name}
      className={cn(
        'flex items-center justify-center rounded-full text-white font-semibold select-none',
        getColor(name),
        {
          'h-5 w-5 text-[10px]': size === 'xs',
          'h-7 w-7 text-xs': size === 'sm',
          'h-9 w-9 text-sm': size === 'md',
          'h-11 w-11 text-base': size === 'lg',
        },
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}
