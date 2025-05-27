"""
Smart Retail REST API
Comprehensive FastAPI backend with Swagger documentation
"""

from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, Depends, Query, Body, Path
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import logging
from enum import Enum

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app with metadata for Swagger
app = FastAPI(
    title="Smart Retail API",
    description="""
    ## Smart Retail Management System API
    
    This API provides comprehensive functionality for:
    * **Price Management**: Track and analyze pricing data
    * **Competitor Intelligence**: Monitor competitor pricing and strategies
    * **Alert System**: Manage notifications and alerts
    * **Market Insights**: Generate business intelligence reports
    * **Product Management**: CRUD operations for products
    * **Customer Analytics**: Customer behavior and segmentation
    
    ### Features:
    - Real-time price monitoring
    - Competitor analysis
    - Automated alerting
    - Market trend analysis
    - Interactive API documentation
    """,
    version="1.0.0",
    contact={
        "name": "Smart Retail Team",
        "email": "api@smartretail.com",
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enums
class AlertType(str, Enum):
    PRICE_DROP = "price_drop"
    STOCK_LOW = "stock_low"
    COMPETITOR_PRICE = "competitor_price"
    MARKET_TREND = "market_trend"

class AlertPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class TimeFrame(str, Enum):
    HOURLY = "hourly"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"

# Pydantic Models
class Product(BaseModel):
    id: Optional[str] = None
    name: str = Field(..., description="Product name")
    sku: str = Field(..., description="Stock Keeping Unit")
    price: float = Field(..., gt=0, description="Current price")
    category: str = Field(..., description="Product category")
    description: Optional[str] = None
    stock: int = Field(..., ge=0, description="Current stock level")
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class ProductCreate(BaseModel):
    name: str
    sku: str
    price: float = Field(..., gt=0)
    category: str
    description: Optional[str] = None
    stock: int = Field(..., ge=0)

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    category: Optional[str] = None
    description: Optional[str] = None
    stock: Optional[int] = Field(None, ge=0)

class PriceHistory(BaseModel):
    id: Optional[str] = None
    product_id: str
    competitor_id: Optional[str] = None
    price: float
    timestamp: datetime
    source: str = Field(..., description="Data source (internal, competitor, etc.)")

class Competitor(BaseModel):
    id: Optional[str] = None
    name: str = Field(..., description="Competitor name")
    website: Optional[str] = None
    description: Optional[str] = None
    active: bool = True
    created_at: Optional[datetime] = None

class CompetitorCreate(BaseModel):
    name: str
    website: Optional[str] = None
    description: Optional[str] = None
    active: bool = True

class Alert(BaseModel):
    id: Optional[str] = None
    type: AlertType
    priority: AlertPriority
    title: str
    message: str
    product_id: Optional[str] = None
    competitor_id: Optional[str] = None
    threshold_value: Optional[float] = None
    current_value: Optional[float] = None
    is_read: bool = False
    is_resolved: bool = False
    created_at: Optional[datetime] = None

class AlertCreate(BaseModel):
    type: AlertType
    priority: AlertPriority
    title: str
    message: str
    product_id: Optional[str] = None
    competitor_id: Optional[str] = None
    threshold_value: Optional[float] = None

class MarketInsight(BaseModel):
    id: Optional[str] = None
    title: str
    description: str
    insight_type: str
    confidence_score: float = Field(..., ge=0, le=1)
    impact_level: str
    recommended_actions: List[str]
    data_points: Dict[str, Any]
    created_at: Optional[datetime] = None

class PriceAnalysis(BaseModel):
    product_id: str
    current_price: float
    avg_price: float
    min_price: float
    max_price: float
    price_trend: str
    competitor_prices: List[Dict[str, Any]]
    price_change_24h: float
    price_change_7d: float
    price_change_30d: float

# Mock data for demonstration
MOCK_PRODUCTS = [
    Product(
        id="prod_1",
        name="iPhone 15 Pro",
        sku="IPH15PRO128",
        price=999.99,
        category="Electronics",
        description="Latest iPhone with Pro features",
        stock=50,
        created_at=datetime.now() - timedelta(days=30),
        updated_at=datetime.now()
    ),
    Product(
        id="prod_2",
        name="Samsung Galaxy S24",
        sku="SGS24256",
        price=899.99,
        category="Electronics",
        description="Samsung flagship smartphone",
        stock=35,
        created_at=datetime.now() - timedelta(days=25),
        updated_at=datetime.now()
    ),
]

MOCK_COMPETITORS = [
    Competitor(
        id="comp_1",
        name="Amazon",
        website="https://amazon.com",
        description="Major e-commerce platform",
        active=True,
        created_at=datetime.now() - timedelta(days=60)
    ),
    Competitor(
        id="comp_2",
        name="Best Buy",
        website="https://bestbuy.com",
        description="Electronics retailer",
        active=True,
        created_at=datetime.now() - timedelta(days=45)
    ),
]

MOCK_ALERTS = [
    Alert(
        id="alert_1",
        type=AlertType.PRICE_DROP,
        priority=AlertPriority.HIGH,
        title="Competitor Price Drop",
        message="Amazon dropped iPhone 15 Pro price by 5%",
        product_id="prod_1",
        competitor_id="comp_1",
        threshold_value=950.0,
        current_value=949.99,
        created_at=datetime.now() - timedelta(hours=2)
    ),
]

# API Endpoints

@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Welcome to Smart Retail API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now(),
        "version": "1.0.0"
    }

# Product Management Endpoints
@app.get("/products", response_model=List[Product], tags=["Products"])
async def get_products(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of records to return"),
    category: Optional[str] = Query(None, description="Filter by category")
):
    """Get all products with optional filtering and pagination"""
    products = MOCK_PRODUCTS
    if category:
        products = [p for p in products if p.category.lower() == category.lower()]
    
    return products[skip:skip + limit]

@app.get("/products/{product_id}", response_model=Product, tags=["Products"])
async def get_product(product_id: str = Path(..., description="Product ID")):
    """Get a specific product by ID"""
    product = next((p for p in MOCK_PRODUCTS if p.id == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.post("/products", response_model=Product, tags=["Products"])
async def create_product(product: ProductCreate):
    """Create a new product"""
    new_product = Product(
        id=f"prod_{len(MOCK_PRODUCTS) + 1}",
        **product.dict(),
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    MOCK_PRODUCTS.append(new_product)
    return new_product

@app.put("/products/{product_id}", response_model=Product, tags=["Products"])
async def update_product(
    product_id: str = Path(..., description="Product ID"),
    product_update: ProductUpdate = Body(...)
):
    """Update an existing product"""
    product = next((p for p in MOCK_PRODUCTS if p.id == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = product_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)
    product.updated_at = datetime.now()
    
    return product

@app.delete("/products/{product_id}", tags=["Products"])
async def delete_product(product_id: str = Path(..., description="Product ID")):
    """Delete a product"""
    global MOCK_PRODUCTS
    MOCK_PRODUCTS = [p for p in MOCK_PRODUCTS if p.id != product_id]
    return {"message": "Product deleted successfully"}

# Price Analysis Endpoints
@app.get("/products/{product_id}/price-analysis", response_model=PriceAnalysis, tags=["Price Analysis"])
async def get_price_analysis(
    product_id: str = Path(..., description="Product ID"),
    timeframe: TimeFrame = Query(TimeFrame.DAILY, description="Analysis timeframe")
):
    """Get comprehensive price analysis for a product"""
    product = next((p for p in MOCK_PRODUCTS if p.id == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Mock price analysis data
    return PriceAnalysis(
        product_id=product_id,
        current_price=product.price,
        avg_price=product.price * 0.98,
        min_price=product.price * 0.85,
        max_price=product.price * 1.15,
        price_trend="stable",
        competitor_prices=[
            {"competitor": "Amazon", "price": product.price * 0.95},
            {"competitor": "Best Buy", "price": product.price * 1.02}
        ],
        price_change_24h=-2.5,
        price_change_7d=1.2,
        price_change_30d=-0.8
    )

@app.get("/price-history", response_model=List[PriceHistory], tags=["Price Analysis"])
async def get_price_history(
    product_id: Optional[str] = Query(None, description="Filter by product ID"),
    competitor_id: Optional[str] = Query(None, description="Filter by competitor ID"),
    start_date: Optional[datetime] = Query(None, description="Start date for history"),
    end_date: Optional[datetime] = Query(None, description="End date for history"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records")
):
    """Get price history data with filtering options"""
    # Mock price history data
    history = []
    base_time = datetime.now() - timedelta(days=30)
    
    for i in range(min(limit, 30)):
        history.append(PriceHistory(
            id=f"price_{i}",
            product_id=product_id or "prod_1",
            competitor_id=competitor_id,
            price=999.99 + (i * 0.5) - (i % 3),
            timestamp=base_time + timedelta(days=i),
            source="internal" if not competitor_id else "competitor"
        ))
    
    return history

# Competitor Management Endpoints
@app.get("/competitors", response_model=List[Competitor], tags=["Competitors"])
async def get_competitors(
    active_only: bool = Query(True, description="Filter by active status"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of records")
):
    """Get all competitors"""
    competitors = MOCK_COMPETITORS
    if active_only:
        competitors = [c for c in competitors if c.active]
    return competitors[:limit]

@app.get("/competitors/{competitor_id}", response_model=Competitor, tags=["Competitors"])
async def get_competitor(competitor_id: str = Path(..., description="Competitor ID")):
    """Get a specific competitor by ID"""
    competitor = next((c for c in MOCK_COMPETITORS if c.id == competitor_id), None)
    if not competitor:
        raise HTTPException(status_code=404, detail="Competitor not found")
    return competitor

@app.post("/competitors", response_model=Competitor, tags=["Competitors"])
async def create_competitor(competitor: CompetitorCreate):
    """Create a new competitor"""
    new_competitor = Competitor(
        id=f"comp_{len(MOCK_COMPETITORS) + 1}",
        **competitor.dict(),
        created_at=datetime.now()
    )
    MOCK_COMPETITORS.append(new_competitor)
    return new_competitor

@app.get("/competitors/{competitor_id}/prices", response_model=List[PriceHistory], tags=["Competitors"])
async def get_competitor_prices(
    competitor_id: str = Path(..., description="Competitor ID"),
    product_id: Optional[str] = Query(None, description="Filter by product ID"),
    limit: int = Query(50, ge=1, le=500, description="Maximum number of records")
):
    """Get price data for a specific competitor"""
    # Mock competitor price data
    prices = []
    base_time = datetime.now() - timedelta(days=7)
    
    for i in range(min(limit, 7)):
        prices.append(PriceHistory(
            id=f"comp_price_{i}",
            product_id=product_id or "prod_1",
            competitor_id=competitor_id,
            price=950.0 + (i * 2.5),
            timestamp=base_time + timedelta(days=i),
            source="competitor"
        ))
    
    return prices

# Alert Management Endpoints
@app.get("/alerts", response_model=List[Alert], tags=["Alerts"])
async def get_alerts(
    unread_only: bool = Query(False, description="Show only unread alerts"),
    priority: Optional[AlertPriority] = Query(None, description="Filter by priority"),
    alert_type: Optional[AlertType] = Query(None, description="Filter by alert type"),
    limit: int = Query(50, ge=1, le=500, description="Maximum number of records")
):
    """Get all alerts with filtering options"""
    alerts = MOCK_ALERTS
    
    if unread_only:
        alerts = [a for a in alerts if not a.is_read]
    if priority:
        alerts = [a for a in alerts if a.priority == priority]
    if alert_type:
        alerts = [a for a in alerts if a.type == alert_type]
    
    return alerts[:limit]

@app.post("/alerts", response_model=Alert, tags=["Alerts"])
async def create_alert(alert: AlertCreate):
    """Create a new alert"""
    new_alert = Alert(
        id=f"alert_{len(MOCK_ALERTS) + 1}",
        **alert.dict(),
        created_at=datetime.now()
    )
    MOCK_ALERTS.append(new_alert)
    return new_alert

@app.put("/alerts/{alert_id}/read", tags=["Alerts"])
async def mark_alert_read(alert_id: str = Path(..., description="Alert ID")):
    """Mark an alert as read"""
    alert = next((a for a in MOCK_ALERTS if a.id == alert_id), None)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.is_read = True
    return {"message": "Alert marked as read"}

@app.put("/alerts/{alert_id}/resolve", tags=["Alerts"])
async def resolve_alert(alert_id: str = Path(..., description="Alert ID")):
    """Mark an alert as resolved"""
    alert = next((a for a in MOCK_ALERTS if a.id == alert_id), None)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.is_resolved = True
    alert.is_read = True
    return {"message": "Alert resolved"}

# Market Insights Endpoints
@app.get("/insights", response_model=List[MarketInsight], tags=["Market Insights"])
async def get_market_insights(
    insight_type: Optional[str] = Query(None, description="Filter by insight type"),
    min_confidence: float = Query(0.0, ge=0, le=1, description="Minimum confidence score"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of insights")
):
    """Get market insights and recommendations"""
    # Mock market insights
    insights = [
        MarketInsight(
            id="insight_1",
            title="Price Optimization Opportunity",
            description="Analysis suggests 5-8% price increase opportunity for Electronics category",
            insight_type="pricing",
            confidence_score=0.85,
            impact_level="high",
            recommended_actions=[
                "Test 5% price increase on select products",
                "Monitor competitor response",
                "Track conversion rates"
            ],
            data_points={
                "avg_competitor_price": 1050.0,
                "our_price": 999.99,
                "demand_elasticity": -0.3
            },
            created_at=datetime.now() - timedelta(hours=6)
        ),
        MarketInsight(
            id="insight_2",
            title="Inventory Optimization Alert",
            description="Stock levels for top-selling items running low",
            insight_type="inventory",
            confidence_score=0.95,
            impact_level="medium",
            recommended_actions=[
                "Reorder top 5 products within 48 hours",
                "Adjust safety stock levels",
                "Review supplier lead times"
            ],
            data_points={
                "low_stock_products": 3,
                "days_until_stockout": 7,
                "potential_lost_revenue": 15000
            },
            created_at=datetime.now() - timedelta(hours=2)
        )
    ]
    
    filtered_insights = insights
    if insight_type:
        filtered_insights = [i for i in insights if i.insight_type == insight_type]
    if min_confidence > 0:
        filtered_insights = [i for i in filtered_insights if i.confidence_score >= min_confidence]
    
    return filtered_insights[:limit]

@app.get("/insights/price-recommendations/{product_id}", tags=["Market Insights"])
async def get_price_recommendations(
    product_id: str = Path(..., description="Product ID"),
    confidence_threshold: float = Query(0.7, ge=0, le=1, description="Minimum confidence for recommendations")
):
    """Get AI-powered price recommendations for a specific product"""
    product = next((p for p in MOCK_PRODUCTS if p.id == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Mock price recommendations
    return {
        "product_id": product_id,
        "current_price": product.price,
        "recommendations": [
            {
                "strategy": "competitive_pricing",
                "suggested_price": product.price * 0.98,
                "confidence": 0.82,
                "expected_impact": {
                    "revenue_change": "+3.2%",
                    "volume_change": "+8.1%",
                    "margin_change": "-1.8%"
                },
                "reasoning": "Slight price reduction to match closest competitor"
            },
            {
                "strategy": "premium_positioning",
                "suggested_price": product.price * 1.05,
                "confidence": 0.75,
                "expected_impact": {
                    "revenue_change": "+4.1%",
                    "volume_change": "-2.3%",
                    "margin_change": "+6.8%"
                },
                "reasoning": "Premium pricing based on brand strength and unique features"
            }
        ],
        "market_analysis": {
            "avg_competitor_price": product.price * 1.02,
            "price_elasticity": -0.3,
            "market_position": "competitive"
        }
    }

# Analytics and Reporting Endpoints
@app.get("/analytics/dashboard", tags=["Analytics"])
async def get_dashboard_analytics():
    """Get key metrics for dashboard"""
    return {
        "total_products": len(MOCK_PRODUCTS),
        "total_competitors": len(MOCK_COMPETITORS),
        "active_alerts": len([a for a in MOCK_ALERTS if not a.is_resolved]),
        "revenue_today": 25750.50,
        "revenue_change": "+12.3%",
        "top_products": [
            {"name": "iPhone 15 Pro", "revenue": 15000, "units": 15},
            {"name": "Samsung Galaxy S24", "revenue": 8999, "units": 10}
        ],
        "price_alerts": len([a for a in MOCK_ALERTS if a.type == AlertType.COMPETITOR_PRICE]),
        "avg_margin": 23.5,
        "competitor_activity": 3
    }

@app.get("/analytics/trends", tags=["Analytics"])
async def get_trend_analytics(
    timeframe: TimeFrame = Query(TimeFrame.DAILY, description="Analysis timeframe"),
    metric: str = Query("revenue", description="Metric to analyze (revenue, volume, margin)")
):
    """Get trend analysis data"""
    # Mock trend data
    dates = [(datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(30, 0, -1)]
    values = [1000 + (i * 50) + (i % 7 * 100) for i in range(30)]
    
    return {
        "metric": metric,
        "timeframe": timeframe,
        "data": [{"date": date, "value": value} for date, value in zip(dates, values)],
        "summary": {
            "total": sum(values),
            "average": sum(values) / len(values),
            "trend": "increasing",
            "change_percent": 15.3
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001) 