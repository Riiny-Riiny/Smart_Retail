import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PriceAnalyzer } from '@/services/priceAnalyzer';
import { NotificationService } from '@/services/notificationService';
import logger from '@/lib/logger';

export async function GET() {
  try {
    // Create a test product if it doesn't exist
    const product = await prisma.product.upsert({
      where: { id: 'test-product' },
      update: {},
      create: {
        id: 'test-product',
        name: 'Test Product',
        description: 'A test product for alert testing',
        sku: 'TEST-001',
      },
    });

    // Create a test competitor if it doesn't exist
    const competitor = await prisma.competitor.upsert({
      where: { id: 'test-competitor' },
      update: {},
      create: {
        id: 'test-competitor',
        name: 'Test Competitor',
        website: 'https://test-competitor.com',
        active: true,
      },
    });

    // Create a test user if it doesn't exist
    const user = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        name: 'Test User',
        alertPreferences: {
          create: {
            minSignificance: 'LOW',
          },
        },
      },
    });

    // Create a price history entry
    await prisma.priceHistory.create({
      data: {
        productId: product.id,
        competitorId: competitor.id,
        price: 100.00,
        url: 'https://test-competitor.com/test-product',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
      },
    });

    // Trigger a price alert with a significant price change
    const alert = await PriceAnalyzer.analyzePriceChange(
      product.id,
      competitor.id,
      100.00, // old price
      150.00  // new price (50% increase)
    );

    if (!alert) {
      return NextResponse.json({ 
        success: false, 
        message: 'No alert was generated - change not significant enough' 
      });
    }

    // Send the notification
    await NotificationService.sendPriceAlert(alert);

    return NextResponse.json({ 
      success: true, 
      message: 'Test alert sent successfully',
      alert 
    });

  } catch (error) {
    logger.error('Error sending test alert:', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 