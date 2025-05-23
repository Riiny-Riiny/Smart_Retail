-- Enable UUID extension for unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create competitors table
CREATE TABLE competitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    brand VARCHAR(255),
    category VARCHAR(255),
    url TEXT NOT NULL,
    image_url TEXT,
    competitor_id UUID REFERENCES competitors(id),
    sku VARCHAR(255),
    specifications JSONB,
    metadata JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(competitor_id, sku)
);

-- Create price_history table with time-series optimization
CREATE TABLE price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id),
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    is_sale BOOLEAN DEFAULT false,
    original_price DECIMAL(10,2),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Create promotions table
CREATE TABLE promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id),
    type VARCHAR(50) NOT NULL,
    description TEXT,
    discount_amount DECIMAL(10,2),
    discount_percentage DECIMAL(5,2),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create ai_insights table
CREATE TABLE ai_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id),
    insight_type VARCHAR(50) NOT NULL,
    insight_text TEXT NOT NULL,
    confidence_score DECIMAL(3,2),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP WITH TIME ZONE
);

-- Create market_trends table
CREATE TABLE market_trends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(255),
    trend_type VARCHAR(50) NOT NULL,
    trend_data JSONB NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    confidence_score DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_competitor ON products(competitor_id);
CREATE INDEX idx_price_history_product_timestamp ON price_history(product_id, timestamp DESC);
CREATE INDEX idx_price_history_timestamp ON price_history(timestamp DESC);
CREATE INDEX idx_promotions_product_dates ON promotions(product_id, start_date, end_date);
CREATE INDEX idx_ai_insights_product_type ON ai_insights(product_id, insight_type);
CREATE INDEX idx_ai_insights_valid_until ON ai_insights(valid_until);
CREATE INDEX idx_market_trends_category_dates ON market_trends(category, start_date, end_date);

-- Add hypertable for time-series optimization (requires TimescaleDB extension)
-- Uncomment if using TimescaleDB
-- SELECT create_hypertable('price_history', 'timestamp');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to update updated_at
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competitors_updated_at
    BEFORE UPDATE ON competitors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add helpful views
CREATE VIEW product_latest_prices AS
SELECT DISTINCT ON (product_id)
    p.id as product_id,
    p.name as product_name,
    p.brand,
    p.category,
    ph.price as current_price,
    ph.currency,
    ph.timestamp as price_updated_at,
    c.name as competitor_name
FROM products p
JOIN price_history ph ON p.id = ph.product_id
JOIN competitors c ON p.competitor_id = c.id
WHERE p.is_active = true
ORDER BY product_id, ph.timestamp DESC;

CREATE VIEW product_price_analytics AS
SELECT 
    p.id as product_id,
    p.name as product_name,
    p.category,
    MIN(ph.price) as min_price,
    MAX(ph.price) as max_price,
    AVG(ph.price) as avg_price,
    COUNT(DISTINCT ph.price) as price_changes_count,
    COUNT(pr.id) as promotion_count
FROM products p
JOIN price_history ph ON p.id = ph.product_id
LEFT JOIN promotions pr ON p.id = pr.product_id
WHERE p.is_active = true
AND ph.timestamp >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY p.id, p.name, p.category; 