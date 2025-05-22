import { NextResponse } from 'next/server';

// Enhanced product schema for detailed analysis
const productSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    price: { type: 'number' },
    currency: { type: 'string' },
    availability: { type: 'string' },
    description: { type: 'string' },
    specifications: {
      type: 'object',
      additionalProperties: true
    },
    variants: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          price: { type: 'number' },
          availability: { type: 'string' },
          features: { type: 'array', items: { type: 'string' } }
        }
      }
    },
    reviews: {
      type: 'object',
      properties: {
        rating: { type: 'number' },
        count: { type: 'number' },
        distribution: {
          type: 'object',
          properties: {
            '5': { type: 'number' },
            '4': { type: 'number' },
            '3': { type: 'number' },
            '2': { type: 'number' },
            '1': { type: 'number' }
          }
        },
        highlights: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              positive: { type: 'string' },
              negative: { type: 'string' }
            }
          }
        }
      }
    },
    promotions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string' },
          description: { type: 'string' },
          discount: { type: 'number' },
          validUntil: { type: 'string' }
        }
      }
    },
    imageUrl: { type: 'string' },
    additionalImages: {
      type: 'array',
      items: { type: 'string' }
    },
    brand: { type: 'string' },
    category: { type: 'string' },
    retailer: { type: 'string' },
    shipping: {
      type: 'object',
      properties: {
        free: { type: 'boolean' },
        cost: { type: 'number' },
        estimatedDays: { type: 'number' }
      }
    }
  },
  required: ['name', 'price']
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // First, map the retailer's site to understand the product context
    const mapResponse = await fetch('https://mcp.smithery.ai/api/v1/firecrawl/map', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: new URL(url).origin,
        limit: 10,
        includeSubdomains: false
      })
    });

    let categoryContext = [];
    if (mapResponse.ok) {
      const mapData = await mapResponse.json();
      categoryContext = mapData.urls || [];
    }

    // Use MCP Firecrawl scrape with advanced extraction
    const scrapeResponse = await fetch('https://mcp.smithery.ai/api/v1/firecrawl/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['markdown'],
        onlyMainContent: true,
        extract: {
          schema: productSchema,
          prompt: "Extract comprehensive product information including detailed specifications, variants, promotions, and shipping details. Analyze review sentiment and identify key features.",
          systemPrompt: "You are a retail product analyst. Focus on extracting detailed product information, competitive advantages, and customer sentiment. Pay special attention to pricing strategies, promotional offers, and product positioning."
        },
        actions: [
          { type: 'wait', milliseconds: 2000 },
          { type: 'scroll', direction: 'down' },
          { type: 'wait', milliseconds: 1000 },
          // Additional actions to capture dynamic content
          { type: 'executeJavascript', script: 'window.scrollTo(0, document.body.scrollHeight)' },
          { type: 'wait', milliseconds: 1000 }
        ]
      })
    });

    if (!scrapeResponse.ok) {
      const errorText = await scrapeResponse.text();
      console.error('MCP Firecrawl scrape failed:', errorText);
      
      if (scrapeResponse.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      
      throw new Error(`MCP Firecrawl scrape failed: ${scrapeResponse.statusText}`);
    }

    const data = await scrapeResponse.json();
    
    // Transform and enhance the response with competitive analysis
    const productData = {
      ...data.extract,
      rawContent: data.content,
      url: data.url,
      timestamp: new Date().toISOString(),
      success: true
    };

    // Enhanced competitive analysis metadata
    const metadata = {
      scrapedAt: new Date().toISOString(),
      retailer: new URL(url).hostname,
      categoryContext: categoryContext,
      dataQuality: {
        hasPrice: !!productData.price,
        hasDescription: !!productData.description,
        hasSpecifications: Object.keys(productData.specifications || {}).length > 0,
        hasVariants: (productData.variants || []).length > 0,
        hasReviews: !!(productData.reviews?.rating || productData.reviews?.count),
        hasPromotions: (productData.promotions || []).length > 0,
        hasShipping: !!productData.shipping,
        completenessScore: calculateCompletenessScore(productData)
      },
      competitiveAnalysis: {
        pricingStrategy: determinePricingStrategy(productData),
        promotionalActivity: analyzePromotions(productData),
        productPositioning: analyzePositioning(productData),
        customerSentiment: analyzeReviews(productData)
      }
    };

    return NextResponse.json({
      product: productData,
      metadata,
      success: true
    });
  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to scrape product data',
        details: error.message,
        success: false
      },
      { status: 500 }
    );
  }
}

// Helper functions for competitive analysis
function calculateCompletenessScore(product: any): number {
  const fields = [
    'name', 'price', 'description', 'specifications',
    'variants', 'reviews', 'promotions', 'shipping'
  ];
  const presentFields = fields.filter(field => {
    const value = product[field];
    return value && (
      typeof value === 'object' ? Object.keys(value).length > 0 : true
    );
  });
  return (presentFields.length / fields.length) * 100;
}

function determinePricingStrategy(product: any): string {
  if (!product.price) return 'unknown';
  if (product.promotions?.length > 0) return 'promotional';
  if (product.variants?.length > 0) return 'tiered';
  return 'standard';
}

function analyzePromotions(product: any): any {
  const promotions = product.promotions || [];
  return {
    count: promotions.length,
    types: [...new Set(promotions.map((p: any) => p.type))],
    averageDiscount: promotions.reduce((sum: number, p: any) => sum + (p.discount || 0), 0) / (promotions.length || 1)
  };
}

function analyzePositioning(product: any): string {
  if (!product.price) return 'unknown';
  if (product.specifications && Object.keys(product.specifications).length > 5) return 'feature-rich';
  if (product.promotions?.length > 0) return 'value-focused';
  return 'standard';
}

function analyzeReviews(product: any): any {
  const reviews = product.reviews || {};
  return {
    overallSentiment: reviews.rating > 4 ? 'positive' : reviews.rating > 3 ? 'neutral' : 'negative',
    totalReviews: reviews.count || 0,
    averageRating: reviews.rating || 0,
    distribution: reviews.distribution || {}
  };
} 