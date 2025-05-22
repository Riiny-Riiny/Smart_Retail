import { NextResponse } from 'next/server';

// Enhanced product schema for competitive analysis
const productSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    price: { type: 'number' },
    currency: { type: 'string' },
    availability: { type: 'string' },
    description: { type: 'string' },
    url: { type: 'string' },
    imageUrl: { type: 'string' },
    retailer: { type: 'string' },
    category: { type: 'string' },
    brand: { type: 'string' },
    promotions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string' },
          description: { type: 'string' },
          discount: { type: 'number' }
        }
      }
    },
    priceHistory: {
      type: 'object',
      properties: {
        current: { type: 'number' },
        previous: { type: 'number' },
        lowestRecorded: { type: 'number' }
      }
    }
  },
  required: ['name', 'price', 'url']
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, url, limit = 10 } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // First, use deep research to gather market insights
    const researchResponse = await fetch('https://mcp.smithery.ai/api/v1/firecrawl/deep_research', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `${query} price comparison analysis`,
        maxDepth: 2,
        timeLimit: 60,
        maxUrls: 20
      })
    });

    let marketInsights = {};
    if (researchResponse.ok) {
      const researchData = await researchResponse.json();
      marketInsights = {
        trends: researchData.finalAnalysis,
        sources: researchData.sources
      };
    }

    // Then perform the product search with structured extraction
    const searchResponse = await fetch('https://mcp.smithery.ai/api/v1/firecrawl/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        url,
        limit,
        scrapeOptions: {
          formats: ['markdown'],
          onlyMainContent: true
        },
        extract: {
          schema: productSchema,
          prompt: "Extract comprehensive product information including name, price, promotions, and availability. For prices, extract numeric values and identify any discounts or special offers.",
          systemPrompt: "You are a retail competitive analyst. Focus on extracting product details, pricing strategies, promotional offers, and competitive positioning."
        }
      })
    });

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('MCP Firecrawl search failed:', errorText);
      
      if (searchResponse.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      
      throw new Error(`MCP Firecrawl search failed: ${searchResponse.statusText}`);
    }

    const data = await searchResponse.json();

    // Transform and enhance the response with competitive analysis
    const products = Array.isArray(data.results) ? data.results.map(result => {
      const extractedData = result.extract || {};
      
      return {
        ...extractedData,
        rawContent: result.content,
        url: result.url,
        timestamp: new Date().toISOString(),
        competitivePosition: {
          pricePoint: extractedData.price ? 'analyzing' : 'unknown',
          availability: extractedData.availability || 'unknown',
          promotionalStrategy: extractedData.promotions?.length > 0 ? 'active' : 'none'
        }
      };
    }) : [];

    // Add market analysis metadata
    const analysisMetadata = {
      searchTimestamp: new Date().toISOString(),
      retailersAnalyzed: [...new Set(products.map(p => p.retailer))],
      priceRange: products.length > 0 ? {
        min: Math.min(...products.map(p => p.price || Infinity)),
        max: Math.max(...products.map(p => p.price || -Infinity)),
        avg: products.reduce((sum, p) => sum + (p.price || 0), 0) / products.length
      } : null,
      marketInsights
    };

    return NextResponse.json({
      products,
      total: products.length,
      query,
      retailer: url,
      analysis: analysisMetadata
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search competitor products', details: error.message },
      { status: 500 }
    );
  }
} 