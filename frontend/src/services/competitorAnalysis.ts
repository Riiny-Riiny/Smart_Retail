import { type } from "os";

// Types for competitor analysis
export interface ProductPrice {
  price: number;
  retailer: string;
  timestamp: string;
  currency?: string;
  isPromotion?: boolean;
}

export interface CompetitorProduct {
  name: string;
  prices: ProductPrice[];
  specifications: Record<string, any>;
  availability: string;
  url: string;
  reviews?: {
    rating: number;
    count: number;
  };
  promotions?: Array<{
    type: string;
    description: string;
    discount: number;
  }>;
}

export interface MarketInsight {
  trend: string;
  confidence: number;
  sources: string[];
}

export interface PriceAnalysis {
  current: {
    min: number;
    max: number;
    avg: number;
    median: number;
  };
  historical?: {
    trend: 'increasing' | 'decreasing' | 'stable';
    percentageChange: number;
  };
  retailerComparison: Record<string, number>;
}

// Main competitor analysis service
export class CompetitorAnalysisService {
  private async searchProduct(query: string, retailers: string[] = []): Promise<CompetitorProduct[]> {
    const products: CompetitorProduct[] = [];
    
    for (const retailer of retailers) {
      try {
        const response = await fetch('/api/firecrawl/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query,
            url: retailer,
            limit: 5
          })
        });

        if (!response.ok) throw new Error(`Search failed for ${retailer}`);
        const data = await response.json();
        
        // Transform and add products
        if (data.products?.length) {
          products.push(...data.products.map((p: any) => ({
            name: p.name,
            prices: [{
              price: p.price,
              retailer: p.retailer || retailer,
              timestamp: p.timestamp,
              isPromotion: (p.promotions?.length || 0) > 0
            }],
            specifications: p.specifications || {},
            availability: p.availability || 'unknown',
            url: p.url,
            reviews: p.reviews,
            promotions: p.promotions
          })));
        }
      } catch (error) {
        console.error(`Error searching ${retailer}:`, error);
      }
    }

    return this.deduplicateProducts(products);
  }

  private async getDetailedProduct(url: string): Promise<CompetitorProduct | null> {
    try {
      const response = await fetch('/api/firecrawl/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (!response.ok) throw new Error('Scrape failed');
      const data = await response.json();
      
      if (!data.product) return null;

      return {
        name: data.product.name,
        prices: [{
          price: data.product.price,
          retailer: data.metadata.retailer,
          timestamp: data.metadata.scrapedAt
        }],
        specifications: data.product.specifications || {},
        availability: data.product.availability || 'unknown',
        url: data.product.url,
        reviews: data.product.reviews,
        promotions: data.product.promotions
      };
    } catch (error) {
      console.error('Error getting detailed product:', error);
      return null;
    }
  }

  private deduplicateProducts(products: CompetitorProduct[]): CompetitorProduct[] {
    const productMap = new Map<string, CompetitorProduct>();
    
    for (const product of products) {
      const key = this.normalizeProductName(product.name);
      if (productMap.has(key)) {
        // Merge product information
        const existing = productMap.get(key)!;
        existing.prices.push(...product.prices);
        existing.promotions = [...(existing.promotions || []), ...(product.promotions || [])];
      } else {
        productMap.set(key, product);
      }
    }

    return Array.from(productMap.values());
  }

  private normalizeProductName(name: string): string {
    return name.toLowerCase()
      .replace(/[^a-z0-9]/g, '') // Remove special characters
      .replace(/\s+/g, ''); // Remove whitespace
  }

  private analyzePrices(products: CompetitorProduct[]): PriceAnalysis {
    const prices = products.flatMap(p => p.prices.map(price => price.price));
    const retailers = new Map<string, number[]>();
    
    // Group prices by retailer
    products.forEach(product => {
      product.prices.forEach(price => {
        const retailerPrices = retailers.get(price.retailer) || [];
        retailerPrices.push(price.price);
        retailers.set(price.retailer, retailerPrices);
      });
    });

    // Calculate retailer averages
    const retailerComparison: Record<string, number> = {};
    retailers.forEach((prices, retailer) => {
      retailerComparison[retailer] = prices.reduce((a, b) => a + b, 0) / prices.length;
    });

    return {
      current: {
        min: Math.min(...prices),
        max: Math.max(...prices),
        avg: prices.reduce((a, b) => a + b, 0) / prices.length,
        median: this.calculateMedian(prices)
      },
      retailerComparison
    };
  }

  private calculateMedian(numbers: number[]): number {
    const sorted = numbers.slice().sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[middle - 1] + sorted[middle]) / 2
      : sorted[middle];
  }

  // Public methods for external use
  async analyzeProduct(query: string, retailers: string[]): Promise<{
    products: CompetitorProduct[];
    priceAnalysis: PriceAnalysis;
    insights: MarketInsight[];
  }> {
    const products = await this.searchProduct(query, retailers);
    const priceAnalysis = this.analyzePrices(products);

    // Get detailed information for top matches
    const detailedProducts = await Promise.all(
      products.slice(0, 3).map(p => this.getDetailedProduct(p.url))
    );

    // Merge detailed information back into products
    products.forEach((product, index) => {
      if (detailedProducts[index]) {
        Object.assign(product, detailedProducts[index]);
      }
    });

    // Generate insights
    const insights: MarketInsight[] = [
      {
        trend: `Price range: $${priceAnalysis.current.min} - $${priceAnalysis.current.max}`,
        confidence: 0.95,
        sources: products.map(p => p.url)
      },
      {
        trend: `Average price across retailers: $${priceAnalysis.current.avg.toFixed(2)}`,
        confidence: 0.9,
        sources: products.map(p => p.url)
      }
    ];

    if (products.some(p => p.promotions?.length)) {
      insights.push({
        trend: "Active promotions detected across retailers",
        confidence: 0.85,
        sources: products.filter(p => p.promotions?.length).map(p => p.url)
      });
    }

    return {
      products,
      priceAnalysis,
      insights
    };
  }

  async trackPriceChanges(productUrl: string, interval: number = 24): Promise<void> {
    // Implementation for price tracking
    // This would typically be set up with a background job/webhook
    console.log(`Setting up price tracking for ${productUrl} every ${interval} hours`);
  }
} 