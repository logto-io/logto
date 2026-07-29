import type { ConnectorSession } from '@logto/connector-kit';
import { connectorSessionGuard } from '@logto/connector-kit';
import type { Provider } from 'oidc-provider';
import { z } from 'zod';

import {
  getInteractionFromProviderByJti,
  assignResultToInteraction,
} from '#src/oidc/interaction.js';

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
