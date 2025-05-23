'use client';

import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  trend,
  icon,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all hover:shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
          {title}
        </h3>
        {icon && (
          <div className="text-primary p-2 bg-primary/10 rounded-lg">
            {icon}
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <div className="flex items-baseline">
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {value}
          </p>
          {trend && (
            <span
              className={`ml-2 text-sm font-medium ${
                trend.isPositive
                  ? 'text-green-600 dark:text-green-500'
                  : 'text-red-600 dark:text-red-500'
              }`}
            >
              {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}; 