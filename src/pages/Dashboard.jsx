import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { dashboardService } from '../services/api';
import {
  Card,
  CardContent,
  CardHeader,
  Badge,
  ProgressBar,
  Spinner,
  Avatar,
} from '../components/ui';
import { format } from 'date-fns';

export function Dashboard() {
  const { user, isAdmin, isIncharge } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await dashboardService.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const statCards = isAdmin
    ? [
        {
          name: 'Total Users',
          value: stats?.total_users || 0,
          icon: UsersIcon,
          color: 'primary',
        },
        {
          name: 'Total Projects',
          value: stats?.total_projects || 0,
          icon: FolderIcon,
          color: 'accent',
        },
        {
          name: 'Total Tasks',
          value: stats?.total_tasks || 0,
          icon: ClipboardDocumentListIcon,
          color: 'info',
        },
        {
          name: 'Completed Tasks',
          value: stats?.tasks_by_status?.completed || 0,
          icon: CheckCircleIcon,
          color: 'success',
        },
      ]
    : isIncharge
    ? [
        {
          name: 'My Projects',
          value: stats?.total_projects || 0,
          icon: FolderIcon,
          color: 'primary',
        },
        {
          name: 'Total Tasks',
          value: stats?.total_tasks || 0,
          icon: ClipboardDocumentListIcon,
          color: 'accent',
        },
        {
          name: 'In Progress',
          value: stats?.tasks_by_status?.in_progress || 0,
          icon: ClockIcon,
          color: 'warning',
        },
        {
          name: 'Overdue',
          value: stats?.overdue_tasks?.length || 0,
          icon: ExclamationTriangleIcon,
          color: 'danger',
        },
      ]
    : [
        {
          name: 'Assigned Tasks',
          value: stats?.total_assigned_tasks || 0,
          icon: ClipboardDocumentListIcon,
          color: 'primary',
        },
        {
          name: 'Completed',
          value: stats?.completed_tasks || 0,
          icon: CheckCircleIcon,
          color: 'success',
        },
        {
          name: 'In Progress',
          value: stats?.in_progress_tasks || 0,
          icon: ClockIcon,
          color: 'warning',
        },
        {
          name: 'Pending',
          value: stats?.pending_tasks || 0,
          icon: ExclamationTriangleIcon,
          color: 'info',
        },
      ];

  const colorClasses = {
    primary: 'bg-primary-500/10 text-primary-600 dark:text-primary-400',
    accent: 'bg-accent-500/10 text-accent-600 dark:text-accent-400',
    success: 'bg-green-500/10 text-green-600 dark:text-green-400',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    danger: 'bg-red-500/10 text-red-600 dark:text-red-400',
    info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card
            key={stat.name}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${colorClasses[stat.color]}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-surface-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-sm text-surface-500 dark:text-surface-400">
                    {stat.name}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card className="animate-slide-up animate-delay-200">
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
              Recent Projects
            </h2>
            <Link
              to="/projects"
              className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-surface-100 dark:divide-surface-700">
              {(stats?.recent_projects || stats?.my_projects || [])
                .slice(0, 5)
                .map((project) => (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-semibold">
                      {project.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-surface-900 dark:text-white truncate">
                        {project.name}
                      </p>
                      <p className="text-sm text-surface-500 dark:text-surface-400">
                        {project.tasks_count || 0} tasks
                      </p>
                    </div>
                    <Badge variant={project.status === 'active' ? 'success' : 'default'}>
                      {project.status}
                    </Badge>
                  </Link>
                ))}
              {(stats?.recent_projects || stats?.my_projects || []).length === 0 && (
                <div className="p-8 text-center text-surface-500 dark:text-surface-400">
                  No projects yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Tasks */}
        <Card className="animate-slide-up animate-delay-300">
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
              Recent Tasks
            </h2>
            <Link
              to="/my-tasks"
              className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-surface-100 dark:divide-surface-700">
              {(stats?.recent_tasks || []).slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="p-4 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-surface-900 dark:text-white truncate">
                        {task.title}
                      </p>
                      <p className="text-sm text-surface-500 dark:text-surface-400">
                        {task.project?.name}
                      </p>
                    </div>
                    <Badge
                      variant={
                        task.priority === 'urgent'
                          ? 'danger'
                          : task.priority === 'high'
                          ? 'warning'
                          : 'default'
                      }
                      size="sm"
                    >
                      {task.priority}
                    </Badge>
                  </div>
                  <ProgressBar value={task.overall_progress ?? task.progress} size="sm" />
                </div>
              ))}
              {(stats?.recent_tasks || []).length === 0 && (
                <div className="p-8 text-center text-surface-500 dark:text-surface-400">
                  No tasks yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Tasks (if any) */}
      {(stats?.overdue_tasks?.length > 0 || stats?.upcoming_tasks?.length > 0) && (
        <Card className="animate-slide-up animate-delay-400 border-amber-200 dark:border-amber-800">
          <CardHeader className="bg-amber-50 dark:bg-amber-900/20">
            <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5" />
              {stats?.overdue_tasks?.length > 0 ? 'Overdue Tasks' : 'Upcoming Deadlines'}
            </h2>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-surface-100 dark:divide-surface-700">
              {(stats?.overdue_tasks || stats?.upcoming_tasks || [])
                .slice(0, 5)
                .map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-4 p-4 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-surface-900 dark:text-white">
                        {task.title}
                      </p>
                      <p className="text-sm text-surface-500 dark:text-surface-400">
                        {task.project?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-600 dark:text-red-400">
                        {task.due_date
                          ? format(new Date(task.due_date), 'MMM d, yyyy')
                          : 'No due date'}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

