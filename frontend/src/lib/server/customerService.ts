import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { CustomerResponseSchema } from '@/schemas/customer';

const ITEMS_PER_PAGE = 10;

export async function getCustomers(page: number, searchTerm: string = '', segment: string = 'all') {
  try {
    console.log('Server getCustomers called with:', { page, searchTerm, segment });

    // Build where clause for filtering
    const where: Prisma.CustomerWhereInput = {
      AND: [
        // Search term filter
        searchTerm ? {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
          ],
        } : {},
        // Segment filter
        segment !== 'all' ? {
          segment: segment.toUpperCase() as Prisma.Segment,
        } : {},
      ],
    };

    // Get total count for pagination
    const total = await prisma.customer.count({ where });

    // Get paginated customers
    const customers = await prisma.customer.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    // Transform data to match our schema
    const transformedCustomers = customers.map(customer => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      totalSpent: customer.totalSpent,
      orderCount: customer._count.orders,
      lastPurchase: customer.lastPurchase.toISOString(),
      segment: customer.segment,
    }));

    const response = {
      customers: transformedCustomers,
      total,
      page,
      pageSize: ITEMS_PER_PAGE,
    };

    // Validate response
    return CustomerResponseSchema.parse(response);
  } catch (error) {
    console.error('Error in server getCustomers:', error);
    throw error;
  }
}

export async function createCustomer(data: {
  name: string;
  email: string;
  segment: Prisma.Segment;
}) {
  return prisma.customer.create({
    data: {
      ...data,
      totalSpent: 0,
      lastPurchase: new Date(),
    },
  });
}

export async function updateCustomer(id: string, data: {
  name?: string;
  email?: string;
  segment?: Prisma.Segment;
}) {
  return prisma.customer.update({
    where: { id },
    data,
  });
}

export async function deleteCustomer(id: string) {
  return prisma.customer.delete({
    where: { id },
  });
} 