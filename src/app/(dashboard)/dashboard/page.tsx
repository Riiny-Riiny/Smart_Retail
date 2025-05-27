import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { ChartBarIcon, ShoppingCartIcon, UsersIcon } from '@heroicons/react/24/outline';

export default function DashboardPage() {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="Total Sales"
          value="$24,567"
          trend={{ value: 12.5, isPositive: true }}
          icon={<ShoppingCartIcon className="w-6 h-6" />}
        />
        
        <DashboardCard
          title="Active Users"
          value="1,234"
          trend={{ value: 8.1, isPositive: true }}
          icon={<UsersIcon className="w-6 h-6" />}
        />
        
        <DashboardCard
          title="Conversion Rate"
          value="3.2%"
          trend={{ value: 1.2, isPositive: false }}
          icon={<ChartBarIcon className="w-6 h-6" />}
        />
      </div>
    </div>
  );
} 