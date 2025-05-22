import { Product } from '@/types/competitor';

const mockProducts: Record<string, Product[]> = {
  'target.com': [
    {
      id: '1',
      name: 'Apple iPhone 15 Pro',
      price: 999.99,
      description: '6.1-inch Super Retina XDR display, A17 Pro chip',
      inStock: true,
      imageUrl: 'https://picsum.photos/200',
      url: 'https://www.target.com/iphone-15-pro',
      lastChecked: new Date().toISOString(),
      competitorId: 'target.com'
    },
    {
      id: '2',
      name: 'Samsung 65" 4K Smart TV',
      price: 799.99,
      description: 'Crystal UHD, HDR, Smart Hub',
      inStock: true,
      imageUrl: 'https://picsum.photos/201',
      url: 'https://www.target.com/samsung-tv',
      lastChecked: new Date().toISOString(),
      competitorId: 'target.com'
    },
    {
      id: '3',
      name: 'Sony PlayStation 5',
      price: 499.99,
      description: 'Next-gen gaming console',
      inStock: false,
      imageUrl: 'https://picsum.photos/202',
      url: 'https://www.target.com/ps5',
      lastChecked: new Date().toISOString(),
      competitorId: 'target.com'
    }
  ],
  'walmart.com': [
    {
      id: '4',
      name: 'Apple iPhone 15 Pro',
      price: 989.99,
      description: '6.1-inch Super Retina XDR display, A17 Pro chip',
      inStock: true,
      imageUrl: 'https://picsum.photos/203',
      url: 'https://www.walmart.com/iphone-15-pro',
      lastChecked: new Date().toISOString(),
      competitorId: 'walmart.com'
    },
    {
      id: '5',
      name: 'Samsung 65" 4K Smart TV',
      price: 779.99,
      description: 'Crystal UHD, HDR, Smart Hub',
      inStock: true,
      imageUrl: 'https://picsum.photos/204',
      url: 'https://www.walmart.com/samsung-tv',
      lastChecked: new Date().toISOString(),
      competitorId: 'walmart.com'
    },
    {
      id: '6',
      name: 'Sony PlayStation 5',
      price: 489.99,
      description: 'Next-gen gaming console',
      inStock: true,
      imageUrl: 'https://picsum.photos/205',
      url: 'https://www.walmart.com/ps5',
      lastChecked: new Date().toISOString(),
      competitorId: 'walmart.com'
    }
  ]
};

export function getMockProducts(domain: string): Product[] {
  const hostname = new URL(domain).hostname;
  return mockProducts[hostname] || [];
} 