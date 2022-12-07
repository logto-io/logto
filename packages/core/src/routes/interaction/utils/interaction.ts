import type { Event } from '@logto/schemas';
import type { Context } from 'koa';
import type { Provider } from 'oidc-provider';

import RequestError from '#src/errors/RequestError/index.js';
import assertThat from '#src/utils/assert-that.js';

import { anonymousInteractionResultGuard } from '../types/guard.js';
import type {
  Identifier,
  AnonymousInteractionResult,
  AccountVerifiedInteractionResult,
} from '../types/index.js';

// Unique identifier type is required
export const mergeIdentifiers = (pairs: {
  newIdentifiers?: Identifier[];
  oldIdentifiers?: Identifier[];
}) => {
  const { newIdentifiers, oldIdentifiers } = pairs;

  if (!newIdentifiers) {
    return oldIdentifiers;
  }

  if (!oldIdentifiers) {
    return newIdentifiers;
  }

  const leftOvers = oldIdentifiers.filter((oldIdentifier) => {
    return !newIdentifiers.some((newIdentifier) => newIdentifier.key === oldIdentifier.key);
  });

  return [...leftOvers, ...newIdentifiers];
};

export const isAccountVerifiedInteractionResult = (
  interaction: AnonymousInteractionResult
): interaction is AccountVerifiedInteractionResult => Boolean(interaction.accountId);

export const storeInteractionResult = async (
  interaction: Omit<AnonymousInteractionResult, 'event'> & { event?: Event },
  ctx: Context,
  provider: Provider
) => {
  // The "mergeWithLastSubmission" will only merge current request's interaction results,
  // manually merge with previous interaction results
  // refer to: https://github.com/panva/node-oidc-provider/blob/c243bf6b6663c41ff3e75c09b95fb978eba87381/lib/actions/authorization/interactions.js#L106

  const { result } = await provider.interactionDetails(ctx.req, ctx.res);

  await provider.interactionResult(
    ctx.req,
    ctx.res,
    { ...result, ...interaction },
    { mergeWithLastSubmission: true }
  );
};

export const getInteractionStorage = async (ctx: Context, provider: Provider) => {
  const { result } = await provider.interactionDetails(ctx.req, ctx.res);
  const parseResult = anonymousInteractionResultGuard.safeParse(result);

  assertThat(
    parseResult.success,
    new RequestError({ code: 'session.verification_session_not_found' })
  );

  return parseResult.data;
};
