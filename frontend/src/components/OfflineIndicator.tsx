'use client';

import { useState, useEffect } from 'react';
import { WifiIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { usePWA } from '@/hooks/usePWA';

export default function OfflineIndicator() {
  const { isOnline } = usePWA();
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline && !wasOffline) {
      setShowOfflineMessage(true);
      setWasOffline(true);
      
      // Hide message after 5 seconds
      const timer = setTimeout(() => {
        setShowOfflineMessage(false);
      }, 5000);

      return () => clearTimeout(timer);
    } else if (isOnline && wasOffline) {
      setShowOfflineMessage(true);
      setWasOffline(false);
      
      // Hide message after 3 seconds
      const timer = setTimeout(() => {
        setShowOfflineMessage(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (!showOfflineMessage) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className={`rounded-lg shadow-lg p-4 transition-all duration-300 transform ${
        isOnline 
          ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800' 
          : 'bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 w-6 h-6 ${
            isOnline ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
          }`}>
            {isOnline ? (
              <WifiIcon className="w-6 h-6" />
            ) : (
              <ExclamationTriangleIcon className="w-6 h-6" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-medium ${
              isOnline 
                ? 'text-green-800 dark:text-green-200' 
                : 'text-yellow-800 dark:text-yellow-200'
            }`}>
              {isOnline ? 'Back Online' : 'You\'re Offline'}
            </h4>
            
            <p className={`text-sm mt-1 ${
              isOnline 
                ? 'text-green-700 dark:text-green-300' 
                : 'text-yellow-700 dark:text-yellow-300'
            }`}>
              {isOnline 
                ? 'All features are now available.'
                : 'Some features may be limited. Cached data is still available.'
              }
            </p>
          </div>
          
          <button
            onClick={() => setShowOfflineMessage(false)}
            className={`flex-shrink-0 p-1 rounded-md transition-colors ${
              isOnline
                ? 'text-green-400 hover:text-green-600 dark:text-green-500 dark:hover:text-green-300'
                : 'text-yellow-400 hover:text-yellow-600 dark:text-yellow-500 dark:hover:text-yellow-300'
            }`}
          >
            <span className="sr-only">Dismiss</span>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
} 