'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { ChartBarIcon, ShoppingCartIcon, UsersIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return null;
} 