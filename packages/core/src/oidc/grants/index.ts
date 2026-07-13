import { GrantType } from '@logto/schemas';
import type { Provider } from 'oidc-provider';

import { type EnvSet } from '#src/env-set/index.js';
import { getProviderConfiguration } from '#src/oidc/oidc-provider-internals.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';

import * as clientCredentials from './client-credentials.js';
import * as refreshToken from './refresh-token.js';
import * as tokenExchange from './token-exchange/index.js';

export const registerGrants = (
  oidc: Provider,
  envSet: EnvSet,
  queries: Queries,
  libraries: Libraries
) => {
  const {
    features: { resourceIndicators },
  } = getProviderConfiguration(oidc);

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
    refreshToken.buildHandler(envSet, queries, libraries.applicationAccessControl),
    ...getParameterConfig(refreshToken.parameters)
  );
  oidc.registerGrantType(
    GrantType.ClientCredentials,
    clientCredentials.buildHandler(envSet, queries),
    ...getParameterConfig(clientCredentials.parameters)
  );
  oidc.registerGrantType(
    GrantType.TokenExchange,
    tokenExchange.buildHandler(envSet, queries, libraries.applicationAccessControl),
    ...getParameterConfig(tokenExchange.parameters)
  );
};
