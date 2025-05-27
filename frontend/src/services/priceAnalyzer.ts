// Mock price analyzer service for demo purposes
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
}

export class PriceAnalyzer {
  private static readonly SIGNIFICANCE_THRESHOLDS = {
    HIGH: 20,    // 20% change
    MEDIUM: 10,  // 10% change
    LOW: 5       // 5% change
  };

  private static calculateSignificance(percentageChange: number): 'HIGH' | 'MEDIUM' | 'LOW' {
    const absChange = Math.abs(percentageChange);
    if (absChange >= this.SIGNIFICANCE_THRESHOLDS.HIGH) return 'HIGH';
    if (absChange >= this.SIGNIFICANCE_THRESHOLDS.MEDIUM) return 'MEDIUM';
    return 'LOW';
  }

  static async analyzePriceChange(
    productId: string,
    competitorId: string,
    oldPrice: number,
    newPrice: number
  ): Promise<PriceAlert | null> {
    const percentageChange = ((newPrice - oldPrice) / oldPrice) * 100;
    const significance = this.calculateSignificance(percentageChange);

    // Only create alert if the change is significant enough
    if (significance === 'LOW' && Math.abs(percentageChange) < 5) {
      return null;
    }

    const alert: PriceAlert = {
      id: `alert_${Date.now()}`,
      productId,
      competitorId,
      oldPrice,
      newPrice,
      percentageChange,
      significance,
      timestamp: new Date(),
      reason: this.generateAlertReason(percentageChange, significance)
    };

    // Mock storing the alert
    console.log('📊 Price Alert Generated:', {
      alertId: alert.id,
      change: `${oldPrice} → ${newPrice} (${percentageChange.toFixed(1)}%)`,
      significance: alert.significance
    });

    return alert;
  }

  private static generateAlertReason(
    percentageChange: number,
    significance: 'HIGH' | 'MEDIUM' | 'LOW'
  ): string {
    const direction = percentageChange > 0 ? 'increased' : 'decreased';
    const magnitude = Math.abs(percentageChange).toFixed(1);

    return `Price has ${direction} by ${magnitude}%. This is a ${significance.toLowerCase()} significance change that requires attention.`;
  }

  static async analyzeMarketTrends(productIds: string[]): Promise<any[]> {
    // Mock market analysis
    console.log('📈 Market Trends Analysis for products:', productIds);
    
    return productIds.map(productId => ({
      productId,
      trend: Math.random() > 0.5 ? 'up' : 'down',
      confidence: Math.random() * 100,
      timestamp: new Date()
    }));
  }
} 