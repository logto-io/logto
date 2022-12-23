import type { ConnectorSession } from '@logto/connector-kit';
import { connectorSessionGuard } from '@logto/connector-kit';
import type { Profile, InteractionEvent } from '@logto/schemas';
import type { Context } from 'koa';
import type { Provider, InteractionResults } from 'oidc-provider';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import assertThat from '#src/utils/assert-that.js';

import { anonymousInteractionResultGuard } from '../types/guard.js';
import type {
  Identifier,
  AnonymousInteractionResult,
  AccountVerifiedInteractionResult,
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
 * @property {Identifier[]} userAccountIdentifiers - identifiers to verify a specific user account e.g. for sign-in and reset-password
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
  userAccountIdentifiers: Identifier[];
  profileIdentifiers: Identifier[];
} => {
  const userAccountIdentifiers = new Set<Identifier>();
  const profileIdentifiers = new Set<Identifier>();

  for (const identifier of identifiers) {
    if (isProfileIdentifier(identifier, profile)) {
      profileIdentifiers.add(identifier);
      continue;
    }
    userAccountIdentifiers.add(identifier);
  }

  return {
    userAccountIdentifiers: [...userAccountIdentifiers],
    profileIdentifiers: [...profileIdentifiers],
  };
};

export const isAccountVerifiedInteractionResult = (
  interaction: AnonymousInteractionResult
): interaction is AccountVerifiedInteractionResult => Boolean(interaction.accountId);

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

export const assignConnectorSessionResult = async (
  ctx: Context,
  provider: Provider,
  connectorSession: ConnectorSession
) => {
  const details = await provider.interactionDetails(ctx.req, ctx.res);
  await provider.interactionResult(ctx.req, ctx.res, {
    ...details.result,
    connectorSession,
  });
};

export const getConnectorSessionResult = async (
  ctx: Context,
  provider: Provider
): Promise<ConnectorSession> => {
  const { result } = await provider.interactionDetails(ctx.req, ctx.res);

  const signInResult = z
    .object({
      connectorSession: connectorSessionGuard,
    })
    .safeParse(result);

  assertThat(result && signInResult.success, 'session.connector_validation_session_not_found');

  const { connectorSession, ...rest } = result;
  await provider.interactionResult(ctx.req, ctx.res, {
    ...rest,
  });

  return signInResult.data.connectorSession;
};
