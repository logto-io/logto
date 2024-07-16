import { GrantType } from '@logto/schemas';
import type Provider from 'oidc-provider';
import instance from 'oidc-provider/lib/helpers/weak_cache.js';

import { type EnvSet } from '#src/env-set/index.js';
import type Queries from '#src/tenants/Queries.js';

import * as clientCredentials from './client-credentials.js';
import * as refreshToken from './refresh-token.js';
import * as tokenExchange from './token-exchange.js';

export const registerGrants = (oidc: Provider, envSet: EnvSet, queries: Queries) => {
  const {
    features: { resourceIndicators },
  } = instance(oidc).configuration();

  // If resource indicators are enabled, append `resource` to the parameters and allow it to
  // be duplicated
  const getParameterConfig = (
    parameters: readonly string[]
  ): [parameters: string[], duplicates: string[]] =>
    resourceIndicators.enabled
      ? [[...parameters, 'resource'], ['resource']]
      : [[...parameters], []];

  // Override the default grants
  oidc.registerGrantType(
    GrantType.RefreshToken,
    refreshToken.buildHandler(envSet, queries),
    ...getParameterConfig(refreshToken.parameters)
  );
  oidc.registerGrantType(
    GrantType.ClientCredentials,
    clientCredentials.buildHandler(envSet, queries),
    ...getParameterConfig(clientCredentials.parameters)
  );
  oidc.registerGrantType(
    GrantType.TokenExchange,
    tokenExchange.buildHandler(envSet, queries),
    ...getParameterConfig(tokenExchange.parameters)
  );
};
