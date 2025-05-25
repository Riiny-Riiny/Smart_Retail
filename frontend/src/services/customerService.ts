import { CustomerResponse } from '@/schemas/customer';

async function getCustomers(
  page: number = 1,
  searchTerm: string = '',
  segment: string = 'all'
): Promise<CustomerResponse> {
  try {
    console.log('Fetching customers with params:', { page, searchTerm, segment });
    
    const params = new URLSearchParams({
      page: page.toString(),
      search: searchTerm,
      segment: segment,
    });

    const response = await fetch(`/api/customers?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Received customer data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
}

async function createCustomer(data: {
  name: string;
  email: string;
  segment: string;
}) {
  const response = await fetch('/api/customers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

async function updateCustomer(id: string, data: {
  name?: string;
  email?: string;
  segment?: string;
}) {
  const response = await fetch(`/api/customers/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

async function deleteCustomer(id: string) {
  const response = await fetch(`/api/customers/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const customerService = {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
}; 