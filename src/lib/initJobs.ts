import logger from './logger';
import { scheduleJob } from '@/jobs/priceScraperJob';

export function initializeBackgroundJobs() {
  try {
    // Initialize the price scraper job
    scheduleJob();
    
    logger.info('Background jobs initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize background jobs', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
} 