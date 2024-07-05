import type { Profile } from '@logto/schemas';
import { InteractionEvent } from '@logto/schemas';
import { assert } from '@silverhand/essentials';
import type { Context } from 'koa';
import type Provider from 'oidc-provider';
import type { InteractionResults } from 'oidc-provider';
import { errors } from 'oidc-provider';

import RequestError from '#src/errors/RequestError/index.js';
import assertThat from '#src/utils/assert-that.js';

import { anonymousInteractionResultGuard } from '../types/guard.js';
import type {
  AccountVerifiedInteractionResult,
  AnonymousInteractionResult,
  Identifier,
  RegisterInteractionResult,
  VerifiedForgotPasswordInteractionResult,
  VerifiedInteractionResult,
  VerifiedRegisterInteractionResult,
} from '../types/index.js';

const isProfileIdentifier = (identifier: Identifier, profile?: Profile) => {
  if (identifier.key === 'accountId') {
    return false;
  }

  if (identifier.key === 'emailVerified') {
    return profile?.email === identifier.value;
  }

  if (identifier.key === 'phoneVerified') {
    return profile?.phone === identifier.value;
  }

  return profile?.connectorId === identifier.connectorId;
};

// Unique identifier type is required
export const mergeIdentifiers = (newIdentifier: Identifier, oldIdentifiers?: Identifier[]) => {
  if (!oldIdentifiers) {
    return [newIdentifier];
  }

  // Filter out identifiers with the same key in the oldIdentifiers and replaced with new ones
  const leftOvers = oldIdentifiers.filter(
    (oldIdentifier) => newIdentifier.key !== oldIdentifier.key
  );

  return [...leftOvers, newIdentifier];
};

/**
 * Categorize the identifiers based on their different use cases
 * @typedef {Object} result
 * @property {Identifier[]} authIdentifiers - identifiers to verify a specific user account e.g. for sign-in and reset-password
 * @property {Identifier[]} profileIdentifiers - identifiers to verify a new anonymous profile e.g. new email, new phone or new social identity
 *
 * @param {Identifier[]} identifiers
 * @param {Profile} profile
 * @returns
 */
export const categorizeIdentifiers = (
  identifiers: Identifier[],
  profile?: Profile
): {
  authIdentifiers: Identifier[];
  profileIdentifiers: Identifier[];
} => {
  const authIdentifiers = new Set<Identifier>();
  const profileIdentifiers = new Set<Identifier>();

  for (const identifier of identifiers) {
    if (isProfileIdentifier(identifier, profile)) {
      profileIdentifiers.add(identifier);
      continue;
    }
    authIdentifiers.add(identifier);
  }

  return {
    authIdentifiers: [...authIdentifiers],
    profileIdentifiers: [...profileIdentifiers],
  };
};

export const isForgotPasswordInteractionResult = (
  interaction: VerifiedInteractionResult
): interaction is VerifiedForgotPasswordInteractionResult =>
  interaction.event === InteractionEvent.ForgotPassword;

export const isRegisterInteractionResult = (
  interaction: VerifiedInteractionResult
): interaction is VerifiedRegisterInteractionResult =>
  interaction.event === InteractionEvent.Register;

export const isSignInInteractionResult = (
  interaction: RegisterInteractionResult | AccountVerifiedInteractionResult
): interaction is AccountVerifiedInteractionResult => interaction.event === InteractionEvent.SignIn;

export const storeInteractionResult = async (
  interaction: Omit<AnonymousInteractionResult, 'event'> & { event?: InteractionEvent },
  ctx: Context,
  provider: Provider,
  merge = false
) => {
  // The "mergeWithLastSubmission" will only merge current request's interaction results,
  // manually merge with previous interaction results
  // refer to: https://github.com/panva/node-oidc-provider/blob/c243bf6b6663c41ff3e75c09b95fb978eba87381/lib/actions/authorization/interactions.js#L106

  const details = merge ? await provider.interactionDetails(ctx.req, ctx.res) : undefined;

  await provider.interactionResult(
    ctx.req,
    ctx.res,
    { ...details?.result, ...interaction },
    { mergeWithLastSubmission: merge }
  );
};

export const getInteractionStorage = (
  interaction?: InteractionResults
): AnonymousInteractionResult => {
  const parseResult = anonymousInteractionResultGuard.safeParse(interaction);

  assertThat(
    parseResult.success,
    new RequestError({ code: 'session.verification_session_not_found', status: 404 })
  );

  return parseResult.data;
};

export const clearInteractionStorage = async (ctx: Context, provider: Provider) => {
  const { result } = await provider.interactionDetails(ctx.req, ctx.res);

  if (result) {
    await provider.interactionResult(ctx.req, ctx.res, {});
  }
};

/**
 * The following three methods (`getInteractionFromProviderByJti`, `assignResultToInteraction`
 * and `epochTime`) refer to implementation in
 * https://github.com/panva/node-oidc-provider/blob/main/lib/provider.js
 */
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
 * Since we don't have the OIDC provider context here, `provider.interactionResult` cannot be used.
 * This method is forked from the original implementation in `provide.interactionResult` in oidc-provider.
 * Assign the result to the interaction and save it.
 */
export const assignResultToInteraction = async (
  interaction: Interaction,
  result: InteractionResults
) => {
  const { lastSubmission, exp } = interaction;

  // eslint-disable-next-line @silverhand/fp/no-mutation
  interaction.result = { ...lastSubmission, ...result };
  await interaction.save(exp - epochTime());
};
