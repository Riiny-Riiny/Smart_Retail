'use client';

import { BellIcon } from '@heroicons/react/24/outline';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { OrganizationSwitcher } from '@/components/layout/OrganizationSwitcher';
import { UserMenu } from '@/components/layout/UserMenu';
import { useOrganization } from '@/hooks/useOrganization';

export function Header() {
  const { isAuthenticated } = useOrganization();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="h-16 fixed top-0 right-0 lg:left-64 left-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10">
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <OrganizationSwitcher />
        </div>
        
        <div className="flex items-center space-x-4">
          <ThemeSwitcher />
          <button className="p-2 text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300">
            <BellIcon className="h-6 w-6" />
          </button>
          <UserMenu />
        </div>
      </div>
    </header>
  );
} 