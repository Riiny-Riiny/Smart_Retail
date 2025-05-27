'use client';

import { useHydration } from '@/hooks/useHydration';

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const mounted = useHydration();

  if (!mounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
} 