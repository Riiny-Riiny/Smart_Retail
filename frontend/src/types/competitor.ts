export interface Competitor {
  id: string;
  name: string;
  website: string;
  productsTracked: number;
  lastUpdate: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  url: string;
  imageUrl?: string;
  description?: string;
  inStock: boolean;
  lastChecked: string;
  competitorId: string;
}

export interface ScrapingResult {
  success: boolean;
  timestamp: string;
  products: Product[];
  error?: string;
} 