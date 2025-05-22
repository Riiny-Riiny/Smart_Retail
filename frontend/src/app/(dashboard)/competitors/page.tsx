'use client';

import { useState } from 'react';
import CompetitorAnalysis from '@/components/CompetitorAnalysis';

const defaultRetailers = [
  'https://www.bestbuy.com',
  'https://www.walmart.com',
  'https://www.target.com',
  'https://www.amazon.com'
];

export default function CompetitorsPage() {
  const [productQuery, setProductQuery] = useState('');
  const [selectedRetailers, setSelectedRetailers] = useState(defaultRetailers);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Competitor Analysis
        </h1>
        <p className="text-gray-600">
          Monitor competitor prices, promotions, and market trends in real-time.
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="productQuery" className="block text-sm font-medium text-gray-700 mb-1">
              Product Search
            </label>
            <input
              type="text"
              id="productQuery"
              value={productQuery}
              onChange={(e) => setProductQuery(e.target.value)}
              placeholder="Enter product name or keywords..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={!productQuery}
            >
              Analyze
            </button>
          </div>
        </div>

        {/* Retailer Selection */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Retailers
          </label>
          <div className="flex flex-wrap gap-3">
            {defaultRetailers.map((retailer) => (
              <label key={retailer} className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={selectedRetailers.includes(retailer)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedRetailers([...selectedRetailers, retailer]);
                    } else {
                      setSelectedRetailers(selectedRetailers.filter(r => r !== retailer));
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">
                  {new URL(retailer).hostname.replace('www.', '')}
                </span>
              </label>
            ))}
          </div>
        </div>
      </form>

      {/* Analysis Results */}
      {isAnalyzing && productQuery && selectedRetailers.length > 0 && (
        <CompetitorAnalysis
          productQuery={productQuery}
          retailers={selectedRetailers}
        />
      )}

      {/* Empty State */}
      {!isAnalyzing && (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No analysis yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Enter a product name and select retailers to start analyzing competitor data.
          </p>
        </div>
      )}
    </div>
  );
} 