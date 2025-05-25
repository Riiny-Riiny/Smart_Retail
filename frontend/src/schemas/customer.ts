import { z } from 'zod';

export const CustomerSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  email: z.string().email(),
  totalSpent: z.number().positive(),
  orderCount: z.number().int().min(0),
  lastPurchase: z.string().datetime(),
  segment: z.enum(['VIP', 'Regular', 'New']),
});

export const CustomerResponseSchema = z.object({
  customers: z.array(CustomerSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export type Customer = z.infer<typeof CustomerSchema>;
export type CustomerResponse = z.infer<typeof CustomerResponseSchema>; 