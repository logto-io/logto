import { z } from 'zod';

/**
 * Response contract for `GET /api/tenants/:tenantId/invoices`. Field names and nullability match
 * the Cloud API shape the console's billing history reads.
 */
export const invoiceStatusGuard = z.enum(['void', 'open', 'paid', 'draft', 'uncollectible']);

export const invoiceGuard = z.object({
  id: z.string(),
  status: invoiceStatusGuard.nullable(),
  subscriptionId: z.string().nullable(),
  customerId: z.string().nullable(),
  basicSkuId: z.string().nullable(),
  skuId: z.string().nullable().optional(),
  billingReason: z.string().nullable(),
  amountDue: z.number().int(),
  amountPaid: z.number().int(),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  servicePeriodStart: z.coerce.date().nullable(),
  servicePeriodEnd: z.coerce.date().nullable(),
  dueDate: z.coerce.date().nullable(),
  planName: z.string().nullable(),
  hostedInvoiceUrl: z.string().nullable(),
  invoicePdf: z.string().nullable(),
  collectionMethod: z.enum(['send_invoice', 'charge_automatically']).nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const invoicesResponseGuard = z.object({
  invoices: z.array(invoiceGuard),
});

export type Invoice = z.infer<typeof invoiceGuard>;
