import { z } from 'zod';

import { logtoSkuQuotaGuard } from './subscription.js';

/** The SKU kinds the console understands: a plan a tenant subscribes to, or an add-on to one. */
export const skuTypeGuard = z.enum(['Basic', 'AddOn']);

/** Response contract for `GET /api/skus`, matching the console's `LogtoSkuResponse`. */
export const skuGuard = z.object({
  type: skuTypeGuard,
  id: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  name: z.string().nullable(),
  defaultPriceId: z.string().nullable(),
  unitPrice: z.number().nullable(),
  quota: logtoSkuQuotaGuard.partial(),
});

export type SkuType = z.infer<typeof skuTypeGuard>;
export type Sku = z.infer<typeof skuGuard>;
