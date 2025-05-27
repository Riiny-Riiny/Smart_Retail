// Mock notification service for demo purposes
export type PriceAlert = {
  id: string;
  productId: string;
  competitorId: string;
  oldPrice: number;
  newPrice: number;
  percentageChange: number;
  significance: 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
  timestamp: Date;
};

export class NotificationService {
  static async sendPriceAlert(alert: PriceAlert): Promise<void> {
    // Mock implementation for demo
    console.log('📧 Price Alert Sent:', {
      alertId: alert.id,
      productId: alert.productId,
      priceChange: `${alert.oldPrice} → ${alert.newPrice} (${alert.percentageChange.toFixed(1)}%)`,
      significance: alert.significance,
      timestamp: alert.timestamp
    });

    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  static async sendStockAlert(productId: string, stockLevel: number): Promise<void> {
    console.log('📦 Stock Alert Sent:', {
      productId,
      stockLevel,
      timestamp: new Date()
    });

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  static async sendCompetitorAlert(competitorId: string, changes: string[]): Promise<void> {
    console.log('🏪 Competitor Alert Sent:', {
      competitorId,
      changes,
      timestamp: new Date()
    });

    await new Promise(resolve => setTimeout(resolve, 100));
  }
} 