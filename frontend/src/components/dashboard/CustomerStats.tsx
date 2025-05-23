'use client';

import {
  UsersIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const stats = [
  {
    name: 'Total Customers',
    value: '1,284',
    change: '+12.5%',
    changeType: 'increase',
    icon: UsersIcon,
  },
  {
    name: 'Average Order Value',
    value: '$245.80',
    change: '+8.2%',
    changeType: 'increase',
    icon: CurrencyDollarIcon,
  },
  {
    name: 'Customer Retention',
    value: '84%',
    change: '+2.4%',
    changeType: 'increase',
    icon: ChartBarIcon,
  },
  {
    name: 'Orders per Customer',
    value: '3.2',
    change: '-0.8%',
    changeType: 'decrease',
    icon: ShoppingBagIcon,
  },
];

export function CustomerStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.name}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <Icon className="h-6 w-6 text-primary-600 dark:text-primary-300" />
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  stat.changeType === 'increase'
                    ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                    : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                }`}
              >
                {stat.change}
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {stat.value}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {stat.name}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
} 