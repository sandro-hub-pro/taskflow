import { useState } from 'react';
import {
  UserCircleIcon,
  KeyIcon,
  BellIcon,
  SwatchIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { userService, authService } from '../services/api';
import {
  Button,
  Input,
  Card,
  CardContent,
  CardHeader,
  Avatar,
} from '../components/ui';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

const tabs = [
  { id: 'profile', name: 'Profile', icon: UserCircleIcon },
  { id: 'password', name: 'Password', icon: KeyIcon },
  { id: 'appearance', name: 'Appearance', icon: SwatchIcon },
];

export function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white">
          Settings
        </h1>
        <p className="text-surface-500 dark:text-surface-400">
          Manage your account and preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs */}
        <Card className="lg:w-64 shrink-0 h-fit">
          <CardContent className="p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left transition-colors',
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white'
                    : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
                )}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'password' && <PasswordSettings />}
          {activeTab === 'appearance' && <AppearanceSettings />}
        </div>
      </div>
    </div>
  );
}

function ProfileSettings() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    first_name: user?.first_name || '',
    middle_name: user?.middle_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await userService.updateProfile(formData);
      updateUser(response.data.user);
      toast.success('Profile updated successfully');
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handlePictureChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const response = await userService.updateProfilePicture(file);
      updateUser({ ...user, profile_picture: response.data.profile_picture });
      toast.success('Profile picture updated');
    } catch (error) {
      toast.error('Failed to update profile picture');
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
          Profile Information
        </h2>
        <p className="text-sm text-surface-500 dark:text-surface-400">
          Update your personal details
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture */}
          <div className="flex items-center gap-6">
            <Avatar
              name={`${user?.first_name} ${user?.last_name}`}
              src={user?.profile_picture}
              size="2xl"
            />
            <div>
              <label className="cursor-pointer">
                <span className="inline-flex items-center px-4 py-2 bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 rounded-xl text-sm font-medium hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors">
                  Change Picture
                </span>
                <input
                  type="file"
                  onChange={handlePictureChange}
                  accept="image/*"
                  className="hidden"
                />
              </label>
              <p className="text-sm text-surface-500 dark:text-surface-400 mt-2">
                JPG, PNG or GIF. Max size 10MB.
              </p>
            </div>
          </div>

          <Input
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            error={errors.username?.[0]}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="First Name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              error={errors.first_name?.[0]}
              required
            />

            <Input
              label="Middle Name"
              name="middle_name"
              value={formData.middle_name}
              onChange={handleChange}
            />

            <Input
              label="Last Name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
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
            error={errors.email?.[0]}
            required
          />

          <div className="flex justify-end">
            <Button type="submit" loading={loading}>
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function PasswordSettings() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await userService.changePassword(formData);
      toast.success('Password changed successfully');
      setFormData({
        current_password: '',
        password: '',
        password_confirmation: '',
      });
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
          Change Password
        </h2>
        <p className="text-sm text-surface-500 dark:text-surface-400">
          Update your password to keep your account secure
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
          <Input
            label="Current Password"
            type="password"
            name="current_password"
            value={formData.current_password}
            onChange={handleChange}
            error={errors.current_password?.[0]}
            required
          />

          <Input
            label="New Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password?.[0]}
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleChange}
            required
          />

          <div className="flex justify-end">
            <Button type="submit" loading={loading}>
              Change Password
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function AppearanceSettings() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: 'light', label: 'Light', description: 'A clean, bright appearance' },
    { value: 'dark', label: 'Dark', description: 'Easy on the eyes, great for low light' },
    { value: 'system', label: 'System', description: 'Automatically match your device settings' },
  ];

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
          Appearance
        </h2>
        <p className="text-sm text-surface-500 dark:text-surface-400">
          Customize how TaskFlow looks on your device
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm font-medium text-surface-700 dark:text-surface-300">
            Theme
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {themes.map((option) => (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={clsx(
                  'p-4 rounded-xl border-2 text-left transition-all',
                  theme === option.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={clsx(
                      'w-8 h-8 rounded-lg flex items-center justify-center',
                      option.value === 'light' && 'bg-white border border-surface-200',
                      option.value === 'dark' && 'bg-surface-800',
                      option.value === 'system' && 'bg-gradient-to-br from-white to-surface-800'
                    )}
                  >
                    {option.value === 'light' && (
                      <div className="w-4 h-4 rounded-full bg-amber-400" />
                    )}
                    {option.value === 'dark' && (
                      <div className="w-4 h-4 rounded-full bg-surface-400" />
                    )}
                    {option.value === 'system' && (
                      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-surface-400" />
                    )}
                  </div>
                  {theme === option.value && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-primary-500" />
                  )}
                </div>
                <p className="font-medium text-surface-900 dark:text-white">
                  {option.label}
                </p>
                <p className="text-sm text-surface-500 dark:text-surface-400">
                  {option.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

