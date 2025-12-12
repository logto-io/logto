import { type Provider } from 'oidc-provider';

import { TokenUsageType } from '#src/queries/daily-token-usage.js';
import type Queries from '#src/tenants/Queries.js';
import { getConsoleLogFromContext } from '#src/utils/console.js';

import { grantListener, grantRevocationListener } from './grant.js';
import { interactionEndedListener, interactionStartedListener } from './interaction.js';
import { recordActiveUsers } from './record-active-users.js';
import { deleteSessionExtensions } from './session.js';

/**
 * @see {@link https://github.com/panva/node-oidc-provider/blob/v7.x/docs/README.md#im-getting-a-client-authentication-failed-error-with-no-details Getting auth error with no details?}
 * @see {@link https://github.com/panva/node-oidc-provider/blob/v7.x/docs/events.md OIDC Provider events}
 */
export const addOidcEventListeners = (tenantId: string, provider: Provider, queries: Queries) => {
  const { recordTokenUsage } = queries.dailyTokenUsage;

  // Listener for user access tokens (increment user_token_usage)
  const userTokenUsageListener = async () =>
    recordTokenUsage(new Date(), { type: TokenUsageType.User });

  // Listener for client credentials/M2M tokens (increment m2m_token_usage)
  const m2mTokenUsageListener = async () =>
    recordTokenUsage(new Date(), { type: TokenUsageType.M2m });

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
  provider.addListener('server_error', (ctx, error) => {
    getConsoleLogFromContext(ctx).error('server_error:', error);
  });

  /**
   * Cascade delete OIDC session extensions by uid on session destroy.
   *
   * @remark
   * Since the session ID (jti) can be rotated, we have to use the session UID as the unique identifier.
   * @see {@link https://github.com/panva/node-oidc-provider/blob/main/lib/models/session.js#L117} for more details.
   *
   * Session UID was stored as an jsonb field in the `oidc_model_instances` table. We can not use it as a foreign key constraint
   * Need to manually delete the session extensions when the session is destroyed.
   */
  provider.addListener('session.destroyed', async (session) => {
    return deleteSessionExtensions(queries, session);
  });

  // Record token usage on token issue and save events, with proper type distinction
  // - `initial_access_token.saved`: client registration related, DCR not enabled in our setup
  // - `registration_access_token.saved`: client registration related, DCR not enabled in our setup

  // User access tokens - increment user_token_usage
  provider.addListener('access_token.saved', userTokenUsageListener);
  provider.addListener('access_token.issued', userTokenUsageListener);

  // Client credentials/M2M tokens - increment m2m_token_usage
  provider.addListener('client_credentials.saved', m2mTokenUsageListener);
  provider.addListener('client_credentials.issued', m2mTokenUsageListener);
};
