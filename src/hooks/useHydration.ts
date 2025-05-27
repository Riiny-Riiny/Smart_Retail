'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to handle hydration issues by ensuring components only render
 * after client-side mounting is complete
 */
export function useHydration() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}

export default useHydration; 