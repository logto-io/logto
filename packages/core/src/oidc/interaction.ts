/** @file Forked helpers from `node-oidc-provider/lib/provider.js` for callers without an OIDC provider context (e.g. SAML assertion handling). */
import { assert } from '@silverhand/essentials';
import type { InteractionResults, Provider } from 'oidc-provider';
import { errors } from 'oidc-provider';

type Interaction = Awaited<ReturnType<Provider['interactionDetails']>>;

const epochTime = (date = Date.now()) => Math.floor(date / 1000);

export const getInteractionFromProviderByJti = async (
  jti: string,
  provider: Provider
): Promise<Interaction> => {
  const interaction = await provider.Interaction.find(jti);

  assert(interaction, new errors.SessionNotFound('interaction session not found'));

  if (interaction.session?.uid) {
    const session = await provider.Session.findByUid(interaction.session.uid);

    assert(session, new errors.SessionNotFound('session not found'));

    assert(
      interaction.session.accountId === session.accountId,
      new errors.SessionNotFound('session principal changed')
    );
  }

  return interaction;
};

/**
 * Assigns the result to an interaction and saves it. Forked from
 * `provider.interactionResult` for callers without an OIDC provider context.
 */
export const assignResultToInteraction = async (
  interaction: Interaction,
  result: InteractionResults
) => {
  const { lastSubmission, exp } = interaction;

  // eslint-disable-next-line @silverhand/fp/no-mutation -- forked from oidc-provider; provider mutates interaction.result before save
  interaction.result = { ...lastSubmission, ...result };
  await interaction.save(exp - epochTime());
};
