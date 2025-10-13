import { ProductEvent } from '@logto/schemas';
import { type Provider } from 'oidc-provider';

import type Queries from '#src/tenants/Queries.js';
import { getConsoleLogFromContext } from '#src/utils/console.js';
import { captureEvent } from '#src/utils/posthog.js';

import { grantListener, grantRevocationListener } from './grant.js';
import { interactionEndedListener, interactionStartedListener } from './interaction.js';
import { recordActiveUsers } from './record-active-users.js';
import { deleteSessionExtensions } from './session.js';
import { getAccessTokenEventPayload } from './utils.js';

/**
 * @see {@link https://github.com/panva/node-oidc-provider/blob/v7.x/docs/README.md#im-getting-a-client-authentication-failed-error-with-no-details Getting auth error with no details?}
 * @see {@link https://github.com/panva/node-oidc-provider/blob/v7.x/docs/events.md OIDC Provider events}
 */
export const addOidcEventListeners = (tenantId: string, provider: Provider, queries: Queries) => {
  const { recordTokenUsage } = queries.dailyTokenUsage;
  const tokenUsageListener = async (payload: unknown) => {
    if (payload instanceof provider.BaseToken) {
      captureEvent(
        { tenantId, request: undefined },
        ProductEvent.AccessTokenIssued,
        getAccessTokenEventPayload(payload, provider)
      );
    }

    await recordTokenUsage(new Date());
  };

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

  // Record token usage on token issue and save events. Note that some events are omitted:
  // - `initial_access_token.saved`: client registration related, DCR not enabled in our setup
  // - `registration_access_token.saved`: client registration related, DCR not enabled in our setup
  const events = Object.freeze([
    'access_token.saved',
    'access_token.issued',
    'client_credentials.saved',
    'client_credentials.issued',
  ] as const);

  for (const event of events) {
    provider.addListener(event, tokenUsageListener);
  }
};
