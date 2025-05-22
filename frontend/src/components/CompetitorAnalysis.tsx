import { useState, useEffect } from 'react';
import { CompetitorAnalysisService, type CompetitorProduct, type PriceAnalysis, type MarketInsight } from '../services/competitorAnalysis';

interface CompetitorAnalysisProps {
  productQuery: string;
  retailers: string[];
}

export default function CompetitorAnalysis({ productQuery, retailers }: CompetitorAnalysisProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<CompetitorProduct[]>([]);
  const [priceAnalysis, setPriceAnalysis] = useState<PriceAnalysis | null>(null);
  const [insights, setInsights] = useState<MarketInsight[]>([]);

  useEffect(() => {
    const analyzeProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const service = new CompetitorAnalysisService();
        const result = await service.analyzeProduct(productQuery, retailers);
        
        setProducts(result.products);
        setPriceAnalysis(result.priceAnalysis);
        setInsights(result.insights);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (productQuery && retailers.length > 0) {
      analyzeProduct();
    }
  }, [productQuery, retailers]);

  if (loading) {
    return (
      <div className="animate-pulse p-4">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        <h3 className="font-semibold">Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Price Analysis Section */}
      {priceAnalysis && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Price Analysis</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Lowest Price</p>
              <p className="text-2xl font-bold text-blue-600">
                ${priceAnalysis.current.min.toFixed(2)}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Average Price</p>
              <p className="text-2xl font-bold text-green-600">
                ${priceAnalysis.current.avg.toFixed(2)}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Median Price</p>
              <p className="text-2xl font-bold text-purple-600">
                ${priceAnalysis.current.median.toFixed(2)}
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Highest Price</p>
              <p className="text-2xl font-bold text-orange-600">
                ${priceAnalysis.current.max.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Market Insights Section */}
      {insights.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Market Insights</h2>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                <p className="text-gray-800">{insight.trend}</p>
                <div className="flex items-center mt-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${insight.confidence * 100}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {(insight.confidence * 100).toFixed(0)}% confidence
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Comparison Section */}
      {products.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <h2 className="text-xl font-semibold p-6 pb-4">Product Comparison</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Retailer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Availability
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        <a href={product.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                          {product.name}
                        </a>
                      </div>
                      {product.promotions?.length > 0 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Promotion
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${product.prices[0].price.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.prices[0].retailer}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.availability.toLowerCase() === 'in stock'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.availability}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.reviews ? (
                        <div className="flex items-center">
                          <span className="text-sm text-gray-900">
                            {product.reviews.rating.toFixed(1)}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            ({product.reviews.count} reviews)
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No reviews</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 