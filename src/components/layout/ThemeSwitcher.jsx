import { Fragment } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';
import { clsx } from 'clsx';

const themes = [
  { name: 'Light', value: 'light', icon: SunIcon },
  { name: 'Dark', value: 'dark', icon: MoonIcon },
  { name: 'System', value: 'system', icon: ComputerDesktopIcon },
];

export function ThemeSwitcher() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const CurrentIcon = resolvedTheme === 'dark' ? MoonIcon : SunIcon;

  return (
    <Menu as="div" className="relative">
      <MenuButton className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
        <CurrentIcon className="w-5 h-5 text-surface-600 dark:text-surface-400" />
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
        <MenuItems className="absolute right-0 mt-2 w-40 origin-top-right rounded-xl bg-white dark:bg-surface-800 shadow-lg ring-1 ring-black/5 dark:ring-white/5 focus:outline-none p-1">
          {themes.map((item) => (
            <MenuItem key={item.value}>
              {({ active }) => (
                <button
                  onClick={() => setTheme(item.value)}
                  className={clsx(
                    'flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition-colors',
                    active && 'bg-surface-100 dark:bg-surface-700',
                    theme === item.value
                      ? 'text-primary-600 dark:text-primary-400 font-medium'
                      : 'text-surface-700 dark:text-surface-300'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                  {theme === item.value && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-primary-500" />
                  )}
                </button>
              )}
            </MenuItem>
          ))}
        </MenuItems>
      </Transition>
    </Menu>
  );
}

