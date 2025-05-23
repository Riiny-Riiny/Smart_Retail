import { CustomerStats } from '@/components/dashboard/CustomerStats';
import { CustomerTable } from '@/components/dashboard/CustomerTable';

export default function CustomersPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Customer Management
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Track and analyze customer behavior, segments, and performance metrics.
        </p>
      </div>

      <CustomerStats />
      
      <CustomerTable />
    </div>
  );
} 