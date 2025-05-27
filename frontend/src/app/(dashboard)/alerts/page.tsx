'use client';

import { useState, useEffect } from 'react';
import { 
  BellIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  TrashIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

interface Alert {
  id: string;
  type: 'price_change' | 'stock_low' | 'competitor_update' | 'system' | 'warning';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  productId?: string;
  productName?: string;
  oldValue?: number;
  newValue?: number;
  competitor?: string;
}

const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'price_change',
    title: 'Competitor Price Drop',
    message: 'Amazon reduced price for Wireless Bluetooth Headphones by 15%',
    timestamp: '2024-01-15T10:30:00Z',
    isRead: false,
    priority: 'high',
    productName: 'Wireless Bluetooth Headphones',
    oldValue: 99.99,
    newValue: 84.99,
    competitor: 'Amazon'
  },
  {
    id: '2',
    type: 'stock_low',
    title: 'Low Stock Alert',
    message: 'Smart Fitness Watch stock is running low (8 units remaining)',
    timestamp: '2024-01-15T09:15:00Z',
    isRead: false,
    priority: 'critical',
    productName: 'Smart Fitness Watch'
  },
  {
    id: '3',
    type: 'competitor_update',
    title: 'New Competitor Product',
    message: 'Best Buy added a similar product to their catalog',
    timestamp: '2024-01-15T08:45:00Z',
    isRead: true,
    priority: 'medium',
    competitor: 'Best Buy'
  },
  {
    id: '4',
    type: 'system',
    title: 'Data Sync Complete',
    message: 'Successfully synchronized pricing data from all competitors',
    timestamp: '2024-01-15T08:00:00Z',
    isRead: true,
    priority: 'low'
  },
  {
    id: '5',
    type: 'warning',
    title: 'Price Monitoring Issue',
    message: 'Unable to fetch pricing data from Walmart for the last 2 hours',
    timestamp: '2024-01-15T07:30:00Z',
    isRead: false,
    priority: 'medium',
    competitor: 'Walmart'
  }
];

const alertTypes = ['All', 'Price Changes', 'Stock Alerts', 'Competitor Updates', 'System', 'Warnings'];
const priorityLevels = ['All', 'Critical', 'High', 'Medium', 'Low'];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'All' || 
                       (selectedType === 'Price Changes' && alert.type === 'price_change') ||
                       (selectedType === 'Stock Alerts' && alert.type === 'stock_low') ||
                       (selectedType === 'Competitor Updates' && alert.type === 'competitor_update') ||
                       (selectedType === 'System' && alert.type === 'system') ||
                       (selectedType === 'Warnings' && alert.type === 'warning');
    
    const matchesPriority = selectedPriority === 'All' || 
                           alert.priority.toLowerCase() === selectedPriority.toLowerCase();
    
    const matchesReadStatus = !showUnreadOnly || !alert.isRead;
    
    return matchesSearch && matchesType && matchesPriority && matchesReadStatus;
  });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'price_change':
        return <ArrowTrendingDownIcon className="w-5 h-5" />;
      case 'stock_low':
        return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'competitor_update':
        return <InformationCircleIcon className="w-5 h-5" />;
      case 'system':
        return <CheckCircleIcon className="w-5 h-5" />;
      case 'warning':
        return <XCircleIcon className="w-5 h-5" />;
      default:
        return <BellIcon className="w-5 h-5" />;
    }
  };

  const getAlertColor = (priority: string, type: string) => {
    if (priority === 'critical') return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
    if (priority === 'high') return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-200';
    if (priority === 'medium') return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
    if (type === 'system') return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
    return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200';
  };

  const getPriorityBadge = (priority: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (priority) {
      case 'critical':
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
      case 'high':
        return `${baseClasses} bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200`;
      case 'medium':
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
      case 'low':
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200`;
      default:
        return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  const markAsRead = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
  };

  const deleteAlert = (alertId: string) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };

  const markAllAsRead = () => {
    setAlerts(alerts.map(alert => ({ ...alert, isRead: true })));
  };

  const unreadCount = alerts.filter(alert => !alert.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BellIcon className="w-7 h-7" />
            Alerts & Notifications
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Stay updated with real-time alerts and system notifications
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Mark All Read
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Alerts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{alerts.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <BellIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unread</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{unreadCount}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Critical</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {alerts.filter(a => a.priority === 'critical').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
              <XCircleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {alerts.filter(a => new Date(a.timestamp).toDateString() === new Date().toDateString()).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {alertTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {priorityLevels.map(priority => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>

            <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <input
                type="checkbox"
                checked={showUnreadOnly}
                onChange={(e) => setShowUnreadOnly(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Unread only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                !alert.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Alert Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${getAlertColor(alert.priority, alert.type)}`}>
                  {getAlertIcon(alert.type)}
                </div>

                {/* Alert Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`text-sm font-medium ${!alert.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                          {alert.title}
                        </h3>
                        <span className={getPriorityBadge(alert.priority)}>
                          {alert.priority}
                        </span>
                        {!alert.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {alert.message}
                      </p>

                      {/* Additional Info */}
                      {(alert.oldValue && alert.newValue) && (
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>Old: ${alert.oldValue}</span>
                          <ArrowTrendingDownIcon className="w-3 h-3" />
                          <span>New: ${alert.newValue}</span>
                          <span className="text-red-600 dark:text-red-400">
                            ({((alert.newValue - alert.oldValue) / alert.oldValue * 100).toFixed(1)}%)
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <ClockIcon className="w-3 h-3" />
                          {formatTimestamp(alert.timestamp)}
                        </span>
                        {alert.competitor && (
                          <span>Competitor: {alert.competitor}</span>
                        )}
                        {alert.productName && (
                          <span>Product: {alert.productName}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {!alert.isRead && (
                        <button
                          onClick={() => markAsRead(alert.id)}
                          className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          title="Mark as read"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteAlert(alert.id)}
                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Delete alert"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAlerts.length === 0 && (
          <div className="text-center py-12">
            <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No alerts found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 