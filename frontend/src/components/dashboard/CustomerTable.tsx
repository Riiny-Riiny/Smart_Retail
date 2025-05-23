'use client';

import { useState } from 'react';
import { 
  ChartBarIcon, 
  ShoppingBagIcon, 
  CurrencyDollarIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

interface Customer {
  id: string;
  name: string;
  email: string;
  totalSpent: number;
  orderCount: number;
  lastPurchase: string;
  segment: 'VIP' | 'Regular' | 'New';
}

const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    totalSpent: 2499.99,
    orderCount: 12,
    lastPurchase: '2024-03-15',
    segment: 'VIP'
  },
  {
    id: '2',
    name: 'Emma Wilson',
    email: 'emma.w@example.com',
    totalSpent: 899.50,
    orderCount: 5,
    lastPurchase: '2024-03-10',
    segment: 'Regular'
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'm.brown@example.com',
    totalSpent: 149.99,
    orderCount: 1,
    lastPurchase: '2024-03-18',
    segment: 'New'
  },
  {
    id: '4',
    name: 'Sarah Davis',
    email: 'sarah.d@example.com',
    totalSpent: 1899.99,
    orderCount: 8,
    lastPurchase: '2024-03-12',
    segment: 'VIP'
  }
];

export function CustomerTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<string>('all');

  const filteredCustomers = mockCustomers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSegment = 
      selectedSegment === 'all' || 
      customer.segment.toLowerCase() === selectedSegment.toLowerCase();

    return matchesSearch && matchesSegment;
  });

  const segments = ['all', 'VIP', 'Regular', 'New'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Customer List
          </h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search customers..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              value={selectedSegment}
              onChange={(e) => setSelectedSegment(e.target.value)}
            >
              {segments.map(segment => (
                <option key={segment} value={segment}>
                  {segment.charAt(0).toUpperCase() + segment.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total Spent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Orders
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Last Purchase
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Segment
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredCustomers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <UserCircleIcon className="h-10 w-10 text-gray-400" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {customer.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {customer.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    ${customer.totalSpent.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {customer.orderCount}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(customer.lastPurchase).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    customer.segment === 'VIP'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100'
                      : customer.segment === 'Regular'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                      : 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                  }`}>
                    {customer.segment}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 