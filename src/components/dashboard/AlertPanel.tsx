import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BellIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import type { PriceAlert } from '@/services/priceAnalyzer';

interface AlertPanelProps {
  maxAlerts?: number;
}

export function AlertPanel({ maxAlerts = 5 }: AlertPanelProps) {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);

  const { data: initialAlerts } = useQuery({
    queryKey: ['price-alerts'],
    queryFn: async () => {
      const response = await fetch('/api/alerts');
      if (!response.ok) throw new Error('Failed to fetch alerts');
      return response.json();
    },
  });

  useEffect(() => {
    if (initialAlerts) {
      setAlerts(initialAlerts);
    }
  }, [initialAlerts]);

  useEffect(() => {
    // Set up WebSocket connection for real-time alerts
    const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/alerts`);

    ws.onmessage = (event) => {
      const newAlert: PriceAlert = JSON.parse(event.data);
      setAlerts((prevAlerts) => {
        const updatedAlerts = [newAlert, ...prevAlerts].slice(0, maxAlerts);
        return updatedAlerts;
      });
    };

    return () => {
      ws.close();
    };
  }, [maxAlerts]);

  const getAlertIcon = (significance: string) => {
    switch (significance) {
      case 'HIGH':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'MEDIUM':
        return <BellIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getAlertBgColor = (significance: string) => {
    switch (significance) {
      case 'HIGH':
        return 'bg-red-50 dark:bg-red-900/20';
      case 'MEDIUM':
        return 'bg-yellow-50 dark:bg-yellow-900/20';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Price Alerts
        </h3>
      </div>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {alerts.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            No active alerts
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 ${getAlertBgColor(alert.significance)} transition-colors`}
            >
              <div className="flex items-start space-x-3">
                {getAlertIcon(alert.significance)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {alert.reason}
                  </p>
                  <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      {new Date(alert.timestamp).toLocaleString()}
                    </span>
                    <span>•</span>
                    <span className="font-medium">
                      {alert.percentageChange > 0 ? '+' : ''}
                      {alert.percentageChange.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 