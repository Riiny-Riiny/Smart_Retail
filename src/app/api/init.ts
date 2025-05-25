import { NextResponse } from 'next/server';
import { initializeBackgroundJobs } from '@/lib/initJobs';
import logger from '@/lib/logger';

// Initialize background jobs when the application starts
let initialized = false;

export async function GET() {
  if (!initialized) {
    try {
      initializeBackgroundJobs();
      initialized = true;
      logger.info('Background jobs initialized successfully');
      return NextResponse.json({ status: 'success', message: 'Background jobs initialized' });
    } catch (error) {
      logger.error('Failed to initialize background jobs', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return NextResponse.json(
        { status: 'error', message: 'Failed to initialize background jobs' },
        { status: 500 }
      );
    }
  }
  
  return NextResponse.json({ status: 'success', message: 'Background jobs already initialized' });
} 