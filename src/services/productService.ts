const API_BASE_URL = 'http://localhost:8001';

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  category: string;
  description?: string;
  stock: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProductCreate {
  name: string;
  sku: string;
  price: number;
  category: string;
  description?: string;
  stock: number;
}

export interface ProductUpdate {
  name?: string;
  price?: number;
  category?: string;
  description?: string;
  stock?: number;
}

class ProductService {
  private mockProducts: Product[] = [
    {
      id: '1',
      name: 'iPhone 15 Pro',
      sku: 'IPH15P-128',
      price: 999.99,
      category: 'Electronics',
      description: 'Latest iPhone with Pro features',
      stock: 25,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Samsung Galaxy S24',
      sku: 'SGS24-256',
      price: 899.99,
      category: 'Electronics',
      description: 'Premium Android smartphone',
      stock: 15,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      name: 'Apple Watch Series 9',
      sku: 'AW9-45MM',
      price: 399.99,
      category: 'Wearables',
      description: 'Advanced smartwatch with health features',
      stock: 8,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '4',
      name: 'Nike Air Max 270',
      sku: 'NAM270-10',
      price: 150.00,
      category: 'Clothing',
      description: 'Comfortable running shoes',
      stock: 0,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '5',
      name: 'MacBook Pro 14"',
      sku: 'MBP14-M3',
      price: 1999.99,
      category: 'Electronics',
      description: 'Professional laptop with M3 chip',
      stock: 12,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ];

  async getAllProducts(params?: {
    skip?: number;
    limit?: number;
    category?: string;
  }): Promise<Product[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.skip) queryParams.append('skip', params.skip.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.category) queryParams.append('category', params.category);

      const url = `${API_BASE_URL}/products${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching products, using mock data:', error);
      // Filter mock products based on category if specified
      let filteredProducts = [...this.mockProducts];
      if (params?.category && params.category !== 'All') {
        filteredProducts = filteredProducts.filter(p => p.category === params.category);
      }
      return filteredProducts;
    }
  }

  async getProduct(id: string): Promise<Product | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Failed to fetch product: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching product, using mock data:', error);
      // Find product in mock data
      return this.mockProducts.find(p => p.id === id) || null;
    }
  }

  async createProduct(product: ProductCreate): Promise<Product | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create product: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating product, using mock data:', error);
      // Create a new product with mock data
      const newProduct: Product = {
        id: (this.mockProducts.length + 1).toString(),
        name: product.name,
        sku: product.sku,
        price: product.price,
        category: product.category,
        description: product.description,
        stock: product.stock,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Add to mock products array
      this.mockProducts.push(newProduct);
      return newProduct;
    }
  }

  async updateProduct(id: string, product: ProductUpdate): Promise<Product | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update product: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating product:', error);
      return null;
    }
  }

  async deleteProduct(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete product: ${response.statusText}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  }

  async getPriceAnalysis(id: string, timeframe: 'hourly' | 'daily' | 'weekly' | 'monthly' = 'daily') {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}/price-analysis?timeframe=${timeframe}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch price analysis: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching price analysis:', error);
      return null;
    }
  }

  // Transform API product to frontend format
  transformProduct(apiProduct: Product) {
    // Generate consistent mock sales data based on product ID
    const generateConsistentSales = (id: string): number => {
      let hash = 0;
      for (let i = 0; i < id.length; i++) {
        const char = id.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return Math.abs(hash) % 500;
    };

    return {
      id: apiProduct.id,
      name: apiProduct.name,
      sku: apiProduct.sku,
      category: apiProduct.category,
      price: apiProduct.price,
      stock: apiProduct.stock,
      status: this.getProductStatus(apiProduct.stock),
      description: apiProduct.description || '',
      lastUpdated: apiProduct.updated_at ? new Date(apiProduct.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      sales: generateConsistentSales(apiProduct.id)
    };
  }

  private getProductStatus(stock: number): 'active' | 'inactive' | 'low_stock' {
    if (stock === 0) return 'inactive';
    if (stock <= 10) return 'low_stock';
    return 'active';
  }
}

export const productService = new ProductService(); 