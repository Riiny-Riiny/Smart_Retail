'use client';

import { useEffect, useState } from 'react';
import { WifiIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        setLastUpdated(new Date());
      }
    };

    // Set initial status
    updateOnlineStatus();

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.href = '/dashboard';
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        {/* Status Icon */}
        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 ${
          isOnline 
            ? 'bg-green-100 dark:bg-green-900' 
            : 'bg-red-100 dark:bg-red-900'
        }`}>
          <WifiIcon className={`w-8 h-8 ${
            isOnline 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`} />
        </div>

        {/* Status Message */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {isOnline ? 'Back Online!' : 'You\'re Offline'}
        </h1>

        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {isOnline 
            ? 'Your connection has been restored. You can now access all features.'
            : 'Please check your internet connection. Some features may be limited while offline.'
          }
        </p>

        {/* Last Updated */}
        {lastUpdated && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}

        {/* Offline Features */}
        {!isOnline && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Available Offline:
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• View cached dashboard data</li>
              <li>• Browse customer information</li>
              <li>• Review competitor analysis</li>
              <li>• Access previously loaded content</li>
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <ArrowPathIcon className="w-5 h-5" />
            {isOnline ? 'Go to Dashboard' : 'Try Again'}
          </button>

          <button
            onClick={handleGoHome}
            className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            Go to Home
          </button>
        </div>

        {/* Connection Status Indicator */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              isOnline ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {isOnline ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 