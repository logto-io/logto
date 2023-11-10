import { GrantType } from '@logto/schemas';
import type Provider from 'oidc-provider';
import instance from 'oidc-provider/lib/helpers/weak_cache.js';

import { type EnvSet } from '#src/env-set/index.js';
import type Queries from '#src/tenants/Queries.js';

import * as refreshToken from './refresh-token.js';

export const registerGrants = (oidc: Provider, envSet: EnvSet, queries: Queries) => {
  const {
    features: { resourceIndicators },
  } = instance(oidc).configuration();

  // If resource indicators are enabled, append `resource` to the parameters and allow it to
  // be duplicated
  const parameterConfig: [parameters: string[], duplicates: string[]] = resourceIndicators.enabled
    ? [[...refreshToken.parameters, 'resource'], ['resource']]
    : [[...refreshToken.parameters], []];

  // Override the default `refresh_token` grant
  oidc.registerGrantType(
    GrantType.RefreshToken,
    refreshToken.buildHandler(envSet, queries.organizations),
    ...parameterConfig
  );
};
