import { PrismaClient } from '@prisma/client';
import logger from '@/lib/logger';
import prisma from '@/lib/prisma';

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
  // Z-score threshold for significant changes
  private static readonly SIGNIFICANCE_THRESHOLDS = {
    HIGH: 2.5,    // 99% confidence
    MEDIUM: 1.96, // 95% confidence
    LOW: 1.645    // 90% confidence
  };

  private static calculateZScore(value: number, mean: number, stdDev: number): number {
    return Math.abs((value - mean) / (stdDev || 1));
  }

  private static calculateSignificance(zScore: number): 'HIGH' | 'MEDIUM' | 'LOW' {
    if (zScore >= this.SIGNIFICANCE_THRESHOLDS.HIGH) return 'HIGH';
    if (zScore >= this.SIGNIFICANCE_THRESHOLDS.MEDIUM) return 'MEDIUM';
    if (zScore >= this.SIGNIFICANCE_THRESHOLDS.LOW) return 'LOW';
    return 'LOW';
  }

  private static async getHistoricalStats(productId: string, competitorId: string): Promise<{
    mean: number;
    stdDev: number;
  }> {
    const prices = await prisma.priceHistory.findMany({
      where: {
        productId,
        competitorId,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 30, // Last 30 data points
    });

    if (prices.length === 0) {
      return { mean: 0, stdDev: 0 };
    }

    const values = prices.map(p => p.price);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return { mean, stdDev };
  }

  static async analyzePriceChange(
    productId: string,
    competitorId: string,
    oldPrice: number,
    newPrice: number
  ): Promise<PriceAlert | null> {
    try {
      const percentageChange = ((newPrice - oldPrice) / oldPrice) * 100;
      
      // Get historical statistics
      const { mean, stdDev } = await this.getHistoricalStats(productId, competitorId);
      
      // Calculate z-score of the price change
      const zScore = this.calculateZScore(newPrice, mean, stdDev);
      const significance = this.calculateSignificance(zScore);

      // Only create alert if the change is significant
      if (significance === 'LOW' && Math.abs(percentageChange) < 5) {
        return null;
      }

      // Get product and competitor details for context
      const [product, competitor] = await Promise.all([
        prisma.product.findUnique({ where: { id: productId } }),
        prisma.competitor.findUnique({ where: { id: competitorId } })
      ]);

      const reason = this.generateAlertReason(
        percentageChange,
        significance,
        mean,
        newPrice,
        product?.name || '',
        competitor?.name || ''
      );

      const alert = await prisma.priceAlert.create({
        data: {
          productId,
          competitorId,
          oldPrice,
          newPrice,
          percentageChange,
          significance,
          reason,
          timestamp: new Date(),
        },
      });

      logger.info('Price alert created', {
        alertId: alert.id,
        productId,
        competitorId,
        significance,
      });

      return alert;
    } catch (error) {
      logger.error('Error analyzing price change:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        productId,
        competitorId,
      });
      throw error;
    }
  }

  private static generateAlertReason(
    percentageChange: number,
    significance: 'HIGH' | 'MEDIUM' | 'LOW',
    historicalMean: number,
    newPrice: number,
    productName: string,
    competitorName: string
  ): string {
    const direction = percentageChange > 0 ? 'increased' : 'decreased';
    const magnitude = Math.abs(percentageChange).toFixed(1);
    const meanDiff = ((newPrice - historicalMean) / historicalMean * 100).toFixed(1);

    let reason = `${competitorName} has ${direction} their price for ${productName} by ${magnitude}%. `;
    reason += `This is ${significance.toLowerCase()} significance change. `;
    reason += `The new price is ${meanDiff}% ${newPrice > historicalMean ? 'above' : 'below'} the historical average.`;

    return reason;
  }
} 