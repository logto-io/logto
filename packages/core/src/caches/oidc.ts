import { type ZodType, z } from 'zod';

import { BaseCache } from './base-cache.js';

/**
 * The cached result shape returned by `getResourceServerInfo` in the OIDC provider configuration.
 * Contains resource server metadata with resolved scope string.
 *
 * Fields align with the oidc-provider `ResourceServer` interface so the cached value can be
 * returned directly to the provider without additional type conversions.
 */
type ResourceServerInfo = {
  accessTokenFormat?: string | undefined;
  jwt?: { sign?: { alg?: string; kid?: string } | undefined } | undefined;
  accessTokenTTL: number;
  scope: string;
};

const resourceServerInfoGuard = z.object({
  accessTokenFormat: z.string().optional(),
  jwt: z
    .object({
      sign: z.object({ alg: z.string().optional(), kid: z.string().optional() }).optional(),
    })
    .optional(),
  accessTokenTTL: z.number(),
  scope: z.string(),
});

type OidcCacheMap = {
  'resource-server-info': ResourceServerInfo;
};

type OidcCacheType = keyof OidcCacheMap;

// See https://github.com/microsoft/TypeScript/issues/27808#issuecomment-1207161877
// Overload signature is required for TypeScript to properly narrow the return type.
function getValueGuard<Type extends OidcCacheType>(type: Type): ZodType<OidcCacheMap[Type]>;

function getValueGuard(type: OidcCacheType): ZodType<OidcCacheMap[typeof type]> {
  switch (type) {
    case 'resource-server-info': {
      return resourceServerInfoGuard;
    }
  }
}

/**
 * Cache for OIDC token exchange read-path operations.
 * Caches resource server info (scopes, TTL) with short TTL to reduce DB round trips.
 */
export class OidcCache extends BaseCache<OidcCacheMap> {
  name = 'OIDC';
  getValueGuard = getValueGuard;
}
