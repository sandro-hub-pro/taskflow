import { clsx } from 'clsx';
import { getStorageUrl } from '../../services/api';

const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-20 h-20 text-2xl',
};

export function Avatar({
  src,
  alt,
  name,
  size = 'md',
  className,
  ...props
}) {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  const colorClasses = [
    'bg-primary-500',
    'bg-accent-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-cyan-500',
    'bg-violet-500',
  ];

  const colorIndex = name
    ? name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colorClasses.length
    : 0;

  // Get the full storage URL for the image
  const imageSrc = getStorageUrl(src);

  if (imageSrc) {
    return (
      <img
        src={imageSrc}
        alt={alt || name}
        className={clsx(
          'rounded-full object-cover ring-2 ring-white dark:ring-surface-800',
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }

  return (
    <div
      className={clsx(
        'rounded-full flex items-center justify-center font-semibold text-white ring-2 ring-white dark:ring-surface-800',
        sizes[size],
        colorClasses[colorIndex],
        className
      )}
      {...props}
    >
      {initials}
    </div>
  );
}

export function AvatarGroup({ children, max = 4, size = 'md' }) {
  const childrenArray = Array.isArray(children) ? children : [children];
  const visibleChildren = childrenArray.slice(0, max);
  const remainingCount = childrenArray.length - max;

  return (
    <div className="flex -space-x-2">
      {visibleChildren.map((child, index) => (
        <div key={index} className="relative" style={{ zIndex: max - index }}>
          {child}
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          className={clsx(
            'rounded-full flex items-center justify-center font-semibold bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-300 ring-2 ring-white dark:ring-surface-800',
            sizes[size]
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

