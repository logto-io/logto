import type { ConnectorSession } from '@logto/connector-kit';
import { connectorSessionGuard } from '@logto/connector-kit';
import type Provider from 'oidc-provider';
import { z } from 'zod';

import {
  getInteractionFromProviderByJti,
  assignResultToInteraction,
} from '#src/routes/interaction/utils/interaction.js';
import {
  type SingleSignOnConnectorSession,
  singleSignOnConnectorSessionGuard,
} from '#src/sso/index.js';
import { type ExtendedSocialUserInfo } from '#src/sso/types/saml.js';

import assertThat from './assert-that.js';

export const assignConnectorSessionResultViaJti = async (
  jti: string,
  provider: Provider,
  connectorSession: ConnectorSession
) => {
  const interaction = await getInteractionFromProviderByJti(jti, provider);

  const { result } = interaction;

  const connectorSessionResult = z
    .object({
      connectorSession: connectorSessionGuard,
    })
    .catchall(z.unknown())
    .safeParse(result);

  assertThat(
    result && connectorSessionResult.success,
    'session.connector_validation_session_not_found'
  );

  const { connectorSession: originalConnectorSession, ...rest } = connectorSessionResult.data;

  await assignResultToInteraction(interaction, {
    ...rest,
    connectorSession: { ...originalConnectorSession, ...connectorSession },
  });
};

/**
 * Used by the standard SAML social connectors ACS endpoint.
 * @deprecated
 * Will be cleaned once the old SAML social connectors are removed.
 */
export const getConnectorSessionResultFromJti = async (
  jti: string,
  provider: Provider
): Promise<ConnectorSession> => {
  const interaction = await getInteractionFromProviderByJti(jti, provider);

  const { result } = interaction;

  const connectorSessionResult = z
    .object({
      connectorSession: connectorSessionGuard,
    })
    .safeParse(result);

  assertThat(
    result && connectorSessionResult.success,
    'session.connector_validation_session_not_found'
  );

  return connectorSessionResult.data.connectorSession;
};

/**
 * Get the single sign on session data from the oidc provider session storage by the jti.
 *
 * @param jti The jti of the interaction session.
 *
 * @remark This method is used by the SSO SAML assertion consumer service endpoint.
 * Since we do not have the interaction ctx under SAML ACS endpoint, we need to get the session data by the jti.
 * Forked from the above {@link getConnectorSessionResultFromJti} method, with more detailed SingleSignOnConnectorSession type guard.
 */
export const getSingleSignOnSessionResultByJti = async (
  jti: string,
  provider: Provider
): Promise<SingleSignOnConnectorSession> => {
  const { result } = await getInteractionFromProviderByJti(jti, provider);

  const singleSignOnSessionResult = z
    .object({
      connectorSession: singleSignOnConnectorSessionGuard,
    })
    .safeParse(result);

  assertThat(singleSignOnSessionResult.success, 'session.connector_validation_session_not_found');

  return singleSignOnSessionResult.data.connectorSession;
};

/**
 * Assign the SAML assertion result to the interaction single sign-on session storage by the jti.
 *
 * @param jti The jti of the interaction session.
 */
export const assignSamlAssertionResultViaJti = async (
  jti: string,
  provider: Provider,
  sessionResultWithAssertion: Omit<SingleSignOnConnectorSession, 'userInfo'> & {
    userInfo: ExtendedSocialUserInfo;
  }
) => {
  const interaction = await getInteractionFromProviderByJti(jti, provider);

  const { result } = interaction;

  await assignResultToInteraction(interaction, {
    ...result,
    connectorSession: sessionResultWithAssertion,
  });
};
