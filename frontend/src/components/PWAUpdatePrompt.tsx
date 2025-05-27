'use client';

import { useState, useEffect } from 'react';
import { ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { usePWA } from '@/hooks/usePWA';

export default function PWAUpdatePrompt() {
  const { serviceWorkerRegistration, skipWaiting } = usePWA();
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (serviceWorkerRegistration) {
      const handleUpdateFound = () => {
        const newWorker = serviceWorkerRegistration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setShowUpdatePrompt(true);
            }
          });
        }
      };

      serviceWorkerRegistration.addEventListener('updatefound', handleUpdateFound);

      return () => {
        serviceWorkerRegistration.removeEventListener('updatefound', handleUpdateFound);
      };
    }
  }, [serviceWorkerRegistration]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      skipWaiting();
      // Wait a moment for the service worker to take control
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error updating app:', error);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
  };

  if (!showUpdatePrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <ArrowPathIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              App Update Available
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              A new version of Smart Retail is available with improvements and bug fixes.
            </p>
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mt-4 flex gap-3">
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {isUpdating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <ArrowPathIcon className="w-4 h-4" />
                Update Now
              </>
            )}
          </button>
          
          <button
            onClick={handleDismiss}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
} 