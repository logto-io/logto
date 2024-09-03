import { type Context } from 'koa';
import type Provider from 'oidc-provider';
import { z } from 'zod';

import {
  singleSignOnConnectorSessionGuard,
  singleSignOnInteractionIdentifierResultGuard,
  type SingleSignOnConnectorSession,
  type SingleSignOnInteractionIdentifierResult,
} from '#src/sso/index.js';
import assertThat from '#src/utils/assert-that.js';

/**
 * Get the single sign on session data from the oidc provider session storage.
 *
 * @remark Forked from ./social-verification.ts.
 * Use SingleSignOnSession guard instead of ConnectorSession guard.
 */
export const getSingleSignOnSessionResult = async (
  ctx: Context,
  provider: Provider
): Promise<SingleSignOnConnectorSession> => {
  const { result } = await provider.interactionDetails(ctx.req, ctx.res);

  const singleSignOnSessionResult = z
    .object({
      connectorSession: singleSignOnConnectorSessionGuard,
    })
    .safeParse(result);

  assertThat(
    result && singleSignOnSessionResult.success,
    'session.connector_validation_session_not_found'
  );

  // Clear the session after the session data is retrieved
  const { connectorSession, ...rest } = result;
  await provider.interactionResult(ctx.req, ctx.res, {
    ...rest,
  });

  return singleSignOnSessionResult.data.connectorSession;
};

/**
 * Assign the single sign on session data to the oidc provider session storage.
 *
 * @remark Forked from {@link ./social-verification.ts.}
 * Use the SingleSignOnConnectorSession type instead of ConnectorSession.
 * Remove the dependency from social-verification utils.
 */
export const assignSingleSignOnSessionResult = async (
  ctx: Context,
  provider: Provider,
  connectorSession: SingleSignOnConnectorSession
) => {
  const details = await provider.interactionDetails(ctx.req, ctx.res);
  await provider.interactionResult(ctx.req, ctx.res, {
    ...details.result,
    connectorSession,
  });
};

// Remark:
// The following functions are used in the legacy interaction single sign on routes only.
// Deprecated in the experience APIs. `SingleSignOnAuthenticationResult` will be stored as a verification record in the latest experience API implementation.

export const assignSingleSignOnAuthenticationResult = async (
  ctx: Context,
  provider: Provider,
  singleSignOnIdentifier: SingleSignOnInteractionIdentifierResult
) => {
  const details = await provider.interactionDetails(ctx.req, ctx.res);

  await provider.interactionResult(
    ctx.req,
    ctx.res,
    { ...details.result, singleSignOnIdentifier },
    { mergeWithLastSubmission: true }
  );
};

export const getSingleSignOnAuthenticationResult = async (
  ctx: Context,
  provider: Provider,
  connectorId: string
): Promise<SingleSignOnInteractionIdentifierResult> => {
  const { result } = await provider.interactionDetails(ctx.req, ctx.res);

  const singleSignOnInteractionIdentifierResult =
    singleSignOnInteractionIdentifierResultGuard.safeParse(result);

  assertThat(
    singleSignOnInteractionIdentifierResult.success,
    'session.connector_session_not_found'
  );

  const { singleSignOnIdentifier } = singleSignOnInteractionIdentifierResult.data;

  assertThat(
    singleSignOnIdentifier.connectorId === connectorId,
    'session.connector_session_not_found'
  );

  return singleSignOnIdentifier;
};
