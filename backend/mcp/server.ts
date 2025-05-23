import express from 'express';
import { Pool } from 'pg';
import cors from 'cors';
import { config } from 'dotenv';
import { Router } from 'express';

// Load environment variables
config();

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'smart_retail_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'smart_retail',
  password: process.env.DB_PASSWORD || 'your_secure_password',
  port: parseInt(process.env.DB_PORT || '5432'),
});

const app = express();
app.use(cors());
app.use(express.json());

// MCP Protocol version and info
const MCP_VERSION = '1.0.0';
const MCP_TOOLS = {
  retail_price_trends: {
    name: 'retail_price_trends',
    description: 'Analyze price trends for products across competitors',
    parameters: {
      type: 'object',
      properties: {
        product_id: { type: 'string', description: 'UUID of the product to analyze' },
        timeframe: { type: 'string', enum: ['7d', '30d', '90d', '1y'], description: 'Time period for analysis' },
        competitor_ids: { type: 'array', items: { type: 'string' }, description: 'List of competitor UUIDs to include' }
      },
      required: ['product_id', 'timeframe']
    }
  },
  competitor_analysis: {
    name: 'competitor_analysis',
    description: 'Generate comprehensive competitor analysis report',
    parameters: {
      type: 'object',
      properties: {
        competitor_ids: { type: 'array', items: { type: 'string' }, description: 'List of competitor UUIDs to analyze' },
        categories: { type: 'array', items: { type: 'string' }, description: 'Product categories to include' },
        metrics: { type: 'array', items: { type: 'string', enum: ['pricing', 'promotions', 'inventory', 'trends'] } }
      },
      required: ['competitor_ids', 'metrics']
    }
  },
  google_shopping_search: {
    name: 'google_shopping_search',
    description: 'Search Google Shopping for product information',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        country: { type: 'string', description: 'Country code for search results' },
        max_results: { type: 'number', description: 'Maximum number of results to return' }
      },
      required: ['query']
    }
  }
};

// MCP Protocol routes
app.get('/api/v1/info', (req, res) => {
  res.json({
    version: MCP_VERSION,
    tools: MCP_TOOLS,
    capabilities: {
      batch_operations: true,
      real_time_updates: true,
      data_export: true
    }
  });
});

// Tool implementation routes
const toolsRouter = Router();

// Price Trends Analysis
toolsRouter.post('/retail_price_trends', async (req, res) => {
  try {
    const { product_id, timeframe, competitor_ids } = req.body;
    
    let timeframeClause;
    switch (timeframe) {
      case '7d':
        timeframeClause = "interval '7 days'";
        break;
      case '30d':
        timeframeClause = "interval '30 days'";
        break;
      case '90d':
        timeframeClause = "interval '90 days'";
        break;
      case '1y':
        timeframeClause = "interval '1 year'";
        break;
      default:
        throw new Error('Invalid timeframe');
    }

    const query = `
      WITH daily_prices AS (
        SELECT 
          date_trunc('day', ph.timestamp) as date,
          p.name as product_name,
          c.name as competitor_name,
          ph.price,
          ph.currency,
          first_value(ph.price) OVER (
            PARTITION BY date_trunc('day', ph.timestamp), p.id, c.id 
            ORDER BY ph.timestamp DESC
          ) as daily_price
        FROM price_history ph
        JOIN products p ON p.id = ph.product_id
        JOIN competitors c ON c.id = p.competitor_id
        WHERE p.id = $1
        AND ph.timestamp >= NOW() - ${timeframeClause}
        ${competitor_ids ? 'AND c.id = ANY($2)' : ''}
      )
      SELECT 
        date,
        competitor_name,
        daily_price,
        currency,
        avg(daily_price) OVER (
          PARTITION BY competitor_name 
          ORDER BY date 
          ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
        ) as moving_average
      FROM daily_prices
      GROUP BY date, competitor_name, daily_price, currency
      ORDER BY date, competitor_name;
    `;

    const result = await pool.query(query, competitor_ids ? [product_id, competitor_ids] : [product_id]);
    
    res.json({
      success: true,
      data: result.rows,
      metadata: {
        timeframe,
        product_id,
        analysis_timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Competitor Analysis
toolsRouter.post('/competitor_analysis', async (req, res) => {
  try {
    const { competitor_ids, categories, metrics } = req.body;

    const analysisPromises = metrics.map(async (metric) => {
      let query;
      switch (metric) {
        case 'pricing':
          query = `
            WITH competitor_stats AS (
              SELECT 
                c.name as competitor_name,
                p.category,
                COUNT(DISTINCT p.id) as product_count,
                AVG(ph.price) as avg_price,
                MIN(ph.price) as min_price,
                MAX(ph.price) as max_price
              FROM competitors c
              JOIN products p ON p.competitor_id = c.id
              JOIN price_history ph ON ph.product_id = p.id
              WHERE c.id = ANY($1)
              ${categories ? 'AND p.category = ANY($2)' : ''}
              AND ph.timestamp >= NOW() - interval '30 days'
              GROUP BY c.name, p.category
            )
            SELECT * FROM competitor_stats
          `;
          break;

        case 'promotions':
          query = `
            SELECT 
              c.name as competitor_name,
              COUNT(pr.id) as promotion_count,
              AVG(pr.discount_percentage) as avg_discount,
              STRING_AGG(DISTINCT pr.type, ', ') as promotion_types
            FROM competitors c
            JOIN products p ON p.competitor_id = c.id
            JOIN promotions pr ON pr.product_id = p.id
            WHERE c.id = ANY($1)
            ${categories ? 'AND p.category = ANY($2)' : ''}
            AND pr.end_date >= NOW()
            GROUP BY c.name
          `;
          break;

        case 'trends':
          query = `
            SELECT 
              c.name as competitor_name,
              mt.trend_type,
              mt.trend_data,
              mt.confidence_score
            FROM competitors c
            JOIN products p ON p.competitor_id = c.id
            JOIN market_trends mt ON mt.category = p.category
            WHERE c.id = ANY($1)
            ${categories ? 'AND p.category = ANY($2)' : ''}
            AND mt.end_date >= NOW()
          `;
          break;
      }

      const result = await pool.query(query, categories ? [competitor_ids, categories] : [competitor_ids]);
      return { metric, data: result.rows };
    });

    const analysisResults = await Promise.all(analysisPromises);
    
    res.json({
      success: true,
      data: analysisResults.reduce((acc, { metric, data }) => ({ ...acc, [metric]: data }), {}),
      metadata: {
        competitor_ids,
        categories,
        analysis_timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Google Shopping Search
toolsRouter.post('/google_shopping_search', async (req, res) => {
  try {
    const { query, country = 'US', max_results = 10 } = req.body;
    
    // Note: This is a placeholder for Google Shopping API integration
    // You'll need to implement the actual API call using your preferred method
    // (e.g., Serp API, Google Shopping API, or custom scraping solution)
    
    res.json({
      success: true,
      message: 'Google Shopping integration to be implemented',
      parameters: { query, country, max_results }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.use('/api/v1/tools', toolsRouter);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

const PORT = process.env.MCP_PORT || 3001;
app.listen(PORT, () => {
  console.log(`MCP Server running on port ${PORT}`);
}); 