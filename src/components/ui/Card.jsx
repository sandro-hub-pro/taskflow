import { clsx } from 'clsx';

export function Card({ children, className, hover, gradient, ...props }) {
  return (
    <div
      className={clsx(
        'bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700',
        'shadow-sm',
        hover && 'hover-lift cursor-pointer',
        gradient && 'gradient-border',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div
      className={clsx(
        'px-6 py-4 border-b border-surface-100 dark:border-surface-700',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardContent({ children, className, ...props }) {
  return (
    <div className={clsx('p-6', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }) {
  return (
    <div
      className={clsx(
        'px-6 py-4 border-t border-surface-100 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50 rounded-b-2xl',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

