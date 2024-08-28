import { type Context } from 'koa';
import type Provider from 'oidc-provider';
import { z } from 'zod';

import {
  type SingleSignOnConnectorSession,
  singleSignOnConnectorSessionGuard,
  singleSignOnInteractionIdentifierResultGuard,
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

export const assignSingleSignOnAuthenticationResult = async (
  ctx: Context,
  provider: Provider,
  singleSignOnIdentifier: SingleSignOnInteractionIdentifierResult['singleSignOnIdentifier']
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
): Promise<SingleSignOnInteractionIdentifierResult['singleSignOnIdentifier']> => {
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
