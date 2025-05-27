'use client';

import { useState, useEffect } from 'react';
import { 
  WifiIcon, 
  CloudIcon, 
  DevicePhoneMobileIcon,
  Cog6ToothIcon,
  TrashIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { usePWA } from '@/hooks/usePWA';

export default function PWAStatusBar() {
  const { 
    isInstalled, 
    isOnline, 
    isStandalone, 
    getCacheUsage, 
    clearCache, 
    updateServiceWorker 
  } = usePWA();
  
  const [showDetails, setShowDetails] = useState(false);
  const [cacheUsage, setCacheUsage] = useState<any>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const loadCacheUsage = async () => {
      try {
        const usage = await getCacheUsage();
        setCacheUsage(usage);
      } catch (error) {
        console.error('Failed to get cache usage:', error);
      }
    };

    if (showDetails) {
      loadCacheUsage();
    }
  }, [showDetails, getCacheUsage]);

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      await clearCache();
      const usage = await getCacheUsage();
      setCacheUsage(usage);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await updateServiceWorker();
    } catch (error) {
      console.error('Failed to update service worker:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Only show in standalone mode (when installed as PWA)
  if (!isStandalone) {
    return null;
  }

  return (
    <>
      {/* Status Bar */}
      <div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10">
            <div className="flex items-center gap-4">
              {/* Installation Status */}
              <div className="flex items-center gap-2">
                <DevicePhoneMobileIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  PWA Installed
                </span>
              </div>

              {/* Connection Status */}
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <WifiIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : (
                  <CloudIcon className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                )}
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>

            {/* Settings Button */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Cog6ToothIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Details Panel */}
      {showDetails && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Cache Usage */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Cache Usage
                </h4>
                {cacheUsage ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-300">Used:</span>
                      <span className="text-gray-900 dark:text-white">
                        {formatBytes(cacheUsage.usage)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-300">Available:</span>
                      <span className="text-gray-900 dark:text-white">
                        {formatBytes(cacheUsage.quota)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(cacheUsage.usage / cacheUsage.quota) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Loading...
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Actions
                </h4>
                <div className="space-y-2">
                  <button
                    onClick={handleUpdate}
                    disabled={isUpdating}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors"
                  >
                    {isUpdating ? (
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ArrowPathIcon className="w-3 h-3" />
                    )}
                    Check for Updates
                  </button>
                  
                  <button
                    onClick={handleClearCache}
                    disabled={isClearing}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-md transition-colors"
                  >
                    {isClearing ? (
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <TrashIcon className="w-3 h-3" />
                    )}
                    Clear Cache
                  </button>
                </div>
              </div>

              {/* App Info */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  App Info
                </h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Version:</span>
                    <span className="text-gray-900 dark:text-white">1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Mode:</span>
                    <span className="text-gray-900 dark:text-white">
                      {isStandalone ? 'Standalone' : 'Browser'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Status:</span>
                    <span className="text-green-600 dark:text-green-400">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 