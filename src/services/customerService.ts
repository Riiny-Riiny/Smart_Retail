export interface Customer {
  id: string;
  name: string;
  email: string;
  totalSpent: number;
  orderCount: number;
  lastPurchase: string; // ISO date string
  segment: 'VIP' | 'Regular' | 'New';
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
}

// Mock data for demonstration
const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    totalSpent: 2450.00,
    orderCount: 12,
    lastPurchase: '2024-05-25T10:00:00Z',
    segment: 'VIP',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-05-25T10:00:00Z'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    totalSpent: 890.50,
    orderCount: 5,
    lastPurchase: '2024-05-20T15:30:00Z',
    segment: 'Regular',
    createdAt: '2024-03-10T08:00:00Z',
    updatedAt: '2024-05-20T15:30:00Z'
  },
  {
    id: '3',
    name: 'Mike Davis',
    email: 'mike.davis@email.com',
    totalSpent: 156.99,
    orderCount: 2,
    lastPurchase: '2024-05-22T12:45:00Z',
    segment: 'New',
    createdAt: '2024-05-01T14:20:00Z',
    updatedAt: '2024-05-22T12:45:00Z'
  },
  {
    id: '4',
    name: 'Emily Chen',
    email: 'emily.chen@email.com',
    totalSpent: 1750.75,
    orderCount: 8,
    lastPurchase: '2024-05-23T09:15:00Z',
    segment: 'VIP',
    createdAt: '2024-02-20T11:30:00Z',
    updatedAt: '2024-05-23T09:15:00Z'
  },
  {
    id: '5',
    name: 'Robert Wilson',
    email: 'robert.wilson@email.com',
    totalSpent: 425.30,
    orderCount: 3,
    lastPurchase: '2024-05-21T16:20:00Z',
    segment: 'Regular',
    createdAt: '2024-04-05T13:45:00Z',
    updatedAt: '2024-05-21T16:20:00Z'
  }
];

export const customerService = {
  async getCustomers(
    page: number = 1, 
    searchTerm: string = '', 
    selectedSegment: string = 'all'
  ): Promise<{ customers: Customer[]; total: number }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    let filteredCustomers = mockCustomers;

    // Apply search filter
    if (searchTerm) {
      filteredCustomers = filteredCustomers.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply segment filter
    if (selectedSegment !== 'all') {
      filteredCustomers = filteredCustomers.filter(customer => 
        customer.segment === selectedSegment
      );
    }

    // Apply pagination
    const limit = 10;
    const start = (page - 1) * limit;
    const end = start + limit;
    const customers = filteredCustomers.slice(start, end);
    
    return {
      customers,
      total: filteredCustomers.length
    };
  },

  async getCustomer(id: string): Promise<Customer | null> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return mockCustomers.find(customer => customer.id === id) || null;
  },

  async createCustomer(customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const newCustomer: Customer = {
      ...customerData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockCustomers.push(newCustomer);
    return newCustomer;
  },

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const index = mockCustomers.findIndex(customer => customer.id === id);
    if (index === -1) return null;
    
    mockCustomers[index] = {
      ...mockCustomers[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    return mockCustomers[index];
  },

  async deleteCustomer(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const index = mockCustomers.findIndex(customer => customer.id === id);
    if (index === -1) return false;
    
    mockCustomers.splice(index, 1);
    return true;
  }
}; 