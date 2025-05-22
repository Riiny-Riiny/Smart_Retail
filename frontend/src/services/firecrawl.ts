import { Product, ScrapingResult } from '@/types/competitor';

export class FirecrawlService {
  private static async scrapeProductPage(url: string): Promise<Product | null> {
    try {
      console.log('Scraping product page:', url);
      const response = await fetch('/api/firecrawl/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          extract: {
            schema: {
              name: { type: 'string', required: true },
              price: { type: 'number', required: true },
              description: { type: 'string' },
              inStock: { type: 'boolean', required: true },
              imageUrl: { type: 'string' }
            },
            prompt: "Extract product information including name, price, description, stock status, and image URL from this page."
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Scraping error response:', {
          status: response.status,
          statusText: response.statusText,
          data: errorData
        });
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Scraped product data:', data);
      
      return {
        id: url,
        url,
        ...data.extract,
        lastChecked: new Date().toISOString(),
        competitorId: new URL(url).hostname
      };
    } catch (error) {
      console.error('Error scraping product:', error);
      return null;
    }
  }

  static async scrapeCompetitorProducts(urls: string[]): Promise<ScrapingResult> {
    try {
      console.log('Scraping competitor products:', urls);
      const productPromises = urls.map(url => this.scrapeProductPage(url));
      const products = await Promise.all(productPromises);
      
      return {
        success: true,
        timestamp: new Date().toISOString(),
        products: products.filter((p): p is Product => p !== null)
      };
    } catch (error) {
      console.error('Error in scrapeCompetitorProducts:', error);
      return {
        success: false,
        timestamp: new Date().toISOString(),
        products: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  static async searchCompetitorProducts(competitorUrl: string, searchTerm: string): Promise<ScrapingResult> {
    try {
      console.log('Searching competitor products:', { competitorUrl, searchTerm });
      const response = await fetch('/api/firecrawl/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchTerm,
          url: competitorUrl,
          limit: 10,
          scrapeOptions: {
            formats: ['markdown'],
            onlyMainContent: true
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Search error response:', {
          status: response.status,
          statusText: response.statusText,
          data: errorData
        });
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const searchResults = await response.json();
      console.log('Search results:', searchResults);
      
      const productUrls = searchResults.results.map((r: any) => r.url);
      return this.scrapeCompetitorProducts(productUrls);
    } catch (error) {
      console.error('Error in searchCompetitorProducts:', error);
      return {
        success: false,
        timestamp: new Date().toISOString(),
        products: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
} 