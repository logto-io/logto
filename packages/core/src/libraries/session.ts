import { jsonObjectGuard } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import type { Context } from 'koa';
import type { InteractionResults, PromptDetail, Provider } from 'oidc-provider';
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

/**
 * Persists the interaction's `lastSubmission` information to the session for future reference.
 *
 * @remarks
 * Interaction lifecycle:
 * 1. User visits the /authorization endpoint. No session is found, so a new `login` interaction is created and the user is prompted to log in.
 * 2. The user completes and submits the `login` interaction with their authenticated `accountId` and interaction details.
 * 3. The `login` interaction is destroyed and removed from the `oidc_model_instances` database.
 * 4. A new authentication session is created with the `accountId` and saved to the `oidc_model_instances` database.
 * 5. If no grant is found, a new `consent` interaction is created and the user is prompted to provide consent.
 * 6. The user completes the consent form or is auto-consented for the requested scopes, then submits the `consent` interaction with the `grantId`.
 * 7. The `consent` interaction is destroyed and removed from the `oidc_model_instances` database.
 * 8. A new `Grant` is created and saved to the database, and the session is updated with the grant information.
 *
 * In the OIDC provider implementation, a user authentication session is created only after a successful `login` interaction submission.
 * The original interaction instance is then destroyed and removed from the `oidc_model_instances` database, making it impossible to retrieve the user's original interaction details for the active session.
 * To address this, we manually persist the `lastSubmission` information from the interaction details to the session.
 *
 * This function should be called at the user consent step, after the authentication session is created
 * and before the `consent` interaction is destroyed. It retrieves both the session uid and `lastSubmission` from the interaction details,
 * and stores them in the `oidc_session_extensions` table.
 */
const saveInteractionLastSubmissionToSession = async (
  queries: Queries,
  interactionDetails: Awaited<ReturnType<Provider['interactionDetails']>>
) => {
  const {
    session,
    lastSubmission,
    params: { client_id: clientId },
  } = interactionDetails;

  if (!session || !lastSubmission) {
    return;
  }

  const { oidcSessionExtensions } = queries;
  const result = jsonObjectGuard.safeParse(lastSubmission);

  if (result.success) {
    // Persist the last submission to the session extensions
    await oidcSessionExtensions.insert({
      sessionUid: session.uid,
      accountId: session.accountId,
      lastSubmission: result.data,
      ...conditional(typeof clientId === 'string' && { clientId }),
    });
  }
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

  await Promise.all([
    saveUserFirstConsentedAppId(queries, accountId, String(client_id)),
    saveInteractionLastSubmissionToSession(queries, interactionDetails),
  ]);

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
