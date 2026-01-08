import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  FolderIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { taskService } from '../services/api';
import {
  Input,
  Select,
  Card,
  CardContent,
  Badge,
  ProgressBar,
  Spinner,
  EmptyState,
  Avatar,
  Button,
} from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { format, isPast, parseISO, startOfDay } from 'date-fns';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

// Helper to check if a task is overdue
const isTaskOverdue = (task) => {
  if (!task.due_date) return false;
  if (task.status === 'completed' || task.status === 'cancelled') return false;
  const dueDate = startOfDay(parseISO(task.due_date));
  const today = startOfDay(new Date());
  return isPast(dueDate) && dueDate < today;
};

// Color assignments for team members
const ASSIGNEE_COLORS = [
  { bg: 'bg-emerald-500', text: 'text-emerald-500', light: 'bg-emerald-500/20' },
  { bg: 'bg-blue-500', text: 'text-blue-500', light: 'bg-blue-500/20' },
  { bg: 'bg-purple-500', text: 'text-purple-500', light: 'bg-purple-500/20' },
  { bg: 'bg-amber-500', text: 'text-amber-500', light: 'bg-amber-500/20' },
  { bg: 'bg-pink-500', text: 'text-pink-500', light: 'bg-pink-500/20' },
  { bg: 'bg-cyan-500', text: 'text-cyan-500', light: 'bg-cyan-500/20' },
];

const statusColors = {
  pending: 'default',
  in_progress: 'info',
  under_review: 'warning',
  completed: 'success',
  cancelled: 'danger',
};

const priorityColors = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
  urgent: 'danger',
};

// Compact Team Progress Bar Component
function CompactTeamProgress({ assignees, currentUserId }) {
  if (!assignees?.length) return null;
  
  const overallProgress = Math.round(
    assignees.reduce((sum, a) => sum + (a.pivot?.progress || 0), 0) / assignees.length
  );

  return (
    <div className="flex items-center gap-3">
      {/* Mini stacked progress bar */}
      <div className="flex-1 h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden flex">
        {assignees.map((assignee, idx) => {
          const progress = assignee.pivot?.progress || 0;
          const contribution = progress / assignees.length;
          const color = ASSIGNEE_COLORS[idx % ASSIGNEE_COLORS.length];
          return (
            <div
              key={assignee.id}
              className={`${color.bg} transition-all duration-300`}
              style={{ width: `${contribution}%` }}
            />
          );
        })}
      </div>
      <span className="text-sm font-semibold text-primary-500 min-w-[3rem] text-right">
        {overallProgress}%
      </span>
    </div>
  );
}

