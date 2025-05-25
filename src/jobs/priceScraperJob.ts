import cron from 'node-cron';
import Queue from 'bull';
import logger from '@/lib/logger';
import { PriceScraper } from '@/services/priceScraper';

// Create a Bull queue for price scraping jobs
const priceScraperQueue = new Queue('price-scraper', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});

// Process jobs in the queue
priceScraperQueue.process(async (job) => {
  logger.info('Processing price scraping job', { jobId: job.id });
  
  try {
    await PriceScraper.scrapeAndStorePrices();
    logger.info('Price scraping job completed successfully', { jobId: job.id });
  } catch (error) {
    logger.error('Price scraping job failed', {
      jobId: job.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
});

// Handle failed jobs
priceScraperQueue.on('failed', (job, error) => {
  logger.error('Job failed', {
    jobId: job.id,
    error: error instanceof Error ? error.message : 'Unknown error',
  });
});

// Schedule the job to run every hour
const scheduleJob = () => {
  // Run every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    try {
      logger.info('Scheduling price scraping job');
      await priceScraperQueue.add(
        {},
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        }
      );
    } catch (error) {
      logger.error('Failed to schedule price scraping job', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  logger.info('Price scraping job scheduler initialized');
};

export { scheduleJob, priceScraperQueue }; 