import { ConnectorError, ConnectorErrorCodes } from '@logto/connector-kit';
import { z } from 'zod';

/**
 * The error response of an authorization request the user declined, as the provider sends it
 * back to the redirect URI: RFC 6749 §4.1.2.1 for OAuth 2.0, the same shape for OpenID Connect.
 *
 * Only `access_denied` is recognized here. The other error codes (`redirect_uri_mismatch`,
 * `invalid_scope`, `server_error`…) describe a configuration or provider problem, and the
 * connectors that handle them (Facebook, GitHub, QQ, Xiaomi…) deliberately surface the provider's
 * description through `connector.general`; they are left to the connector.
 */
const accessDeniedResponseGuard = z.object({
  error: z.literal('access_denied'),
  error_description: z.string().optional(),
  error_uri: z.string().optional(),
});

/**
 * Throw `ConnectorErrorCodes.AuthorizationFailed` when the data a social connector is about to
 * verify says the user declined the authorization rather than carrying an authorization result.
 *
 * A user who declines the consent screen or cancels at the provider comes back with
 * `error=access_denied` (plus `error_description` on some providers). Most connectors only
 * validate the success shape of the callback (`code`, `state`…), so such a callback failed their
 * guard and surfaced as a generic `connector.general` error whose message was the raw callback
 * parameters. Checking it before the connector runs gives every connector the same answer: a 401
 * `connector.authorization_failed` that carries the provider's `error` and `error_description`,
 * which the client can act on. The connectors that already map `access_denied` themselves
 * (Facebook, GitHub…) produce the same error code, so their behavior does not change.
 */
export const assertNoAuthorizationError = (connectorData: unknown): void => {
  const result = accessDeniedResponseGuard.safeParse(connectorData);

  if (result.success) {
    throw new ConnectorError(ConnectorErrorCodes.AuthorizationFailed, result.data);
  }
};
