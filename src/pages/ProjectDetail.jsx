import { useEffect, useState, Fragment } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  PlusIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  ChatBubbleLeftIcon,
  CalendarIcon,
  UserIcon,
  CheckCircleIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { useAuth } from '../contexts/AuthContext';
import { projectService, taskService, userService } from '../services/api';
import {
  Button,
  Input,
  Select,
  TextArea,
  Card,
  CardContent,
  CardHeader,
  Badge,
  ProgressBar,
  CircularProgress,
  SegmentedProgressBar,
  Modal,
  Spinner,
  EmptyState,
  Avatar,
  AvatarGroup,
} from '../components/ui';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

export function ProjectDetail() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const isProjectIncharge = project?.users?.some(
    (u) => u.id === user?.id && u.pivot?.role === 'incharge'
  );
  const canManageTasks = isAdmin || isProjectIncharge;

  useEffect(() => {
    loadProject();
    loadTasks();
  }, [id, search, statusFilter]);

  const loadProject = async () => {
    try {
      const response = await projectService.getOne(id);
      setProject(response.data);
    } catch (error) {
      console.error('Failed to load project:', error);
    }
  };

  const loadTasks = async () => {
    try {
      const response = await taskService.getAll(id, {
        search,
        status: statusFilter || undefined,
        per_page: 100,
      });
      setTasks(response.data.data || []);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await taskService.delete(id, taskId);
      toast.success('Task deleted successfully');
      loadTasks();
      loadProject();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!project) {
    return (
      <EmptyState
        title="Project not found"
        description="The project you're looking for doesn't exist or you don't have access to it."
        action={
          <Link to="/projects">
            <Button variant="secondary">Back to Projects</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          to="/projects"
          className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors mt-1"
        >
          <ArrowLeftIcon className="w-5 h-5 text-surface-500" />
        </Link>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white">
                {project.name}
              </h1>
              <p className="text-surface-500 dark:text-surface-400 mt-1">
                {project.description || 'No description'}
              </p>
            </div>
            {canManageTasks && (
              <Button
                onClick={() => setIsTaskModalOpen(true)}
                leftIcon={<PlusIcon className="w-5 h-5" />}
              >
                Add Task
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <CircularProgress value={project.progress || 0} size={60} strokeWidth={6} />
            <div>
              <p className="text-2xl font-bold text-surface-900 dark:text-white">
                {project.progress || 0}%
              </p>
              <p className="text-sm text-surface-500 dark:text-surface-400">Progress</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-2xl font-bold text-surface-900 dark:text-white">
              {project.total_tasks_count || 0}
            </p>
            <p className="text-sm text-surface-500 dark:text-surface-400">Total Tasks</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-2xl font-bold text-green-500">
              {project.completed_tasks_count || 0}
            </p>
            <p className="text-sm text-surface-500 dark:text-surface-400">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <Badge variant={statusColors[project.status]} size="lg">
              {project.status?.replace('_', ' ')}
            </Badge>
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-2">Status</p>
          </CardContent>
        </Card>
      </div>

      {/* Team */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white">Team</h2>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {project.users?.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 px-4 py-2 bg-surface-50 dark:bg-surface-800/50 rounded-xl"
              >
                <Avatar
                  name={`${member.first_name} ${member.last_name}`}
                  src={member.profile_picture}
                  size="sm"
                />
                <div>
                  <p className="text-sm font-medium text-surface-900 dark:text-white">
                    {member.first_name} {member.last_name}
                  </p>
                  <p className="text-xs text-surface-500 dark:text-surface-400 capitalize">
                    {member.pivot?.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tasks */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white">Tasks</h2>
          <div className="flex gap-3">
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<MagnifyingGlassIcon className="w-4 h-4" />}
              containerClassName="w-48"
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'All' },
                { value: 'pending', label: 'Pending' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'under_review', label: 'Under Review' },
                { value: 'completed', label: 'Completed' },
              ]}
              containerClassName="w-36"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {tasks.length === 0 ? (
            <div className="p-8 text-center text-surface-500 dark:text-surface-400">
              No tasks found
            </div>
          ) : (
            <div className="divide-y divide-surface-100 dark:divide-surface-700">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <button
                          onClick={() => setSelectedTask(task)}
                          className="font-medium text-surface-900 dark:text-white hover:text-primary-500 transition-colors text-left"
                        >
                          {task.title}
                        </button>
                        <Badge variant={priorityColors[task.priority]} size="sm">
                          {task.priority}
                        </Badge>
                        <Badge variant={statusColors[task.status]} size="sm">
                          {task.status?.replace('_', ' ')}
                        </Badge>
                        {(task.is_accepted || task.accepted_at) && (
                          <Badge variant="success" size="sm">
                            <CheckCircleIcon className="w-3 h-3 mr-1" />
                            Accepted
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-surface-500 dark:text-surface-400">
                        {task.due_date && (
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4" />
                            {format(new Date(task.due_date), 'MMM d, yyyy')}
                          </span>
                        )}
                        {task.assignees?.length > 0 && (
                          <span className="flex items-center gap-1">
                            <UserIcon className="w-4 h-4" />
                            {task.assignees.length} assignee{task.assignees.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      
                      {/* Mini Segmented Progress Bar */}
                      <div className="mt-3">
                        {task.assignees?.length > 1 ? (
                          <SegmentedProgressBar
                            assignees={task.assignees}
                            currentUserId={user?.id}
                            size="sm"
                            showLegend={false}
                          />
                        ) : (
                          <ProgressBar value={task.overall_progress ?? task.progress} size="sm" showLabel />
                        )}
                      </div>
                    </div>

                    {task.assignees?.length > 0 && (
                      <AvatarGroup max={3} size="sm">
                        {task.assignees.map((assignee) => (
                          <Avatar
                            key={assignee.id}
                            name={`${assignee.first_name} ${assignee.last_name}`}
                            src={assignee.profile_picture}
                            size="sm"
                          />
                        ))}
                      </AvatarGroup>
                    )}

                    {canManageTasks && (
                      <Menu as="div" className="relative">
                        <MenuButton className="p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700">
                          <EllipsisVerticalIcon className="w-5 h-5 text-surface-400" />
                        </MenuButton>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <MenuItems className="absolute right-0 mt-2 w-40 origin-top-right rounded-xl bg-white dark:bg-surface-800 shadow-lg ring-1 ring-black/5 dark:ring-white/5 focus:outline-none p-1 z-10">
                            <MenuItem>
                              {({ active }) => (
                                <button
                                  onClick={() => {
                                    setEditingTask(task);
                                    setIsTaskModalOpen(true);
                                  }}
                                  className={clsx(
                                    'flex w-full items-center px-3 py-2 text-sm rounded-lg',
                                    active && 'bg-surface-100 dark:bg-surface-700'
                                  )}
                                >
                                  Edit
                                </button>
                              )}
                            </MenuItem>
                            <MenuItem>
                              {({ active }) => (
                                <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  className={clsx(
                                    'flex w-full items-center px-3 py-2 text-sm rounded-lg text-red-600 dark:text-red-400',
                                    active && 'bg-red-50 dark:bg-red-900/20'
                                  )}
                                >
                                  Delete
                                </button>
                              )}
                            </MenuItem>
                          </MenuItems>
                        </Transition>
                      </Menu>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        projectId={id}
        task={editingTask}
        projectUsers={project.users || []}
        canManage={canManageTasks}
        onSuccess={() => {
          loadTasks();
          loadProject();
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        projectId={id}
        task={selectedTask}
        projectUsers={project.users || []}
        canManage={canManageTasks}
        onUpdate={async (updatedTask) => {
          loadTasks();
          loadProject();
          // Update selected task with the response data if provided
          if (updatedTask) {
            setSelectedTask(updatedTask);
          }
        }}
      />
    </div>
  );
}

function TaskModal({ isOpen, onClose, projectId, task, projectUsers, canManage, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    due_date: '',
    assignees: [],
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'pending',
        priority: task.priority || 'medium',
        due_date: task.due_date || '',
        assignees: task.assignees?.map((a) => a.id) || [],
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        due_date: '',
        assignees: [],
      });
    }
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (task) {
        await taskService.update(projectId, task.id, formData);
        if (canManage) {
          await taskService.assignUsers(projectId, task.id, { assignees: formData.assignees });
        }
        toast.success('Task updated successfully');
      } else {
        await taskService.create(projectId, formData);
        toast.success('Task created successfully');
      }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssigneeToggle = (userId) => {
    setFormData((prev) => {
      const current = prev.assignees;
      if (current.includes(userId)) {
        return { ...prev, assignees: current.filter((id) => id !== userId) };
      }
      return { ...prev, assignees: [...current, userId] };
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'Edit Task' : 'Create Task'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Task Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter task title"
          required
        />

        <TextArea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the task"
          rows={3}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={[
              { value: 'pending', label: 'Pending' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'under_review', label: 'Under Review' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />

          <Select
            label="Priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
              { value: 'urgent', label: 'Urgent' },
            ]}
          />
        </div>

        <Input
          label="Due Date"
          type="date"
          name="due_date"
          value={formData.due_date}
          onChange={handleChange}
        />

        {canManage && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
              Assign To
            </label>
            <div className="flex flex-wrap gap-2 p-3 border border-surface-200 dark:border-surface-700 rounded-xl bg-surface-50 dark:bg-surface-800/50 max-h-32 overflow-y-auto">
              {projectUsers
                .filter((u) => u.pivot?.role === 'member')
                .map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleAssigneeToggle(user.id)}
                    className={clsx(
                      'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
                      formData.assignees.includes(user.id)
                        ? 'bg-primary-500 text-white'
                        : 'bg-white dark:bg-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-600'
                    )}
                  >
                    <Avatar name={`${user.first_name} ${user.last_name}`} size="xs" />
                    {user.first_name} {user.last_name}
                  </button>
                ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {task ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function TaskDetailModal({ isOpen, onClose, projectId, task, projectUsers, canManage, onUpdate }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [myProgress, setMyProgress] = useState(0);
  const [status, setStatus] = useState('pending');
  const [comment, setComment] = useState('');

  const isAssignee = task?.assignees?.some((a) => a.id === user?.id);
  const isAccepted = task?.is_accepted || task?.accepted_at;
  const canUpdateProgress = (canManage || isAssignee) && !isAccepted;
  const assigneeCount = task?.assignees?.length || 1;
  
  // Calculate overall progress from all assignees
  const overallProgress = task?.overall_progress ?? task?.progress ?? 0;
  
  // Get current user's individual progress from pivot
  const getUserProgress = () => {
    if (!task?.assignees) return 0;
    const userAssignment = task.assignees.find((a) => a.id === user?.id);
    return userAssignment?.pivot?.progress ?? task?.my_progress ?? 0;
  };

  // Get current user's individual status from pivot
  const getUserStatus = () => {
    if (!task?.assignees) return task?.status || 'pending';
    const userAssignment = task.assignees.find((a) => a.id === user?.id);
    return userAssignment?.pivot?.status ?? task?.my_status ?? 'pending';
  };

  useEffect(() => {
    if (task) {
      setMyProgress(getUserProgress());
      // For assignees, use their individual status; for managers, use task status
      setStatus(isAssignee ? getUserStatus() : (task.status || 'pending'));
    }
  }, [task]);

  const handleUpdateProgress = async () => {
    setLoading(true);
    try {
      // Send both progress and status (backend handles individually per user)
      const updateData = { progress: myProgress, status };
      
      const response = await taskService.update(projectId, task.id, updateData);
      toast.success('Progress updated');
      // Pass the updated task data to refresh the modal
      onUpdate(response.data.task);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update progress');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTask = async () => {
    setAccepting(true);
    try {
      const response = await taskService.accept(projectId, task.id);
      toast.success('Task accepted successfully');
      // Pass the updated task data to refresh the modal
      onUpdate(response.data.task);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept task');
    } finally {
      setAccepting(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      await taskService.addComment(projectId, task.id, comment);
      setComment('');
      toast.success('Comment added');
      onUpdate();
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  if (!task) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task.title} size="lg">
      <div className="space-y-6">
        {/* Accepted Banner */}
        {isAccepted && (
          <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
            <LockClosedIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-300">
                Task Accepted
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                Accepted by {task.accepter?.first_name} {task.accepter?.last_name}
                {task.accepted_at && ` on ${format(new Date(task.accepted_at), 'MMM d, yyyy')}`}
              </p>
            </div>
          </div>
        )}

        {/* Task Info */}
        <div className="flex flex-wrap gap-3">
          <Badge
            variant={
              task.priority === 'urgent' || task.priority === 'high' ? 'danger' : 'warning'
            }
          >
            {task.priority} priority
          </Badge>
          <Badge
            variant={
              task.status === 'completed'
                ? 'success'
                : task.status === 'in_progress'
                ? 'info'
                : 'default'
            }
          >
            {task.status?.replace('_', ' ')}
          </Badge>
          {isAccepted && (
            <Badge variant="success">
              <CheckCircleIcon className="w-3.5 h-3.5 mr-1" />
              Accepted
            </Badge>
          )}
          {task.due_date && (
            <Badge variant="default">
              Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
            </Badge>
          )}
        </div>

        {/* Description */}
        {task.description && (
          <div>
            <h4 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              Description
            </h4>
            <p className="text-surface-600 dark:text-surface-400">{task.description}</p>
          </div>
        )}

        {/* Segmented Team Progress */}
        {task.assignees?.length > 0 && (
          <div className="p-4 bg-surface-50 dark:bg-surface-800/50 rounded-xl">
            <SegmentedProgressBar
              assignees={task.assignees}
              currentUserId={user?.id}
              size="lg"
              showLegend={false}
            />
          </div>
        )}

        {/* Individual Assignee Progress & Status */}
        {task.assignees?.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-surface-700 dark:text-surface-300">
              Assignees Progress
            </h4>
            <div className="space-y-2">
              {task.assignees.map((assignee) => {
                const userProgress = assignee.pivot?.progress ?? 0;
                const userStatus = assignee.pivot?.status ?? 'pending';
                const isCurrentUser = assignee.id === user?.id;
                
                return (
                  <div
                    key={assignee.id}
                    className={clsx(
                      'p-3 rounded-lg border transition-all',
                      isCurrentUser
                        ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800'
                        : 'bg-surface-50 dark:bg-surface-800/50 border-surface-200 dark:border-surface-700'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar
                          name={`${assignee.first_name} ${assignee.last_name}`}
                          src={assignee.profile_picture}
                          size="sm"
                        />
                        <div>
                          <span className={clsx(
                            'text-sm font-medium',
                            isCurrentUser 
                              ? 'text-primary-700 dark:text-primary-300' 
                              : 'text-surface-700 dark:text-surface-300'
                          )}>
                            {assignee.first_name} {assignee.last_name}
                            {isCurrentUser && <span className="ml-1 text-xs">(You)</span>}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            userStatus === 'completed' ? 'success' :
                            userStatus === 'in_progress' ? 'info' :
                            userStatus === 'under_review' ? 'warning' :
                            'default'
                          }
                          size="sm"
                        >
                          {userStatus.replace('_', ' ')}
                        </Badge>
                        <span className={clsx(
                          'text-sm font-bold',
                          userProgress === 100 ? 'text-green-500' :
                          userProgress > 50 ? 'text-blue-500' :
                          userProgress > 0 ? 'text-amber-500' :
                          'text-surface-400'
                        )}>
                          {userProgress}%
                        </span>
                      </div>
                    </div>
                    <ProgressBar 
                      value={userProgress} 
                      size="sm" 
                      variant={userProgress === 100 ? 'success' : 'primary'}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Fallback for tasks without assignees */}
        {(!task.assignees || task.assignees.length === 0) && (
          <div className="space-y-3 p-4 bg-surface-50 dark:bg-surface-800/50 rounded-xl">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-surface-700 dark:text-surface-300">
                Overall Progress
              </h4>
              <span className="text-lg font-bold text-primary-500">{overallProgress}%</span>
            </div>
            <ProgressBar value={overallProgress} size="md" />
          </div>
        )}

        {/* Accept Task Button for managers when task is completed but not accepted */}
        {canManage && task.status === 'completed' && !isAccepted && (
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  Task Pending Acceptance
                </h4>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  Review and accept this completed task to lock further changes.
                </p>
              </div>
              <Button
                onClick={handleAcceptTask}
                loading={accepting}
                className="bg-green-600 hover:bg-green-700"
                leftIcon={<CheckCircleIcon className="w-5 h-5" />}
              >
                Accept Task
              </Button>
            </div>
          </div>
        )}

        {/* Locked message when task is accepted */}
        {isAccepted && isAssignee && (
          <div className="p-4 bg-surface-100 dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700">
            <div className="flex items-center gap-3 text-surface-500 dark:text-surface-400">
              <LockClosedIcon className="w-5 h-5" />
              <span className="text-sm">
                This task has been accepted and can no longer be modified.
              </span>
            </div>
          </div>
        )}

        {/* Progress Update for current user (assignee only, not manager) */}
        {canUpdateProgress && isAssignee && !canManage && (
          <div className="space-y-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-200 dark:border-primary-800">
            <h4 className="text-sm font-medium text-primary-700 dark:text-primary-300">
              Update Your Progress & Status
            </h4>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={myProgress}
                onChange={(e) => setMyProgress(Number(e.target.value))}
                className="flex-1 accent-primary-500"
              />
              <span className="text-sm font-bold w-12 text-right text-primary-600 dark:text-primary-400">
                {myProgress}%
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={[
                  { value: 'pending', label: 'Pending' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'under_review', label: 'Under Review' },
                  { value: 'completed', label: 'Completed' },
                ]}
                containerClassName="flex-1"
              />
              <Button onClick={handleUpdateProgress} loading={loading}>
                Update
              </Button>
            </div>
            <p className="text-xs text-primary-600 dark:text-primary-400">
              Overall task completes when all assignees are completed
            </p>
          </div>
        )}

        {/* Progress Update for managers who are also assignees */}
        {canUpdateProgress && isAssignee && canManage && (
          <div className="space-y-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-200 dark:border-primary-800">
            <h4 className="text-sm font-medium text-primary-700 dark:text-primary-300">
              Update Your Progress
            </h4>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={myProgress}
                onChange={(e) => setMyProgress(Number(e.target.value))}
                className="flex-1 accent-primary-500"
              />
              <span className="text-sm font-bold w-12 text-right text-primary-600 dark:text-primary-400">
                {myProgress}%
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={[
                  { value: 'pending', label: 'Pending' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'under_review', label: 'Under Review' },
                  { value: 'completed', label: 'Completed' },
                ]}
                containerClassName="flex-1"
              />
              <Button onClick={handleUpdateProgress} loading={loading}>
                Update
              </Button>
            </div>
          </div>
        )}

        {/* Progress Update for managers (when not an assignee) */}
        {canManage && !isAssignee && !isAccepted && (
          <div className="space-y-4 p-4 bg-surface-50 dark:bg-surface-800/50 rounded-xl">
            <h4 className="text-sm font-medium text-surface-700 dark:text-surface-300">
              Update Task Status
            </h4>
            <div className="flex items-center gap-4">
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={[
                  { value: 'pending', label: 'Pending' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'under_review', label: 'Under Review' },
                  { value: 'completed', label: 'Completed' },
                ]}
                containerClassName="flex-1"
              />
              <Button onClick={handleUpdateProgress} loading={loading}>
                Update
              </Button>
            </div>
          </div>
        )}

        {/* Comments */}
        <div>
          <h4 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
            Comments
          </h4>
          <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
            <Input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              containerClassName="flex-1"
            />
            <Button type="submit" variant="secondary">
              <ChatBubbleLeftIcon className="w-5 h-5" />
            </Button>
          </form>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {task.comments?.map((comment) => (
              <div
                key={comment.id}
                className="flex gap-3 p-3 bg-surface-50 dark:bg-surface-800/50 rounded-lg"
              >
                <Avatar
                  name={`${comment.user?.first_name} ${comment.user?.last_name}`}
                  size="sm"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-surface-900 dark:text-white">
                      {comment.user?.first_name} {comment.user?.last_name}
                    </span>
                    <span className="text-xs text-surface-500">
                      {format(new Date(comment.created_at), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <p className="text-sm text-surface-600 dark:text-surface-400">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
            {(!task.comments || task.comments.length === 0) && (
              <p className="text-sm text-surface-500 dark:text-surface-400 text-center py-4">
                No comments yet
              </p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

