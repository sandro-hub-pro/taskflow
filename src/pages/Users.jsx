import { useEffect, useState, Fragment } from 'react';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { userService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  Button,
  Input,
  Select,
  Card,
  CardContent,
  CardHeader,
  Badge,
  Modal,
  Spinner,
  EmptyState,
  Avatar,
} from '../components/ui';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

export function Users() {
  const { user: currentUser, isSuperAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Check if the current user can delete a specific user
  const canDeleteUser = (user) => {
    // Cannot delete yourself
    if (user.id === currentUser?.id) return false;
    // Cannot delete superadmin
    if (user.role === 'superadmin') return false;
    // Only superadmin can delete admin users
    if ((user.role === 'admin' || user.role === 'superadmin') && !isSuperAdmin) return false;
    return true;
  };

  useEffect(() => {
    loadUsers();
  }, [search, roleFilter]);

  const loadUsers = async () => {
    try {
      const response = await userService.getAll({
        search,
        role: roleFilter || undefined,
        per_page: 50,
      });
      setUsers(response.data.data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await userService.delete(id);
      toast.success('User deleted successfully');
      loadUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const roleColors = {
    superadmin: 'danger',
    admin: 'primary',
    incharge: 'warning',
    user: 'default',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white">
            Users
          </h1>
          <p className="text-surface-500 dark:text-surface-400">
            Manage system users and their roles
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} leftIcon={<PlusIcon className="w-5 h-5" />}>
          Add User
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<MagnifyingGlassIcon className="w-5 h-5" />}
          containerClassName="flex-1 max-w-md"
        />
        <Select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          options={[
            { value: '', label: 'All Roles' },
            { value: 'superadmin', label: 'Superadmin' },
            { value: 'admin', label: 'Admin' },
            { value: 'incharge', label: 'Incharge' },
            { value: 'user', label: 'User' },
          ]}
          containerClassName="w-40"
        />
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="No users found"
          description={search || roleFilter ? 'Try adjusting your search or filters' : 'Add your first user to get started'}
          action={
            <Button onClick={() => setIsModalOpen(true)} leftIcon={<PlusIcon className="w-5 h-5" />}>
              Add User
            </Button>
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-100 dark:border-surface-700">
                    <th className="px-6 py-4 text-left text-sm font-medium text-surface-500 dark:text-surface-400">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-surface-500 dark:text-surface-400">
                      Username
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-surface-500 dark:text-surface-400">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-surface-500 dark:text-surface-400">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-surface-500 dark:text-surface-400">
                      Joined
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-surface-500 dark:text-surface-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100 dark:divide-surface-700">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={`${user.first_name} ${user.last_name}`}
                            src={user.profile_picture}
                            size="md"
                          />
                          <div>
                            <p className="font-medium text-surface-900 dark:text-white">
                              {user.first_name} {user.middle_name ? `${user.middle_name} ` : ''}{user.last_name}
                            </p>
                            <p className="text-sm text-surface-500 dark:text-surface-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">
                        @{user.username}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={roleColors[user.role]} className="capitalize">
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={user.email_verified_at ? 'success' : 'warning'}
                          dot
                        >
                          {user.email_verified_at ? 'Verified' : 'Pending'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">
                        {format(new Date(user.created_at), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Menu as="div" className="relative inline-block">
                          <MenuButton className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700">
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
                                      setEditingUser(user);
                                      setIsModalOpen(true);
                                    }}
                                    className={clsx(
                                      'flex w-full items-center gap-2 px-3 py-2 text-sm rounded-lg',
                                      active && 'bg-surface-100 dark:bg-surface-700'
                                    )}
                                  >
                                    <PencilIcon className="w-4 h-4" />
                                    Edit
                                  </button>
                                )}
                              </MenuItem>
                              {canDeleteUser(user) && (
                              <MenuItem>
                                {({ active }) => (
                                  <button
                                    onClick={() => handleDelete(user.id)}
                                    className={clsx(
                                      'flex w-full items-center gap-2 px-3 py-2 text-sm rounded-lg text-red-600 dark:text-red-400',
                                      active && 'bg-red-50 dark:bg-red-900/20'
                                    )}
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                    Delete
                                  </button>
                                )}
                              </MenuItem>
                              )}
                            </MenuItems>
                          </Transition>
                        </Menu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
        }}
        user={editingUser}
        onSuccess={() => {
          loadUsers();
          setIsModalOpen(false);
          setEditingUser(null);
        }}
      />
    </div>
  );
}

function UserModal({ isOpen, onClose, user, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'user',
    profile_picture: null,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        first_name: user.first_name || '',
        middle_name: user.middle_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        password: '',
        role: user.role || 'user',
        profile_picture: null,
      });
    } else {
      setFormData({
        username: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        email: '',
        password: '',
        role: 'user',
        profile_picture: null,
      });
    }
    setErrors({});
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const data = { ...formData };
      if (!data.password) delete data.password;
      if (!data.profile_picture) delete data.profile_picture;

      if (user) {
        await userService.update(user.id, data);
        toast.success('User updated successfully');
      } else {
        await userService.create(data);
        toast.success('User created successfully');
      }
      onSuccess();
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
      toast.error(error.response?.data?.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user ? 'Edit User' : 'Add User'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Enter username"
          error={errors.username?.[0]}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="First Name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            placeholder="First"
            error={errors.first_name?.[0]}
            required
          />

          <Input
            label="Middle Name"
            name="middle_name"
            value={formData.middle_name}
            onChange={handleChange}
            placeholder="Middle"
          />

          <Input
            label="Last Name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            placeholder="Last"
            error={errors.last_name?.[0]}
            required
          />
        </div>

        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter email"
          error={errors.email?.[0]}
          required
        />

        <Input
          label={user ? 'New Password (leave blank to keep current)' : 'Password'}
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter password"
          error={errors.password?.[0]}
          required={!user}
        />

        <Select
          label="Role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          options={[
            { value: 'superadmin', label: 'Superadmin' },
            { value: 'admin', label: 'Admin' },
            { value: 'incharge', label: 'Incharge' },
            { value: 'user', label: 'User' },
          ]}
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
            Profile Picture
          </label>
          <input
            type="file"
            name="profile_picture"
            onChange={handleChange}
            accept="image/*"
            className="block w-full text-sm text-surface-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100 dark:file:bg-primary-900/30 dark:file:text-primary-400"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {user ? 'Update User' : 'Create User'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

