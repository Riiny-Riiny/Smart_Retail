import nodemailer from 'nodemailer';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';
import type { PriceAlert } from './priceAnalyzer';

export class NotificationService {
  private static transporter: nodemailer.Transporter;

  static async initializeTransporter() {
    if (this.transporter) {
      return this.transporter;
    }

    // Create Ethereal test account
    const testAccount = await nodemailer.createTestAccount();
    logger.info('Created Ethereal test account', {
      user: testAccount.user,
      url: 'https://ethereal.email'
    });

    // Create reusable transporter using Ethereal credentials
    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    return this.transporter;
  }

  private static async getAlertSubscribers(significance: 'HIGH' | 'MEDIUM' | 'LOW'): Promise<string[]> {
    const subscribers = await prisma.user.findMany({
      where: {
        alertPreferences: {
          minSignificance: {
            in: significance === 'HIGH' ? ['HIGH'] :
                significance === 'MEDIUM' ? ['HIGH', 'MEDIUM'] :
                ['HIGH', 'MEDIUM', 'LOW']
          }
        }
      },
      select: { email: true }
    });

    return subscribers.map(user => user.email);
  }

  static async sendPriceAlert(alert: PriceAlert): Promise<void> {
    try {
      const subscribers = await this.getAlertSubscribers(alert.significance);
      
      if (subscribers.length === 0) {
        logger.info('No subscribers found for alert', { alertId: alert.id });
        return;
      }

      const [product, competitor] = await Promise.all([
        prisma.product.findUnique({ where: { id: alert.productId } }),
        prisma.competitor.findUnique({ where: { id: alert.competitorId } })
      ]);

      const emailContent = this.generateEmailContent(alert, product?.name || '', competitor?.name || '');

      // Ensure transporter is initialized
      const transporter = await this.initializeTransporter();

      // Send mail with Ethereal
      const info = await transporter.sendMail({
        from: '"Smart Retail Price Alert" <alerts@smartretail.test>',
        to: subscribers.join(', '),
        subject: `[${alert.significance}] Price Change Alert - ${product?.name}`,
        html: emailContent,
      });

      logger.info('Price alert email sent', {
        alertId: alert.id,
        recipientCount: subscribers.length,
        previewUrl: nodemailer.getTestMessageUrl(info),
      });
    } catch (error) {
      logger.error('Failed to send price alert email', {
        alertId: alert.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  private static generateEmailContent(
    alert: PriceAlert,
    productName: string,
    competitorName: string
  ): string {
    const priceChange = alert.percentageChange > 0 ? 'increased' : 'decreased';
    const changeColor = alert.percentageChange > 0 ? '#ff4444' : '#44bb44';
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Price Change Alert</h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
          <p style="font-size: 16px; color: #333;">
            <strong>${competitorName}</strong> has ${priceChange} their price for <strong>${productName}</strong>
          </p>
          
          <div style="margin: 20px 0;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span>Old Price:</span>
              <strong>$${alert.oldPrice.toFixed(2)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span>New Price:</span>
              <strong>$${alert.newPrice.toFixed(2)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span>Change:</span>
              <strong style="color: ${changeColor}">
                ${alert.percentageChange > 0 ? '+' : ''}${alert.percentageChange.toFixed(1)}%
              </strong>
            </div>
          </div>

          <p style="font-size: 14px; color: #666;">
            ${alert.reason}
          </p>
          
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="font-size: 12px; color: #999;">
              Alert Significance: <strong>${alert.significance}</strong><br>
              Generated at: ${alert.timestamp.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    `;
  }
} 