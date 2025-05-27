'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PriceData {
  date: string;
  our_price: number;
  competitor_avg: number;
  market_avg: number;
}

const mockData: PriceData[] = [
  { date: 'Jan', our_price: 299, competitor_avg: 320, market_avg: 310 },
  { date: 'Feb', our_price: 289, competitor_avg: 310, market_avg: 305 },
  { date: 'Mar', our_price: 295, competitor_avg: 315, market_avg: 308 },
  { date: 'Apr', our_price: 292, competitor_avg: 318, market_avg: 312 },
  { date: 'May', our_price: 285, competitor_avg: 305, market_avg: 300 },
  { date: 'Jun', our_price: 288, competitor_avg: 308, market_avg: 302 },
];

export function PriceTrendChart() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Price Trends
      </h3>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={mockData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF"
            />
            <YAxis 
              stroke="#9CA3AF"
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '0.5rem',
                color: '#F3F4F6',
              }}
              formatter={(value: number) => [`$${value}`, '']}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="our_price"
              name="Our Price"
              stroke="#0070f3"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="competitor_avg"
              name="Competitor Avg"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="market_avg"
              name="Market Avg"
              stroke="#F59E0B"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 