import { ConnectorError, ConnectorErrorCodes } from '@logto/connector-kit';
import { z } from 'zod';

/**
 * The error response of an authorization request, as the provider sends it back to the redirect
 * URI: RFC 6749 §4.1.2.1 for OAuth 2.0, the same shape for OpenID Connect.
 */
const authorizationErrorResponseGuard = z.object({
  error: z.string().min(1),
  error_description: z.string().optional(),
  error_uri: z.string().optional(),
});

/**
 * Throw `ConnectorErrorCodes.AuthorizationFailed` when the data a social connector is about to
 * verify is the provider's error response rather than an authorization result.
 *
 * A user who declines the consent screen or cancels at the provider comes back with
 * `error=access_denied` (plus `error_description` on some providers). Most connectors only
 * validate the success shape of the callback (`code`, `state`…), so such a callback failed their
 * guard and surfaced as a generic `connector.general` error whose message was the raw callback
 * parameters. Checking the standard error response before the connector runs gives every
 * connector the same answer: a 401 `connector.authorization_failed` that carries the provider's
 * `error` and `error_description`, which the client can act on.
 */
export const assertNoAuthorizationError = (connectorData: unknown): void => {
  const result = authorizationErrorResponseGuard.safeParse(connectorData);

  if (result.success) {
    throw new ConnectorError(ConnectorErrorCodes.AuthorizationFailed, result.data);
  }
};
