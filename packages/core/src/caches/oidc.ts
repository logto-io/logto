import { type ResourceServer } from 'oidc-provider';
import { type ZodType, z } from 'zod';

import { BaseCache } from './base-cache.js';

type ResourceServerInfo = Pick<
  ResourceServer,
  'accessTokenFormat' | 'jwt' | 'accessTokenTTL' | 'scope'
>;

const resourceServerInfoSchema = z.object({
  accessTokenFormat: z.enum(['jwt', 'opaque']).optional(),
  jwt: z
    .object({
      sign: z.object({ alg: z.string().optional(), kid: z.string().optional() }).optional(),
    })
    .optional(),
  accessTokenTTL: z.number(),
  scope: z.string(),
});

const resourceServerInfoGuard: ZodType<ResourceServerInfo> = z.custom<ResourceServerInfo>(
  (value) => resourceServerInfoSchema.safeParse(value).success
);

type OidcCacheMap = {
  'resource-server-info': ResourceServerInfo;
};

type OidcCacheType = keyof OidcCacheMap;

function getValueGuard<Type extends OidcCacheType>(type: Type): ZodType<OidcCacheMap[Type]>;

function getValueGuard(type: OidcCacheType): ZodType<OidcCacheMap[typeof type]> {
  switch (type) {
    case 'resource-server-info': {
      return resourceServerInfoGuard;
    }
  }
}

export class OidcCache extends BaseCache<OidcCacheMap> {
  name = 'OIDC';
  getValueGuard = getValueGuard;
}
