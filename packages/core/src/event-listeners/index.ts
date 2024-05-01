import { ConsoleLog } from '@logto/shared';
import chalk from 'chalk';
import type Provider from 'oidc-provider';

import type Queries from '#src/tenants/Queries.js';

import { grantListener, grantRevocationListener } from './grant.js';
import { interactionEndedListener, interactionStartedListener } from './interaction.js';
import { recordActiveUsers } from './record-active-users.js';

const consoleLog = new ConsoleLog(chalk.magenta('oidc'));

/**
 * @see {@link https://github.com/panva/node-oidc-provider/blob/v7.x/docs/README.md#im-getting-a-client-authentication-failed-error-with-no-details Getting auth error with no details?}
 * @see {@link https://github.com/panva/node-oidc-provider/blob/v7.x/docs/events.md OIDC Provider events}
 */
export const addOidcEventListeners = (provider: Provider, queries: Queries) => {
  const { recordTokenUsage } = queries.dailyTokenUsage;
  const countTokenUsage = async () => recordTokenUsage(new Date());

  provider.addListener('grant.success', grantListener);
  provider.addListener('grant.error', grantListener);
  provider.addListener('grant.revoked', grantRevocationListener);
  provider.addListener('access_token.issued', async (token) => {
    return recordActiveUsers(token, queries);
  });
  provider.addListener('access_token.saved', async (token) => {
    return recordActiveUsers(token, queries);
  });
  provider.addListener('interaction.started', interactionStartedListener);
  provider.addListener('interaction.ended', interactionEndedListener);
  provider.addListener('server_error', (_, error) => {
    consoleLog.error('server_error:', error);
  });

  // Record token usage.
  for (const event of [
    'access_token.saved',
    'access_token.issued',
    'client_credentials.saved',
    'client_credentials.issued',
    'initial_access_token.saved',
    'registration_access_token.saved',
    'refresh_token.saved',
  ]) {
    provider.addListener(event, countTokenUsage);
  }
};
