'use client';

import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export function Header() {
  return (
    <header className="h-16 fixed top-0 right-0 left-64 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10">
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Dashboard</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300">
            <BellIcon className="h-6 w-6" />
          </button>
          <button className="flex items-center space-x-2 text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300">
            <UserCircleIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
} 