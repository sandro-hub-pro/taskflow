import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FolderIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { projectService, userService } from '../services/api';
import {
  Button,
  Input,
  Select,
  Card,
  CardContent,
  Badge,
  ProgressBar,
  Modal,
  TextArea,
  Spinner,
  EmptyState,
  Avatar,
  AvatarGroup,
} from '../components/ui';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

export function Projects() {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadProjects();
    if (isAdmin) {
      loadUsers();
    }
  }, [search, status, isAdmin]);

  const loadProjects = async () => {
    try {
      const response = await projectService.getAll({
        search,
        status: status || undefined,
        per_page: 50,
      });
      setProjects(response.data.data || []);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await userService.getAll({ per_page: 100 });
      setUsers(response.data.data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      await projectService.delete(id);
      toast.success('Project deleted successfully');
      loadProjects();
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const statusColors = {
    planning: 'default',
    active: 'success',
    on_hold: 'warning',
    completed: 'info',
    cancelled: 'danger',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white">
            Projects
          </h1>
          <p className="text-surface-500 dark:text-surface-400">
            Manage your projects and track progress
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsModalOpen(true)} leftIcon={<PlusIcon className="w-5 h-5" />}>
            New Project
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<MagnifyingGlassIcon className="w-5 h-5" />}
          containerClassName="flex-1 max-w-md"
        />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { value: '', label: 'All Status' },
            { value: 'planning', label: 'Planning' },
            { value: 'active', label: 'Active' },
            { value: 'on_hold', label: 'On Hold' },
            { value: 'completed', label: 'Completed' },
            { value: 'cancelled', label: 'Cancelled' },
          ]}
          containerClassName="w-40"
        />
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderIcon}
          title="No projects found"
          description={search ? 'Try adjusting your search' : 'Get started by creating your first project'}
          action={
            isAdmin && (
              <Button onClick={() => setIsModalOpen(true)} leftIcon={<PlusIcon className="w-5 h-5" />}>
                Create Project
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <Card
              key={project.id}
              hover
              className="animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <Link
                    to={`/projects/${project.id}`}
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {project.name[0]}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-surface-900 dark:text-white truncate">
                        {project.name}
                      </h3>
                      <p className="text-sm text-surface-500 dark:text-surface-400">
                        {project.tasks_count || 0} tasks
                      </p>
                    </div>
                  </Link>
                  {isAdmin && (
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
                                  setEditingProject(project);
                                  setIsModalOpen(true);
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
                                onClick={() => handleDelete(project.id)}
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

                <p className="text-sm text-surface-600 dark:text-surface-400 mb-4 line-clamp-2">
                  {project.description || 'No description'}
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant={statusColors[project.status]}>
                      {project.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-surface-500 dark:text-surface-400">
                      {project.progress || 0}%
                    </span>
                  </div>
                  <ProgressBar value={project.progress || 0} size="sm" />
                </div>

                {project.users?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-surface-100 dark:border-surface-700">
                    <AvatarGroup max={4} size="sm">
                      {project.users.map((user) => (
                        <Avatar
                          key={user.id}
                          name={`${user.first_name} ${user.last_name}`}
                          src={user.profile_picture}
                          size="sm"
                        />
                      ))}
                    </AvatarGroup>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
        }}
        project={editingProject}
        users={users}
        onSuccess={() => {
          loadProjects();
          setIsModalOpen(false);
          setEditingProject(null);
        }}
      />
    </div>
  );
}

function ProjectModal({ isOpen, onClose, project, users, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning',
    start_date: '',
    end_date: '',
    incharges: [],
    members: [],
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'planning',
        start_date: project.start_date || '',
        end_date: project.end_date || '',
        incharges: project.users?.filter((u) => u.pivot?.role === 'incharge').map((u) => u.id) || [],
        members: project.users?.filter((u) => u.pivot?.role === 'member').map((u) => u.id) || [],
      });
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'planning',
        start_date: '',
        end_date: '',
        incharges: [],
        members: [],
      });
    }
  }, [project]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (project) {
        await projectService.update(project.id, formData);
        await projectService.updateMembers(project.id, {
          incharges: formData.incharges,
          members: formData.members,
        });
        toast.success('Project updated successfully');
      } else {
        await projectService.create(formData);
        toast.success('Project created successfully');
      }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelect = (name, value) => {
    setFormData((prev) => {
      const current = prev[name];
      if (current.includes(value)) {
        return { ...prev, [name]: current.filter((v) => v !== value) };
      }
      return { ...prev, [name]: [...current, value] };
    });
  };

  const inchargeUsers = users.filter((u) => u.role === 'incharge' || u.role === 'admin');
  const memberUsers = users.filter((u) => u.role === 'user' || u.role === 'incharge');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={project ? 'Edit Project' : 'Create Project'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Project Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter project name"
          required
        />

        <TextArea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the project"
          rows={3}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={[
              { value: 'planning', label: 'Planning' },
              { value: 'active', label: 'Active' },
              { value: 'on_hold', label: 'On Hold' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />

          <Input
            label="Start Date"
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
          />
        </div>

        <Input
          label="End Date"
          type="date"
          name="end_date"
          value={formData.end_date}
          onChange={handleChange}
        />

        {/* Incharges Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
            Project Incharges
          </label>
          <div className="flex flex-wrap gap-2 p-3 border border-surface-200 dark:border-surface-700 rounded-xl bg-surface-50 dark:bg-surface-800/50 max-h-32 overflow-y-auto">
            {inchargeUsers.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleMultiSelect('incharges', user.id)}
                className={clsx(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
                  formData.incharges.includes(user.id)
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

        {/* Members Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
            Project Members
          </label>
          <div className="flex flex-wrap gap-2 p-3 border border-surface-200 dark:border-surface-700 rounded-xl bg-surface-50 dark:bg-surface-800/50 max-h-32 overflow-y-auto">
            {memberUsers.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleMultiSelect('members', user.id)}
                className={clsx(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
                  formData.members.includes(user.id)
                    ? 'bg-accent-500 text-white'
                    : 'bg-white dark:bg-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-600'
                )}
              >
                <Avatar name={`${user.first_name} ${user.last_name}`} size="xs" />
                {user.first_name} {user.last_name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {project ? 'Update Project' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

