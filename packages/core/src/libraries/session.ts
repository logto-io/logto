import type { Context } from 'koa';
import type { InteractionResults } from 'oidc-provider';
import type Provider from 'oidc-provider';
import { errors } from 'oidc-provider';

import type Queries from '#src/tenants/Queries.js';

export const assignInteractionResults = async (
  ctx: Context,
  provider: Provider,
  result: InteractionResults,
  merge = false
) => {
  // The "mergeWithLastSubmission" will only merge current request's interaction results,
  // which is stored in ctx.oidc, we need to merge interaction results in two requests,
  // have to do it manually
  // refer to: https://github.com/panva/node-oidc-provider/blob/c243bf6b6663c41ff3e75c09b95fb978eba87381/lib/actions/authorization/interactions.js#L106
  const details = merge ? await provider.interactionDetails(ctx.req, ctx.res) : undefined;

  const redirectTo = await provider.interactionResult(
    ctx.req,
    ctx.res,
    {
      // Merge with current result
      ...details?.result,
      ...result,
    },
    {
      mergeWithLastSubmission: merge,
    }
  );
  ctx.body = { redirectTo };
};

export const saveUserFirstConsentedAppId = async (
  queries: Queries,
  userId: string,
  applicationId: string
) => {
  const { findUserById, updateUserById } = queries.users;
  const { applicationId: firstConsentedAppId } = await findUserById(userId);

  if (!firstConsentedAppId) {
    // Save application id that the user first consented
    await updateUserById(userId, { applicationId });
  }
};

export const getApplicationIdFromInteraction = async (
  ctx: Context,
  provider: Provider
): Promise<string | undefined> => {
  const interaction = await provider
    .interactionDetails(ctx.req, ctx.res)
    .catch((error: unknown) => {
      // Should not block if interaction is not found
      if (error instanceof errors.SessionNotFound) {
        return null;
      }

      throw error;
    });

  if (!interaction?.params) {
    return;
  }

  return typeof interaction.params.client_id === 'string'
    ? interaction.params.client_id
    : undefined;
};
