import { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  // BellIcon, // Commented out - notifications disabled
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeSwitcher } from './ThemeSwitcher';
import { Avatar } from '../ui/Avatar';
import { Modal, Button } from '../ui';
import { clsx } from 'clsx';

export function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    logout();
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-b border-surface-200 dark:border-surface-800">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          >
            <Bars3Icon className="w-5 h-5 text-surface-600 dark:text-surface-400" />
          </button>
          
          <div className="hidden lg:block">
            <h1 className="text-lg font-semibold text-surface-900 dark:text-white">
              Welcome back, <span className="text-primary-500">{user?.first_name}</span>
            </h1>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeSwitcher />

          {/* Notifications - Commented out for now
          <button className="relative p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
            <BellIcon className="w-5 h-5 text-surface-600 dark:text-surface-400" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          */}

          {/* User menu */}
          <Menu as="div" className="relative">
            <MenuButton className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
              <Avatar
                name={`${user?.first_name} ${user?.last_name}`}
                src={user?.profile_picture}
                size="sm"
              />
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
              <MenuItems className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white dark:bg-surface-800 shadow-lg ring-1 ring-black/5 dark:ring-white/5 focus:outline-none p-1">
                <div className="px-3 py-2 border-b border-surface-100 dark:border-surface-700">
                  <p className="text-sm font-medium text-surface-900 dark:text-white">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-surface-500 dark:text-surface-400 truncate">
                    {user?.email}
                  </p>
                </div>

                <div className="py-1">
                  <MenuItem>
                    {({ active }) => (
                      <Link
                        to="/settings"
                        className={clsx(
                          'flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition-colors',
                          active && 'bg-surface-100 dark:bg-surface-700',
                          'text-surface-700 dark:text-surface-300'
                        )}
                      >
                        <UserCircleIcon className="w-4 h-4" />
                        Profile
                      </Link>
                    )}
                  </MenuItem>

                  <MenuItem>
                    {({ active }) => (
                      <Link
                        to="/settings"
                        className={clsx(
                          'flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition-colors',
                          active && 'bg-surface-100 dark:bg-surface-700',
                          'text-surface-700 dark:text-surface-300'
                        )}
                      >
                        <Cog6ToothIcon className="w-4 h-4" />
                        Settings
                      </Link>
                    )}
                  </MenuItem>
                </div>

                <div className="border-t border-surface-100 dark:border-surface-700 pt-1">
                  <MenuItem>
                    {({ active }) => (
                      <button
                        onClick={handleLogoutClick}
                        className={clsx(
                          'flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition-colors',
                          active && 'bg-red-50 dark:bg-red-900/20',
                          'text-red-600 dark:text-red-400'
                        )}
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4" />
                        Sign out
                      </button>
                    )}
                  </MenuItem>
                </div>
              </MenuItems>
            </Transition>
          </Menu>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Sign out"
        size="sm"
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-surface-600 dark:text-surface-400 mb-6">
            Are you sure you want to sign out of your account?
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="secondary"
              onClick={() => setShowLogoutModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleLogoutConfirm}
            >
              Sign out
            </Button>
          </div>
        </div>
      </Modal>
    </header>
  );
}

