# Smart Retail REST API

A comprehensive FastAPI-based REST API for the Smart Retail Management System, providing full functionality for price monitoring, competitor analysis, alerts, and market insights.

## 🚀 Features

- **Complete REST API** with interactive Swagger documentation
- **Price Management**: Track and analyze pricing data
- **Competitor Intelligence**: Monitor competitor pricing and strategies
- **Alert System**: Manage notifications and alerts with filtering
- **Market Insights**: AI-powered business intelligence and recommendations
- **Product Management**: Full CRUD operations for products
- **Analytics**: Dashboard metrics and trend analysis
- **Real-time Data**: WebSocket support for live updates
- **Production Ready**: Docker containerization, rate limiting, security headers

## 📋 API Endpoints

### Core Resources

#### Products
- `GET /products` - List all products with filtering and pagination
- `GET /products/{id}` - Get specific product
- `POST /products` - Create new product
- `PUT /products/{id}` - Update product
- `DELETE /products/{id}` - Delete product

#### Price Analysis
- `GET /products/{id}/price-analysis` - Comprehensive price analysis
- `GET /price-history` - Historical price data with filtering
- `GET /insights/price-recommendations/{id}` - AI-powered price recommendations

#### Competitors
- `GET /competitors` - List competitors
- `GET /competitors/{id}` - Get specific competitor
- `POST /competitors` - Add new competitor
- `GET /competitors/{id}/prices` - Competitor price data

#### Alerts
- `GET /alerts` - List alerts with filtering options
- `POST /alerts` - Create new alert
- `PUT /alerts/{id}/read` - Mark alert as read
- `PUT /alerts/{id}/resolve` - Resolve alert

#### Market Insights
- `GET /insights` - Get market insights and recommendations
- `GET /insights/price-recommendations/{id}` - Product-specific price recommendations

#### Analytics
- `GET /analytics/dashboard` - Key dashboard metrics
- `GET /analytics/trends` - Trend analysis data

## 🔧 Installation & Setup

### Local Development

1. **Clone and navigate to the API directory:**
   ```bash
   cd backend/api
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set environment variables:**
   ```bash
   export DATABASE_URL="postgresql://user:password@localhost/smart_retail"
   export REDIS_URL="redis://localhost:6379"
   export SECRET_KEY="your-secret-key"
   ```

4. **Run the development server:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8001
   ```

5. **Access API documentation:**
   - Swagger UI: http://localhost:8001/docs
   - ReDoc: http://localhost:8001/redoc
   - OpenAPI JSON: http://localhost:8001/openapi.json

### Docker Deployment

1. **Using Docker Compose (Recommended):**
   ```bash
   cd backend
   docker-compose up -d
   ```

2. **Individual container:**
   ```bash
   cd backend/api
   docker build -t smart-retail-api .
   docker run -p 8001:8001 smart-retail-api
   ```

## 🏗️ Architecture

### Technology Stack
- **FastAPI**: Modern, fast Python web framework
- **Pydantic**: Data validation and settings management
- **SQLAlchemy**: SQL toolkit and ORM
- **PostgreSQL**: Primary database
- **Redis**: Caching and background jobs
- **Celery**: Distributed task queue
- **Docker**: Containerization
- **Nginx**: Reverse proxy and load balancing

### API Design Principles
- **RESTful**: Follows REST conventions
- **Consistent**: Standardized response formats
- **Documented**: Comprehensive Swagger documentation
- **Validated**: Request/response validation with Pydantic
- **Secure**: Authentication, rate limiting, CORS handling
- **Performant**: Async/await, database optimization, caching

## 📊 API Response Formats

### Success Response
```json
{
  "id": "prod_1",
  "name": "iPhone 15 Pro",
  "price": 999.99,
  "category": "Electronics",
  "stock": 50
}
```

### Error Response
```json
{
  "detail": "Product not found"
}
```

### List Response with Pagination
```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "per_page": 10,
  "pages": 10
}
```

## 🔐 Authentication & Security

### Features Implemented
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Request throttling
- **Security Headers**: XSS protection, content sniffing prevention
- **Input Validation**: Pydantic models for request validation
- **Error Handling**: Standardized error responses

### Future Enhancements
- JWT authentication
- Role-based access control (RBAC)
- API key management
- OAuth2 integration

## 📈 Monitoring & Health Checks

### Health Endpoint
```bash
GET /health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.0"
}
```

### Monitoring Integration
- **Prometheus**: Metrics collection
- **Grafana**: Visualization dashboards
- **Sentry**: Error tracking
- **Health checks**: Docker health checks included

## 🧪 Testing

### Running Tests
```bash
# Unit tests
pytest tests/

# Integration tests
pytest tests/integration/

# Load testing
locust -f tests/load_test.py
```

### Test Coverage
```bash
pytest --cov=main --cov-report=html
```

## 🚀 Deployment

### Production Deployment

1. **Environment Configuration:**
   ```bash
   # Create .env file
   DATABASE_URL=postgresql://user:password@db/smart_retail
   REDIS_URL=redis://redis:6379
   SECRET_KEY=your-production-secret-key
   ENVIRONMENT=production
   ```

2. **Deploy with Docker Compose:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Scale services:**
   ```bash
   docker-compose up -d --scale api=3
   ```

### Performance Optimization
- **Database**: Connection pooling, query optimization
- **Caching**: Redis for frequently accessed data
- **CDN**: Static asset delivery
- **Load Balancing**: Nginx upstream configuration

## 📝 API Usage Examples

### Create Product
```bash
curl -X POST "http://localhost:8001/products" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Product",
    "sku": "NP001",
    "price": 99.99,
    "category": "Electronics",
    "stock": 100
  }'
```

### Get Price Analysis
```bash
curl "http://localhost:8001/products/prod_1/price-analysis?timeframe=daily"
```

### Create Alert
```bash
curl -X POST "http://localhost:8001/alerts" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "price_drop",
    "priority": "high",
    "title": "Price Alert",
    "message": "Product price dropped below threshold",
    "product_id": "prod_1",
    "threshold_value": 900.0
  }'
```

### Get Market Insights
```bash
curl "http://localhost:8001/insights?insight_type=pricing&min_confidence=0.8"
```

## 🔄 Background Tasks

### Celery Workers
- **Price Scraping**: Automated competitor price monitoring
- **Alert Processing**: Real-time alert generation
- **Analytics**: Batch processing for insights generation
- **Data Cleanup**: Periodic maintenance tasks

### Scheduled Tasks
- **Hourly**: Price updates, alert checks
- **Daily**: Analytics reports, data aggregation
- **Weekly**: Market trend analysis
- **Monthly**: Performance reports

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

- **Documentation**: http://localhost:8001/docs
- **Issues**: GitHub Issues
- **Email**: api@smartretail.com

## 📄 License

MIT License - see LICENSE file for details 