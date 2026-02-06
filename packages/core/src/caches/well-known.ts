import {
  type EmailTemplate,
  EmailTemplates,
  type SignInExperience,
  SignInExperiences,
  type AccountCenter,
  AccountCenters,
  type IdTokenConfig,
  idTokenConfigGuard,
} from '@logto/schemas';
import { type Nullable } from '@silverhand/essentials';
import { type ZodType, z } from 'zod';

import { type ConnectorWellKnown, connectorWellKnownGuard } from '#src/utils/connectors/types.js';

import { BaseCache } from './base-cache.js';

type WellKnownMap = {
  sie: SignInExperience;
  'connectors-well-known': ConnectorWellKnown[];
  'email-templates': Nullable<EmailTemplate>;
  'custom-phrases': Record<string, unknown>;
  'custom-phrases-tags': string[];
  'tenant-cache-expires-at': number;
  // Currently, tenant type cannot be updated once created. So it's safe to cache.
  'is-development-tenant': boolean;
  'account-center': AccountCenter;
  'id-token-config': Nullable<IdTokenConfig>;
};

type WellKnownCacheType = keyof WellKnownMap;

// Cannot use generic type here, but direct type works.
// See [this issue](https://github.com/microsoft/TypeScript/issues/27808#issuecomment-1207161877) for details.
// WARN: You should carefully check key and return type mapping since the implementation signature doesn't do this.
function getValueGuard<Type extends WellKnownCacheType>(type: Type): ZodType<WellKnownMap[Type]>;

function getValueGuard(type: WellKnownCacheType): ZodType<WellKnownMap[typeof type]> {
  switch (type) {
    case 'sie': {
      return SignInExperiences.guard;
    }
    case 'connectors-well-known': {
      return connectorWellKnownGuard.array();
    }
    case 'custom-phrases-tags': {
      return z.string().array();
    }
    case 'custom-phrases': {
      return z.record(z.unknown());
    }
    case 'tenant-cache-expires-at': {
      return z.number();
    }
    case 'is-development-tenant': {
      return z.boolean();
    }
    case 'email-templates': {
      return EmailTemplates.guard.nullable();
    }
    case 'account-center': {
      return AccountCenters.guard;
    }
    case 'id-token-config': {
      return idTokenConfigGuard.nullable();
    }
  }
}

/**
 * A reusable cache for well-known data. The name "well-known" has no direct relation to the `.well-known` routes,
 * but indicates the data to store should be publicly viewable.
 *
 * **CAUTION** You should never store any data that is protected by any authentication method.
 *
 * For better code maintainability, we recommend to use the cache for database queries only unless you have a strong
 * reason.
 *
 * @see {@link getValueGuard} For how data will be guarded while getting from the cache.
 */
export class WellKnownCache extends BaseCache<WellKnownMap> {
  name = 'Well-known';
  getValueGuard = getValueGuard;
}
