import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-gray-100 shadow-sm',
        hover && 'transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary-100',
        className
      )}
    >
      {children}
    </div>
  );
}
