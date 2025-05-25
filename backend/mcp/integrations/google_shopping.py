from typing import Dict, List, Optional
import aiohttp
import asyncio
import json
import logging
from datetime import datetime
from pydantic import BaseModel

logger = logging.getLogger(__name__)

class GoogleShoppingConfig(BaseModel):
    api_key: str
    cx: str  # Custom Search Engine ID
    country: str = "US"
    language: str = "en"

class ProductSearchResult(BaseModel):
    title: str
    link: str
    price: float
    currency: str
    seller: str
    condition: str = "new"
    availability: str
    timestamp: datetime = datetime.utcnow()

class GoogleShoppingAPI:
    BASE_URL = "https://www.googleapis.com/customsearch/v1"
    
    def __init__(self, config: GoogleShoppingConfig):
        self.config = config
        self.session = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def search_products(
        self,
        query: str,
        max_results: int = 10,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None
    ) -> List[ProductSearchResult]:
        """
        Search for products using Google Shopping API
        
        Args:
            query: Search query string
            max_results: Maximum number of results to return
            min_price: Minimum price filter
            max_price: Maximum price filter
            
        Returns:
            List of ProductSearchResult objects
        """
        try:
            params = {
                "key": self.config.api_key,
                "cx": self.config.cx,
                "q": f"{query} site:shopping.google.com",
                "num": min(max_results, 10),  # API limit is 10 per request
                "gl": self.config.country,
                "hl": self.config.language,
            }
            
            if min_price is not None:
                params["lowPrice"] = min_price
            if max_price is not None:
                params["highPrice"] = max_price
            
            async with self.session.get(self.BASE_URL, params=params) as response:
                if response.status != 200:
                    logger.error(f"Google Shopping API error: {response.status}")
                    return []
                
                data = await response.json()
                return self._parse_search_results(data)
                
        except Exception as e:
            logger.error(f"Error in Google Shopping search: {str(e)}")
            return []
    
    def _parse_search_results(self, data: Dict) -> List[ProductSearchResult]:
        """Parse Google Shopping API response into ProductSearchResult objects"""
        results = []
        
        for item in data.get("items", []):
            try:
                # Extract price from snippet using regex or other parsing methods
                price_info = self._extract_price_info(item.get("snippet", ""))
                
                result = ProductSearchResult(
                    title=item.get("title", ""),
                    link=item.get("link", ""),
                    price=price_info["price"],
                    currency=price_info["currency"],
                    seller=self._extract_seller(item),
                    availability=self._extract_availability(item),
                )
                results.append(result)
            except Exception as e:
                logger.warning(f"Error parsing search result: {str(e)}")
                continue
        
        return results
    
    def _extract_price_info(self, snippet: str) -> Dict[str, str]:
        """Extract price and currency from snippet"""
        # Implement price extraction logic
        # This is a placeholder implementation
        return {
            "price": 0.0,
            "currency": "USD"
        }
    
    def _extract_seller(self, item: Dict) -> str:
        """Extract seller information from search result"""
        # Implement seller extraction logic
        return "Unknown Seller"
    
    def _extract_availability(self, item: Dict) -> str:
        """Extract product availability from search result"""
        # Implement availability extraction logic
        return "Unknown"

async def main():
    """Test the Google Shopping API integration"""
    config = GoogleShoppingConfig(
        api_key="YOUR_API_KEY",
        cx="YOUR_CUSTOM_SEARCH_ENGINE_ID"
    )
    
    async with GoogleShoppingAPI(config) as api:
        results = await api.search_products(
            query="smartphone",
            max_results=5,
            min_price=200,
            max_price=1000
        )
        
        for result in results:
            print(f"Found: {result.title} - {result.price} {result.currency}")

if __name__ == "__main__":
    asyncio.run(main()) 