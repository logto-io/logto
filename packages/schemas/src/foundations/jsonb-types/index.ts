import type { Json } from '@withtyped/server';
import { z } from 'zod';

export * from './custom-domain.js';
export * from './hooks.js';
export * from './logs.js';
export * from './oidc-module.js';
export * from './phrases.js';
export * from './sign-in-experience.js';
export * from './sentinel.js';
export * from './users.js';

export {
  configurableConnectorMetadataGuard,
  type ConfigurableConnectorMetadata,
} from '@logto/connector-kit';

export type { Json, JsonObject } from '@withtyped/server';

/* === Commonly Used === */

// Copied from https://github.com/colinhacks/zod#json-type
const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

export const jsonGuard: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(jsonGuard), z.record(jsonGuard)])
);

export const jsonObjectGuard = z.record(jsonGuard);
