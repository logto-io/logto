import type Provider from 'oidc-provider';

import type Queries from '#src/tenants/Queries.js';
import { consoleLog } from '#src/utils/console.js';

import { accessTokenIssuedListener } from './access-token.js';
import { grantListener, grantRevocationListener } from './grant.js';
import { interactionEndedListener, interactionStartedListener } from './interaction.js';

/**
 * @see {@link https://github.com/panva/node-oidc-provider/blob/v7.x/docs/README.md#im-getting-a-client-authentication-failed-error-with-no-details Getting auth error with no details?}
 * @see {@link https://github.com/panva/node-oidc-provider/blob/v7.x/docs/events.md OIDC Provider events}
 */
export const addOidcEventListeners = (provider: Provider, queries: Queries) => {
  provider.addListener('grant.success', grantListener);
  provider.addListener('grant.error', grantListener);
  provider.addListener('grant.revoked', grantRevocationListener);
  provider.addListener('access_token.issued', async (token) => {
    return accessTokenIssuedListener(token, queries);
  });
  provider.addListener('access_token.saved', async (token) => {
    return accessTokenIssuedListener(token, queries);
  });
  provider.addListener('interaction.started', interactionStartedListener);
  provider.addListener('interaction.ended', interactionEndedListener);
  provider.addListener('server_error', (_, error) => {
    consoleLog.error('OIDC Provider server_error:', error);
  });
};
