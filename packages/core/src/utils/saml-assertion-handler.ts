import type { ConnectorSession } from '@logto/connector-kit';
import { connectorSessionGuard } from '@logto/connector-kit';
import { errors } from 'oidc-provider';
import type Provider from 'oidc-provider';
import type { InteractionResults } from 'oidc-provider';
import { z } from 'zod';

import assertThat from './assert-that.js';

/**
 *
 * The following three methods (`getInteractionFromProviderByJti`, `assignResultToInteraction`
 * and `epochTime`) refer to implementation in
 * https://github.com/panva/node-oidc-provider/blob/main/lib/provider.js
 */
type Interaction = Awaited<ReturnType<Provider['interactionDetails']>>;

const epochTime = (date = Date.now()) => Math.floor(date / 1000);

const getInteractionFromProviderByJti = async (
  jti: string,
  provider: Provider
): Promise<Interaction> => {
  const interaction = await provider.Interaction.find(jti);

  if (!interaction) {
    throw new errors.SessionNotFound('interaction session not found');
  }

  if (interaction.session?.uid) {
    const session = await provider.Session.findByUid(interaction.session.uid);

    if (!session) {
      throw new errors.SessionNotFound('session not found');
    }

    if (interaction.session.accountId !== session.accountId) {
      throw new errors.SessionNotFound('session principal changed');
    }
  }

  return interaction;
};

const assignResultToInteraction = async (interaction: Interaction, result: InteractionResults) => {
  const { lastSubmission, exp } = interaction;

  // eslint-disable-next-line @silverhand/fp/no-mutation
  interaction.result = { ...lastSubmission, ...result };
  await interaction.save(exp - epochTime());
};

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