// Task Row Component
function TaskRow({ task, user, onUpdate, updating }) {
  const [expanded, setExpanded] = useState(false);
  const isAccepted = task.is_accepted || task.accepted_at;
  
  const handleProgressChange = (progress) => {
    onUpdate(task, progress, undefined);
  };
  
  const handleStatusChange = (status) => {
    onUpdate(task, undefined, status);
  };

  return (
    <Card className="animate-slide-up overflow-hidden">
      {/* Main Row - Always Visible */}
      <div 
        className="p-4 cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          {/* Task Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-semibold text-surface-900 dark:text-white truncate">
                {task.title}
              </h3>
              <Badge variant={priorityColors[task.priority]} size="sm">
                {task.priority}
              </Badge>
              <Badge variant={statusColors[task.status]} size="sm">
                {task.status?.replace('_', ' ')}
              </Badge>
              {isAccepted && (
                <Badge variant="success" size="sm">
                  <CheckCircleIcon className="w-3 h-3 mr-1" />
                  Accepted
                </Badge>
              )}
              {isTaskOverdue(task) && (
                <Badge variant="danger" size="sm">
                  <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                  Overdue
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs text-surface-500 dark:text-surface-400">
              <Link
                to={`/projects/${task.project?.id}`}
                className="flex items-center gap-1 hover:text-primary-500 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <FolderIcon className="w-3.5 h-3.5" />
                {task.project?.name}
              </Link>
              {task.due_date && (
                <span className={clsx(
                  "flex items-center gap-1",
                  isTaskOverdue(task) && "text-red-500 dark:text-red-400 font-medium"
                )}>
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {format(new Date(task.due_date), 'MMM d, yyyy')}
                </span>
              )}
            </div>
          </div>

          {/* Team Avatars */}
          <div className="hidden sm:flex items-center -space-x-2">
            {task.assignees?.slice(0, 4).map((assignee, idx) => (
              <div
                key={assignee.id}
                className={`ring-2 ring-white dark:ring-surface-900 rounded-full ${
                  assignee.id === user?.id ? 'ring-primary-500' : ''
                }`}
                title={assignee.id === user?.id ? 'You' : assignee.name}
              >
                <Avatar
                  src={assignee.avatar}
                  name={assignee.name}
                  size="sm"
                />
              </div>
            ))}
            {task.assignees?.length > 4 && (
              <div className="w-8 h-8 rounded-full bg-surface-200 dark:bg-surface-700 flex items-center justify-center text-xs font-medium ring-2 ring-white dark:ring-surface-900">
                +{task.assignees.length - 4}
              </div>
            )}
          </div>

          {/* Progress Indicator */}
          <div className="w-32 sm:w-40">
            <CompactTeamProgress assignees={task.assignees} currentUserId={user?.id} />
          </div>

          {/* Your Status Pill */}
          <div className="hidden md:block">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              task.my_status === 'completed' 
                ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400'
                : task.my_status === 'in_progress'
                ? 'bg-info-100 text-info-700 dark:bg-info-900/30 dark:text-info-400'
                : 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400'
            }`}>
              You: {task.my_progress ?? 0}%
            </div>
          </div>

          {/* Expand Icon */}
          <button className="p-1 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors">
            {expanded ? (
              <ChevronUpIcon className="w-5 h-5" />
            ) : (
              <ChevronDownIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Section */}
      {expanded && (
        <div className="border-t border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50 p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Task Details & Team Progress */}
            <div className="space-y-4">
              {task.description && (
                <div>
                  <h4 className="text-xs font-medium text-surface-500 dark:text-surface-400 mb-1">Description</h4>
                  <p className="text-sm text-surface-700 dark:text-surface-300">{task.description}</p>
                </div>
              )}
              
              {/* Team Members Progress */}
              <div>
                <h4 className="text-xs font-medium text-surface-500 dark:text-surface-400 mb-3">Team Progress</h4>
                <div className="space-y-2">
                  {task.assignees?.map((assignee, idx) => {
                    const color = ASSIGNEE_COLORS[idx % ASSIGNEE_COLORS.length];
                    const isYou = assignee.id === user?.id;
                    const progress = assignee.pivot?.progress || 0;
                    const status = assignee.pivot?.status || 'pending';
                    
                    return (
                      <div key={assignee.id} className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${color.bg}`} />
                        <Avatar src={assignee.avatar} name={assignee.name} size="xs" />
                        <span className={`text-sm flex-1 ${isYou ? 'font-medium text-primary-500' : 'text-surface-700 dark:text-surface-300'}`}>
                          {isYou ? 'You' : assignee.name}
                        </span>
                        <div className="w-24 h-1.5 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                          <div className={`h-full ${color.bg} transition-all`} style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-xs font-medium text-surface-600 dark:text-surface-400 w-10 text-right">
                          {progress}%
                        </span>
                        <Badge 
                          variant={statusColors[status]} 
                          size="sm"
                          className="w-20 justify-center text-xs"
                        >
                          {status.replace('_', ' ')}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Your Controls */}
            <div className="lg:border-l lg:border-surface-200 lg:dark:border-surface-700 lg:pl-6">
              {isAccepted ? (
                <div className="flex items-center gap-2 p-4 bg-surface-100 dark:bg-surface-800 rounded-lg text-surface-500 dark:text-surface-400">
                  <LockClosedIcon className="w-5 h-5" />
                  <span className="text-sm">Task accepted - no further changes allowed</span>
                </div>
              ) : (
                <div className="space-y-4 relative">
                  {/* Loading Overlay */}
                  {updating && (
                    <div className="absolute inset-0 bg-surface-50/80 dark:bg-surface-800/80 rounded-lg flex items-center justify-center z-10">
                      <div className="flex items-center gap-2 text-primary-500">
                        <Spinner size="sm" />
                        <span className="text-sm font-medium">Updating...</span>
                      </div>
                    </div>
                  )}
                  
                  <h4 className="text-xs font-medium text-surface-500 dark:text-surface-400">Update Your Progress</h4>
                  
                  {/* Progress Slider */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-surface-600 dark:text-surface-400">Your Progress</span>
                      <span className="text-lg font-bold text-primary-500">{task.my_progress ?? 0}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={task.my_progress ?? 0}
                      onChange={(e) => handleProgressChange(Number(e.target.value))}
                      disabled={updating}
                      className={`w-full h-2 accent-primary-500 ${updating ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                    />
                    <div className="flex justify-between text-xs text-surface-400 mt-1">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  
                  {/* Status Dropdown */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-surface-600 dark:text-surface-400">Your Status</span>
                      <Badge variant={statusColors[task.my_status] || 'default'} size="sm">
                        {(task.my_status || 'pending').replace('_', ' ')}
                      </Badge>
                    </div>
                    <Select
                      value={task.my_status || 'pending'}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      options={[
                        { value: 'pending', label: 'Pending' },
                        { value: 'in_progress', label: 'In Progress' },
                        { value: 'under_review', label: 'Under Review' },
                        { value: 'completed', label: 'Completed' },
                      ]}
                      disabled={updating}
                      containerClassName="w-full"
                    />
                  </div>
                  
                  <p className="text-xs text-surface-400 dark:text-surface-500 italic">
                    💡 Setting progress to 100% will automatically mark your status as completed
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export function MyTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [updatingTask, setUpdatingTask] = useState(null);

  useEffect(() => {
    loadTasks();
  }, [search, statusFilter, priorityFilter]);

  const loadTasks = async () => {
    try {
      const response = await taskService.getMyTasks({
        search,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        per_page: 50,
      });
      setTasks(response.data.data || []);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = async (task, progress, status) => {
    setUpdatingTask(task.id);
    try {
      const updateData = {};
      if (progress !== undefined) updateData.progress = progress;
      if (status !== undefined) updateData.status = status;
      
      await taskService.update(task.project_id, task.id, updateData);
      toast.success('Progress updated');
      loadTasks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update progress');
    } finally {
      setUpdatingTask(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white">
          My Tasks
        </h1>
        <p className="text-surface-500 dark:text-surface-400">
          View and update your assigned tasks
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<MagnifyingGlassIcon className="w-5 h-5" />}
          containerClassName="flex-1 max-w-md"
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: '', label: 'All Status' },
            { value: 'pending', label: 'Pending' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'under_review', label: 'Under Review' },
            { value: 'completed', label: 'Completed' },
            { value: 'overdue', label: 'Overdue' },
            { value: 'accepted', label: 'Accepted' },
          ]}
          containerClassName="w-40"
        />
        <Select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          options={[
            { value: '', label: 'All Priority' },
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
            { value: 'urgent', label: 'Urgent' },
          ]}
          containerClassName="w-36"
        />
      </div>

      {/* Tasks */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={ClipboardDocumentListIcon}
          title="No tasks found"
          description={search || statusFilter || priorityFilter ? 'Try adjusting your filters' : 'You have no assigned tasks yet'}
        />
      ) : (
        <div className="space-y-3">
          {tasks.map((task, index) => (
            <TaskRow
              key={task.id}
              task={task}
              user={user}
              onUpdate={handleUpdateProgress}
              updating={updatingTask === task.id}
              style={{ animationDelay: `${index * 50}ms` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
