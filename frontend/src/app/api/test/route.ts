import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    firecrawl_key: process.env.FIRECRAWL_API_KEY ? 'Set' : 'Not set',
    openai_key: process.env.OPENAI_API_KEY ? 'Set' : 'Not set',
    firecrawl_key_length: process.env.FIRECRAWL_API_KEY?.length || 0,
    openai_key_length: process.env.OPENAI_API_KEY?.length || 0
  });
} 