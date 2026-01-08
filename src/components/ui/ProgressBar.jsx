import { clsx } from 'clsx';

const variants = {
  primary: 'bg-primary-500',
  accent: 'bg-accent-500',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
};

// Distinct colors for segmented progress bar
const segmentColors = [
  { name: 'Emerald', bg: 'bg-emerald-500', text: 'text-emerald-500', hex: '#10b981' },
  { name: 'Blue', bg: 'bg-blue-500', text: 'text-blue-500', hex: '#3b82f6' },
  { name: 'Violet', bg: 'bg-violet-500', text: 'text-violet-500', hex: '#8b5cf6' },
  { name: 'Rose', bg: 'bg-rose-500', text: 'text-rose-500', hex: '#f43f5e' },
  { name: 'Amber', bg: 'bg-amber-500', text: 'text-amber-500', hex: '#f59e0b' },
  { name: 'Cyan', bg: 'bg-cyan-500', text: 'text-cyan-500', hex: '#06b6d4' },
  { name: 'Fuchsia', bg: 'bg-fuchsia-500', text: 'text-fuchsia-500', hex: '#d946ef' },
  { name: 'Lime', bg: 'bg-lime-500', text: 'text-lime-500', hex: '#84cc16' },
];

const sizes = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export function ProgressBar({
  value,
  max = 100,
  variant = 'primary',
  size = 'md',
  showLabel = false,
  animated = false,
  className,
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const getVariant = () => {
    if (percentage >= 100) return 'success';
    if (percentage >= 70) return variant;
    if (percentage >= 40) return 'warning';
    return variant;
  };

  return (
    <div className={clsx('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between mb-1.5">
          <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
            Progress
          </span>
          <span className="text-sm font-medium text-surface-500 dark:text-surface-400">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div
        className={clsx(
          'w-full bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden',
          sizes[size]
        )}
      >
        <div
          className={clsx(
            'rounded-full transition-all duration-500 ease-out',
            variants[getVariant()],
            sizes[size],
            animated && 'animate-pulse-slow'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function CircularProgress({
  value,
  max = 100,
  size = 80,
  strokeWidth = 8,
  variant = 'primary',
  showLabel = true,
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 100) return '#22c55e';
    if (percentage >= 70) return '#6366f1';
    if (percentage >= 40) return '#f59e0b';
    return '#6366f1';
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-surface-200 dark:text-surface-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {showLabel && (
        <span className="absolute text-sm font-semibold text-surface-700 dark:text-surface-300">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}

/**
 * Segmented Progress Bar showing each user's contribution with different colors
 * @param {Array} assignees - Array of assignees with { id, first_name, last_name, pivot: { progress } }
 * @param {number} currentUserId - The current user's ID to highlight their segment
 * @param {string} size - Size of the progress bar (sm, md, lg)
 * @param {boolean} showLegend - Whether to show the legend with user colors
 */
export function SegmentedProgressBar({
  assignees = [],
  currentUserId,
  size = 'md',
  showLegend = true,
  className,
}) {
  const totalAssignees = assignees.length || 1;
  
  // Calculate each user's contribution to the overall progress
  // Each user's progress is divided by total assignees to get their share
  const segments = assignees.map((assignee, index) => {
    const userProgress = assignee.pivot?.progress ?? 0;
    const userStatus = assignee.pivot?.status ?? 'pending';
    const contribution = userProgress / totalAssignees;
    const color = segmentColors[index % segmentColors.length];
    
    return {
      id: assignee.id,
      name: `${assignee.first_name} ${assignee.last_name}`,
      progress: userProgress,
      status: userStatus,
      contribution,
      color,
      isCurrentUser: assignee.id === currentUserId,
    };
  });

  const overallProgress = segments.reduce((sum, seg) => sum + seg.contribution, 0);

  // Sort segments so current user appears last (on top visually in stacked bars)
  const sortedSegments = [...segments].sort((a, b) => {
    if (a.isCurrentUser) return 1;
    if (b.isCurrentUser) return -1;
    return 0;
  });

  // For stacked display, we need cumulative widths
  let cumulativeWidth = 0;
  const stackedSegments = sortedSegments
    .filter(seg => seg.contribution > 0)
    .map(seg => {
      const start = cumulativeWidth;
      cumulativeWidth += seg.contribution;
      return { ...seg, start, width: seg.contribution };
    })
    .reverse(); // Reverse so we render from right to left (later segments on top)

  return (
    <div className={clsx('w-full', className)}>
      {/* Progress bar header */}
      <div className="flex justify-between mb-1.5">
        <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
          Team Progress
        </span>
        <span className="text-sm font-bold text-primary-500">
          {Math.round(overallProgress)}%
        </span>
      </div>

      {/* Segmented bar */}
      <div
        className={clsx(
          'relative w-full bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden',
          sizes[size]
        )}
      >
        {stackedSegments.map((segment) => (
          <div
            key={segment.id}
            className={clsx(
              'absolute top-0 left-0 rounded-full transition-all duration-500 ease-out',
              segment.color.bg,
              sizes[size],
              segment.isCurrentUser && 'ring-2 ring-white dark:ring-surface-900 ring-offset-0'
            )}
            style={{ width: `${segment.start + segment.width}%` }}
            title={`${segment.name}: ${segment.progress}%`}
          />
        ))}
      </div>

      {/* Legend */}
      {showLegend && segments.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {segments.map((segment) => (
            <div
              key={segment.id}
              className={clsx(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all',
                segment.isCurrentUser
                  ? 'bg-surface-100 dark:bg-surface-800 ring-2 ring-primary-500'
                  : 'bg-surface-50 dark:bg-surface-800/50'
              )}
            >
              <div
                className={clsx(
                  'w-3 h-3 rounded-full flex-shrink-0',
                  segment.color.bg
                )}
              />
              <div className="flex flex-col min-w-0">
                <span className={clsx(
                  'font-medium leading-tight truncate',
                  segment.isCurrentUser 
                    ? 'text-surface-900 dark:text-white' 
                    : 'text-surface-600 dark:text-surface-400'
                )}>
                  {segment.isCurrentUser ? 'You' : segment.name}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className={clsx(
                    'text-[11px] font-medium capitalize px-1.5 py-0.5 rounded',
                    segment.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                    segment.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                    segment.status === 'under_review' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                    'bg-surface-200 dark:bg-surface-700 text-surface-500 dark:text-surface-400'
                  )}>
                    {segment.status?.replace('_', ' ') || 'pending'}
                  </span>
                </div>
              </div>
              <span className={clsx(
                'font-bold ml-1',
                segment.color.text
              )}>
                {segment.progress}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Export the segment colors for use elsewhere
export { segmentColors };

