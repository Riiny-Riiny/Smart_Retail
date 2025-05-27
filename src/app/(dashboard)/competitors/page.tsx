import { CompetitorTable } from '@/components/dashboard/CompetitorTable';
import { PriceTrendChart } from '@/components/dashboard/PriceTrendChart';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { 
  ChartBarIcon, 
  ShoppingBagIcon, 
  CurrencyDollarIcon,
  ArrowTrendingUpIcon 
} from '@heroicons/react/24/outline';

export default function CompetitorsPage() {
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Competitors"
          value="12"
          trend={{ value: 2, isPositive: true }}
          icon={<ChartBarIcon className="w-6 h-6" />}
        />
        <DashboardCard
          title="Avg. Market Price"
          value="$299.99"
          trend={{ value: 1.5, isPositive: false }}
          icon={<CurrencyDollarIcon className="w-6 h-6" />}
        />
        <DashboardCard
          title="Product Matches"
          value="856"
          trend={{ value: 5.2, isPositive: true }}
          icon={<ShoppingBagIcon className="w-6 h-6" />}
        />
        <DashboardCard
          title="Price Position"
          value="3rd"
          trend={{ value: 1, isPositive: true }}
          icon={<ArrowTrendingUpIcon className="w-6 h-6" />}
        />
      </div>

      {/* Price Trends Chart */}
      <PriceTrendChart />

      {/* Competitor Table */}
      <CompetitorTable />
    </div>
  );
} 