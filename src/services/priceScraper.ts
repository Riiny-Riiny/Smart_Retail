import axios from 'axios';
import rax from 'retry-axios';
import { PrismaClient } from '@prisma/client';
import logger from '@/lib/logger';
import { PriceAnalyzer } from './priceAnalyzer';
import { NotificationService } from './notificationService';
import { getWebSocketServer } from '@/lib/websocket';

const prisma = new PrismaClient();

// Configure axios with retry logic
const axiosInstance = axios.create();
axiosInstance.defaults.raxConfig = {
  retry: 3,
  retryDelay: 1000,
  statusCodesToRetry: [[408, 429], [500, 599]],
  onRetryAttempt: (err) => {
    const cfg = rax.getConfig(err);
    logger.warn(`Retry attempt #${cfg?.currentRetryAttempt} for ${err.config.url}`);
  },
};
rax.attach(axiosInstance);

export interface ScrapedPrice {
  productId: string;
  competitorId: string;
  price: number;
  url: string;
  timestamp: Date;
}

export class PriceScraper {
  private static async scrapeCompetitorPrice(url: string): Promise<number> {
    try {
      const response = await axiosInstance.get(url);
      // Implement your price extraction logic here
      // This is a placeholder implementation
      const price = 0; // Extract price from response.data
      return price;
    } catch (error) {
      logger.error('Error scraping price:', {
        url,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  static async scrapeAndStorePrices(): Promise<void> {
    try {
      // Get all active competitors and their products to monitor
      const competitors = await prisma.competitor.findMany({
        where: { active: true },
        include: { products: true },
      });

      logger.info('Starting price scraping job', {
        competitorCount: competitors.length,
      });

      for (const competitor of competitors) {
        for (const product of competitor.products) {
          try {
            const newPrice = await this.scrapeCompetitorPrice(product.url);

            // Get the last price for comparison
            const lastPrice = await prisma.priceHistory.findFirst({
              where: {
                productId: product.id,
                competitorId: competitor.id,
              },
              orderBy: { timestamp: 'desc' },
            });

            // Store the scraped price
            const priceHistory = await prisma.priceHistory.create({
              data: {
                price: newPrice,
                timestamp: new Date(),
                productId: product.id,
                competitorId: competitor.id,
                url: product.url,
              },
            });

            // Check if we should create an alert
            if (lastPrice) {
              const alert = await PriceAnalyzer.analyzePriceChange(
                product.id,
                competitor.id,
                lastPrice.price,
                newPrice
              );

              if (alert) {
                // Send email notifications
                await NotificationService.sendPriceAlert(alert);

                // Broadcast to WebSocket clients
                const wsServer = getWebSocketServer();
                wsServer.broadcastAlert(alert);
              }
            }

            logger.info('Price scraped and stored successfully', {
              competitorId: competitor.id,
              productId: product.id,
              price: newPrice,
              hasAlert: !!alert,
            });
          } catch (error) {
            logger.error('Failed to scrape price for product', {
              competitorId: competitor.id,
              productId: product.id,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
            // Continue with next product even if one fails
            continue;
          }
        }
      }

      logger.info('Price scraping job completed');
    } catch (error) {
      logger.error('Price scraping job failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  static async getLatestPrices(productId: string): Promise<ScrapedPrice[]> {
    try {
      const latestPrices = await prisma.priceHistory.findMany({
        where: { productId },
        orderBy: { timestamp: 'desc' },
        take: 1,
        include: { competitor: true },
      });

      return latestPrices.map(price => ({
        productId: price.productId,
        competitorId: price.competitorId,
        price: price.price,
        url: price.url,
        timestamp: price.timestamp,
      }));
    } catch (error) {
      logger.error('Error fetching latest prices:', {
        productId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
} 