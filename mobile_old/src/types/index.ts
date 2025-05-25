export interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
}

export interface PriceAlert {
  id: string;
  productId: string;
  competitorId: string;
  oldPrice: number;
  newPrice: number;
  percentageChange: number;
  significance: 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: Date;
  reason: string;
  product?: Product;
}

export interface Competitor {
  id: string;
  name: string;
  website: string;
  active: boolean;
}

export interface PriceHistory {
  id: string;
  productId: string;
  competitorId: string;
  price: number;
  url: string;
  timestamp: Date;
  product?: Product;
  competitor?: Competitor;
}

export interface OfflineQueueItem {
  id: string;
  type: 'SCAN' | 'ALERT_READ' | 'PRICE_UPDATE';
  data: any;
  timestamp: Date;
  status: 'PENDING' | 'PROCESSING' | 'FAILED';
  retryCount: number;
} 