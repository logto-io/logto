import {
  type EmailTemplate,
  EmailTemplates,
  type SignInExperience,
  SignInExperiences,
  type AccountCenter,
  AccountCenters,
  type IdTokenConfig,
  type Resource,
  Resources,
  idTokenConfigGuard,
  type SigningKeyRotationState,
  signingKeyRotationStateGuard,
} from '@logto/schemas';
import { type Nullable } from '@silverhand/essentials';
import { type ZodType, z } from 'zod';

import { type ConnectorWellKnown, connectorWellKnownGuard } from '#src/utils/connectors/types.js';

import { BaseCache } from './base-cache.js';

type WellKnownMap = {
  sie: SignInExperience;
  'connectors-well-known': ConnectorWellKnown[];
  'email-templates': Nullable<EmailTemplate>;
  'resource-by-indicator': Nullable<Resource>;
  'custom-phrases': Record<string, unknown>;
  'custom-phrases-tags': string[];
  'signing-key-rotation-state': Nullable<SigningKeyRotationState>;
  // Currently, tenant type cannot be updated once created. So it's safe to cache.
  'is-development-tenant': boolean;
  'account-center': AccountCenter;
  'id-token-config': Nullable<IdTokenConfig>;
};

type WellKnownCacheType = keyof WellKnownMap;

const valueGuards: { [Key in WellKnownCacheType]: ZodType<WellKnownMap[Key]> } = {
  sie: SignInExperiences.guard,
  'connectors-well-known': connectorWellKnownGuard.array(),
  'email-templates': EmailTemplates.guard.nullable(),
  'resource-by-indicator': Resources.guard.nullable(),
  'custom-phrases': z.record(z.unknown()),
  'custom-phrases-tags': z.string().array(),
  'signing-key-rotation-state': signingKeyRotationStateGuard.nullable(),
  'is-development-tenant': z.boolean(),
  'account-center': AccountCenters.guard,
  'id-token-config': idTokenConfigGuard.nullable(),
};

// Cannot use generic type here, but direct type works.
// See [this issue](https://github.com/microsoft/TypeScript/issues/27808#issuecomment-1207161877) for details.
// WARN: You should carefully check key and return type mapping since the implementation signature doesn't do this.
function getValueGuard<Type extends WellKnownCacheType>(type: Type): ZodType<WellKnownMap[Type]>;

function getValueGuard(type: WellKnownCacheType): ZodType<WellKnownMap[typeof type]> {
  return valueGuards[type];
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
