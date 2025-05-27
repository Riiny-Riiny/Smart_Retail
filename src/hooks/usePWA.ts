'use client';

import { useState, useEffect, useCallback } from 'react';
import { useHydration } from './useHydration';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAState {
  isInstalled: boolean;
  isInstallable: boolean;
  isOnline: boolean;
  isStandalone: boolean;
  deferredPrompt: BeforeInstallPromptEvent | null;
  serviceWorkerRegistration: ServiceWorkerRegistration | null;
}

export function usePWA() {
  const mounted = useHydration();
  const [state, setState] = useState<PWAState>({
    isInstalled: false,
    isInstallable: false,
    isOnline: true,
    isStandalone: false,
    deferredPrompt: null,
    serviceWorkerRegistration: null,
  });

  // Check if app is installed/standalone
  const checkInstallationStatus = useCallback(() => {
    if (!mounted || typeof window === 'undefined') return;
    
    try {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      const isInstalled = isStandaloneMode || isIOSStandalone;
      
      setState(prev => ({
        ...prev,
        isInstalled,
        isStandalone: isInstalled,
      }));
    } catch (error) {
      console.error('Error checking installation status:', error);
    }
  }, [mounted]);

  // Check online status
  const updateOnlineStatus = useCallback(() => {
    if (!mounted || typeof window === 'undefined') return;
    
    try {
      setState(prev => ({
        ...prev,
        isOnline: navigator.onLine,
      }));
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  }, [mounted]);

  // Install PWA
  const installPWA = useCallback(async () => {
    if (!state.deferredPrompt) {
      throw new Error('PWA installation not available');
    }

    try {
      await state.deferredPrompt.prompt();
      const { outcome } = await state.deferredPrompt.userChoice;
      
      setState(prev => ({
        ...prev,
        deferredPrompt: null,
        isInstallable: false,
      }));

      return outcome === 'accepted';
    } catch (error) {
      console.error('PWA installation failed:', error);
      throw error;
    }
  }, [state.deferredPrompt]);

  // Register service worker
  const registerServiceWorker = useCallback(async () => {
    if (!mounted || typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return null;
    }
    
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      setState(prev => ({
        ...prev,
        serviceWorkerRegistration: registration,
      }));

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available
              console.log('New content is available; please refresh.');
            }
          });
        }
      });

      return registration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      return null;
    }
  }, [mounted]);

  // Update service worker
  const updateServiceWorker = useCallback(async () => {
    if (state.serviceWorkerRegistration) {
      try {
        await state.serviceWorkerRegistration.update();
        return true;
      } catch (error) {
        console.error('Service worker update failed:', error);
        return false;
      }
    }
    return false;
  }, [state.serviceWorkerRegistration]);

  // Skip waiting for new service worker
  const skipWaiting = useCallback(() => {
    if (state.serviceWorkerRegistration?.waiting) {
      state.serviceWorkerRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }, [state.serviceWorkerRegistration]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (!mounted || typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }, [mounted]);

  // Subscribe to push notifications
  const subscribeToPush = useCallback(async () => {
    if (!state.serviceWorkerRegistration) {
      throw new Error('Service worker not registered');
    }

    try {
      const subscription = await state.serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      throw error;
    }
  }, [state.serviceWorkerRegistration]);

  // Get cache usage
  const getCacheUsage = useCallback(async () => {
    if (!mounted || typeof window === 'undefined' || !('storage' in navigator) || !('estimate' in navigator.storage)) {
      return null;
    }
      try {
        const estimate = await navigator.storage.estimate();
        return {
          usage: estimate.usage || 0,
          quota: estimate.quota || 0,
          usageDetails: (estimate as any).usageDetails || {},
        };
      } catch (error) {
        console.error('Failed to get cache usage:', error);
        return null;
      }
  }, [mounted]);

  // Clear cache
  const clearCache = useCallback(async () => {
    if (!mounted || typeof window === 'undefined' || !('caches' in window)) {
      return false;
    }
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        return true;
      } catch (error) {
        console.error('Failed to clear cache:', error);
        return false;
      }
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;

    // Initial checks
    checkInstallationStatus();
    updateOnlineStatus();

    // Register service worker
    registerServiceWorker();

    // Event listeners
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setState(prev => ({
        ...prev,
        deferredPrompt: e as BeforeInstallPromptEvent,
        isInstallable: true,
      }));
    };

    const handleAppInstalled = () => {
      setState(prev => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        deferredPrompt: null,
      }));
    };

    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && !document.hidden) {
        updateOnlineStatus();
      }
    };

    // Add event listeners only if window is available
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);
      window.addEventListener('online', updateOnlineStatus);
      window.addEventListener('offline', updateOnlineStatus);
    }
    
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    // Cleanup
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
        window.removeEventListener('online', updateOnlineStatus);
        window.removeEventListener('offline', updateOnlineStatus);
      }
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [mounted, checkInstallationStatus, updateOnlineStatus, registerServiceWorker]);

  return {
    ...state,
    installPWA,
    updateServiceWorker,
    skipWaiting,
    requestNotificationPermission,
    subscribeToPush,
    getCacheUsage,
    clearCache,
  };
} 