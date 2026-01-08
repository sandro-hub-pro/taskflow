import { forwardRef } from 'react';
import { clsx } from 'clsx';

export const TextArea = forwardRef(({
  label,
  error,
  helper,
  className,
  containerClassName,
  rows = 4,
  ...props
}, ref) => {
  return (
    <div className={clsx('space-y-1.5', containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={clsx(
          'block w-full rounded-xl border bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100',
          'placeholder:text-surface-400 dark:placeholder:text-surface-500',
          'focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:focus:border-primary-400',
          'transition-all duration-200 resize-none',
          error
            ? 'border-red-500 dark:border-red-500'
            : 'border-surface-200 dark:border-surface-700',
          'px-4 py-2.5',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
      {helper && !error && (
        <p className="text-sm text-surface-500 dark:text-surface-400">{helper}</p>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';

