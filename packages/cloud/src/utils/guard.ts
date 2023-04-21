import type { Json } from '@withtyped/server';
import { z } from 'zod';

/**
 * `jsonGuard` copied from https://github.com/colinhacks/zod#json-type.
 * Can be moved to @logto/shared if needed.
 */

const jsonGuard: z.ZodType<Json> = z.lazy(() =>
  z.union([z.number(), z.boolean(), z.string(), z.null(), z.array(jsonGuard), z.record(jsonGuard)])
);

export const jsonObjectGuard = z.record(jsonGuard);
