import { NextRequest, NextResponse } from 'next/server';
import * as customerService from '@/lib/server/customerService';

export async function GET(request: NextRequest) {
  try {
    console.log('Customers API called');
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const searchTerm = searchParams.get('search') || '';
    const segment = searchParams.get('segment') || 'all';

    console.log('Query params:', { page, searchTerm, segment });

    const data = await customerService.getCustomers(page, searchTerm, segment);
    console.log('Customers found:', data.customers.length);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in customers API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
} 