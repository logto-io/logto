import { conditional } from '@silverhand/essentials';
import type { Context } from 'koa';
import type { InteractionResults, PromptDetail } from 'oidc-provider';
import type Provider from 'oidc-provider';
import { z } from 'zod';

import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

const updateInteractionResult = async (
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

  return provider.interactionResult(
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
};

export const assignInteractionResults = async (
  ctx: Context,
  provider: Provider,
  result: InteractionResults,
  merge = false
) => {
  const redirectTo = await updateInteractionResult(ctx, provider, result, merge);

  ctx.body = { redirectTo };
};

const saveUserFirstConsentedAppId = async (
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

// Get the missing scopes from prompt details
const missingScopesGuard = z.object({
  missingOIDCScope: z.string().array().optional(),
  missingResourceScopes: z.object({}).catchall(z.string().array()).optional(),
});

export const getMissingScopes = (prompt: PromptDetail) => {
  return missingScopesGuard.parse(prompt.details);
};

export const consent = async ({
  ctx,
  provider,
  queries,
  interactionDetails,
  missingOIDCScopes = [],
  resourceScopesToGrant = {},
  resourceScopesToReject = {},
}: {
  ctx: Context;
  provider: Provider;
  queries: Queries;
  interactionDetails: Awaited<ReturnType<Provider['interactionDetails']>>;
  missingOIDCScopes?: string[];
  resourceScopesToGrant?: Record<string, string[]>;
  resourceScopesToReject?: Record<string, string[]>;
}) => {
  const {
    session,
    grantId,
    params: { client_id },
  } = interactionDetails;

  assertThat(session, 'session.not_found');

  const { accountId } = session;

  const grant =
    conditional(grantId && (await provider.Grant.find(grantId))) ??
    new provider.Grant({ accountId, clientId: String(client_id) });

  await saveUserFirstConsentedAppId(queries, accountId, String(client_id));

  // Fulfill missing scopes
  if (missingOIDCScopes.length > 0) {
    grant.addOIDCScope(missingOIDCScopes.join(' '));
  }

  for (const [indicator, scope] of Object.entries(resourceScopesToGrant)) {
    grant.addResourceScope(indicator, scope.join(' '));
  }

  for (const [indicator, scope] of Object.entries(resourceScopesToReject)) {
    grant.rejectResourceScope(indicator, scope.join(' '));
  }

  const finalGrantId = await grant.save();

  // Configure consent
  return updateInteractionResult(ctx, provider, { consent: { grantId: finalGrantId } }, true);
};
