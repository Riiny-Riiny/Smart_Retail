import { NextResponse } from 'next/server';
import { OpenAIService } from '@/services/openai';
import { Product } from '@/types/competitor';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { products } = body as { products: Product[] };

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or empty products data' },
        { status: 400 }
      );
    }

    const insights = await OpenAIService.generatePriceInsights(products);
    
    return NextResponse.json({ insights });
  } catch (error) {
    console.error('AI Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
} 