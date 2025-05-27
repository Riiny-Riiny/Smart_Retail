// Mock price scraper service for demo purposes
export interface ScrapedPrice {
  productId: string;
  competitorId: string;
  price: number;
  url: string;
  timestamp: Date;
}

export class PriceScraper {
  private static generateMockPrice(basePrice: number = 100): number {
    // Generate a price within ±20% of base price
    const variation = (Math.random() - 0.5) * 0.4; // -0.2 to +0.2
    return Math.round((basePrice * (1 + variation)) * 100) / 100;
  }

  static async scrapeAndStorePrices(): Promise<void> {
    console.log('🕷️ Mock price scraping started...');
    
    // Simulate scraping multiple products
    const mockProducts = [
      { id: 'prod-1', name: 'iPhone 15', basePrice: 999 },
      { id: 'prod-2', name: 'Samsung Galaxy S24', basePrice: 899 },
      { id: 'prod-3', name: 'Google Pixel 8', basePrice: 699 },
    ];

    const mockCompetitors = [
      { id: 'comp-1', name: 'Amazon' },
      { id: 'comp-2', name: 'Best Buy' },
      { id: 'comp-3', name: 'Walmart' },
    ];

    for (const product of mockProducts) {
      for (const competitor of mockCompetitors) {
        const scrapedPrice = this.generateMockPrice(product.basePrice);
        
        console.log(`📊 Scraped ${competitor.name} price for ${product.name}: $${scrapedPrice}`);
        
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log('✅ Mock price scraping completed');
  }

  static async getLatestPrices(productId: string): Promise<ScrapedPrice[]> {
    console.log(`📈 Fetching latest prices for product: ${productId}`);
    
    // Mock latest prices
    const mockPrices: ScrapedPrice[] = [
      {
        productId,
        competitorId: 'comp-1',
        price: this.generateMockPrice(100),
        url: 'https://example.com/product',
        timestamp: new Date()
      },
      {
        productId,
        competitorId: 'comp-2',
        price: this.generateMockPrice(105),
        url: 'https://example2.com/product',
        timestamp: new Date()
      }
    ];

    return mockPrices;
  }

  static async scrapeSingleProduct(url: string): Promise<number> {
    console.log(`🎯 Scraping single product from: ${url}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock price
    return this.generateMockPrice();
  }
} 