/* eslint-disable max-lines */
import {
  SessionGrantRevokeTarget,
  jsonObjectGuard,
  jwtCustomizerUserInteractionContextGuard,
  oidcSessionInstancePayloadGuard,
  userApplicationGrantPayloadGuard,
} from '@logto/schemas';
import { normalizeError } from '@logto/shared';
import { conditional, deduplicate, pick, trySafe } from '@silverhand/essentials';
import type { Context } from 'koa';
import type { InteractionResults, PromptDetail, Provider } from 'oidc-provider';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';
import { runNamedTasksWithSummary } from '#src/utils/promise.js';

import { type SessionInstanceWithExtension } from '../queries/oidc-session-extensions.js';

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

/* ================ Session management =============== */

const formatSessionWithExtension = (session: SessionInstanceWithExtension) => {
  const { lastSubmission, clientId, accountId, payload, ...rest } = session;

  const interactionContextResult =
    jwtCustomizerUserInteractionContextGuard.safeParse(lastSubmission);

  const payloadResult = oidcSessionInstancePayloadGuard.safeParse(payload);

  if (!payloadResult.success) {
    throw new RequestError(
      { code: 'oidc.invalid_session_payload', status: 500 },
      {
        cause: payloadResult.error,
      }
    );
  }

  return {
    ...rest,
    payload: payloadResult.data,
    lastSubmission: interactionContextResult.success ? interactionContextResult.data : null,
    clientId,
    accountId,
  };
};

const formatApplicationGrant = (
  grant: Awaited<
    ReturnType<Queries['oidcModelInstances']['findUserActiveApplicationGrants']>
  >[number]
) => {
  const payloadResult = userApplicationGrantPayloadGuard.safeParse(grant.payload);

  if (!payloadResult.success) {
    // Should not happen
    throw new RequestError(
      { code: 'oidc.invalid_grant', status: 500 },
      {
        cause: payloadResult.error,
      }
    );
  }

  return {
    id: grant.id,
    payload: payloadResult.data,
    expiresAt: grant.expiresAt,
  };
};

type SessionAuthorizationDetails = {
  grantId?: string;
};

type SessionAuthorizations = Record<string, SessionAuthorizationDetails>;

const pickGrantIds = (entries: Array<[string, SessionAuthorizationDetails]>) =>
  entries.flatMap(([, { grantId }]) => (grantId ? [grantId] : []));

const isGrantExpired = (grant: { exp?: number }) =>
  typeof grant.exp === 'number' && grant.exp <= Date.now() / 1000;

const serializeErrorCause = (error: unknown) => {
  if (error instanceof RequestError) {
    /** @see RequestError.toBody */
    return pick(error, 'code', 'data', 'details');
  }

  return normalizeError(error).message;
};

type GrantRevocationModelName =
  | 'AccessToken'
  | 'RefreshToken'
  | 'AuthorizationCode'
  | 'DeviceCode'
  | 'BackchannelAuthenticationRequest'
  | 'Grant';

/**
 * Revokes all OIDC model records associated with a grant ID.
 *
 * This method intentionally attempts every model revoke handler and aggregates
 * failures, so callers get a complete error summary instead of a fail-fast error.
 *
 * Throws `oidc.failed_to_revoke_grant` with:
 * - `details.succeededModels`: model names successfully revoked.
 * - `details.failedModels`: failed model entries with `{ name, cause }`.
 */
const revokeGrantChain = async (provider: Provider, grantId: string) => {
  const revokeHandlers: Array<{
    name: GrantRevocationModelName;
    handler: () => Promise<unknown>;
  }> = [
    { name: 'AccessToken', handler: async () => provider.AccessToken.revokeByGrantId(grantId) },
    { name: 'RefreshToken', handler: async () => provider.RefreshToken.revokeByGrantId(grantId) },
    {
      name: 'AuthorizationCode',
      handler: async () => provider.AuthorizationCode.revokeByGrantId(grantId),
    },
    { name: 'DeviceCode', handler: async () => provider.DeviceCode.revokeByGrantId(grantId) },
    {
      name: 'BackchannelAuthenticationRequest',
      handler: async () => provider.BackchannelAuthenticationRequest.revokeByGrantId(grantId),
    },
    { name: 'Grant', handler: async () => provider.Grant.adapter.destroy(grantId) },
  ];

  const { succeededNames: succeededModels, failedTasks: failedModels } =
    await runNamedTasksWithSummary({
      items: revokeHandlers,
      getName: ({ name }) => name,
      runner: async ({ handler }) => {
        await handler();
      },
      normalizeCause: serializeErrorCause,
    });

  if (failedModels.length > 0) {
    throw new RequestError(
      { code: 'oidc.failed_to_revoke_grant', status: 500 },
      {
        details: {
          succeededModels,
          failedModels,
        },
      }
    );
  }
};

export const createSessionLibrary = (queries: Queries) => {
  const { oidcSessionExtensions } = queries;

  const findUserActiveSessionsWithExtensions = async (userId: string) => {
    const result = await oidcSessionExtensions.findUserActiveSessionsWithExtensions(userId);

    const formattedResult = result.map((session) => formatSessionWithExtension(session));

    return formattedResult;
  };

  const findUserActiveSessionWithExtension = async (userId: string, sessionId: string) => {
    const result = await oidcSessionExtensions.findUserActiveSessionWithExtension(
      userId,
      sessionId
    );

    if (!result) {
      return null;
    }

    return formatSessionWithExtension(result);
  };

  const findUserActiveApplicationGrants = async (
    userId: string,
    applicationType?: 'thirdParty' | 'firstParty'
  ) => {
    const result = await queries.oidcModelInstances.findUserActiveApplicationGrants(
      userId,
      applicationType
    );

    return result.map((grant) => formatApplicationGrant(grant));
  };

  const revokeSessionAssociatedGrants = async ({
    provider,
    authorizations,
    target,
  }: {
    provider: Provider;
    authorizations: SessionAuthorizations;
    target: SessionGrantRevokeTarget;
  }) => {
    const authorizationEntries = Object.entries(authorizations);

    if (authorizationEntries.length === 0) {
      return;
    }

    const grantIds =
      target === SessionGrantRevokeTarget.All
        ? pickGrantIds(authorizationEntries)
        : await (async () => {
            const applicationIds = authorizationEntries.map(([clientId]) => clientId);
            const applications = await queries.applications.findApplicationsByIds(
              deduplicate(applicationIds)
            );
            const firstPartyApplicationIds = new Set(
              applications
                .filter((application) => !application.isThirdParty)
                .map((application) => application.id)
            );

            return pickGrantIds(
              authorizationEntries.filter(([clientId]) => firstPartyApplicationIds.has(clientId))
            );
          })();

    const uniqueGrantIds = deduplicate(grantIds);

    await Promise.all(
      uniqueGrantIds.map(async (grantId) => {
        await revokeGrantChain(provider, grantId);
        // Note: Unlike end_session request.
        // We do not have oidc context here so we cannot trigger the `grant.revoked` event here.
        // This is a known limitation.
      })
    );
  };

  const removeUserSessionAuthorizationByGrantId = async (
    provider: Provider,
    userId: string,
    grantId: string
  ) => {
    const sessionReference = await queries.oidcModelInstances.findUserActiveSessionUidByGrantId(
      userId,
      grantId
    );

    if (!sessionReference) {
      return;
    }

    const session = await provider.Session.findByUid(sessionReference.sessionUid);

    if (!session || session.accountId !== userId || !session.authorizations) {
      return;
    }

    // Align with oidc-provider client-scoped end-session branch:
    // delete matched authorization entry + reset session identifier.
    // oidc-provider/lib/actions/end_session.js
    const authorizationEntries = Object.entries(session.authorizations);
    const filteredEntries = authorizationEntries.filter(
      ([, authorization]) => authorization.grantId !== grantId
    );

    if (filteredEntries.length === authorizationEntries.length) {
      return;
    }

    // eslint-disable-next-line @silverhand/fp/no-mutation
    session.authorizations = Object.fromEntries(filteredEntries);
    // `end_session` also clears `session.state`, but that state is specific to
    // the interactive logout flow context. Management API revocation has no such
    // OIDC route state, so we only apply authorization cleanup + identifier reset.
    session.resetIdentifier();
    await session.persist();
  };

  const removeUserSessionAuthorizationByGrantIdWithErrorCatch = async (
    provider: Provider,
    userId: string,
    grantId: string
  ) => {
    await trySafe(
      async () => {
        await removeUserSessionAuthorizationByGrantId(provider, userId, grantId);
      },
      (error) => {
        throw new RequestError(
          { code: 'oidc.failed_to_cleanup_session_authorization', status: 500 },
          { cause: error }
        );
      }
    );
  };

  const revokeUserGrantById = async (provider: Provider, userId: string, grantId: string) => {
    // eslint-disable-next-line unicorn/no-array-method-this-argument
    const grant = await provider.Grant.find(grantId, { ignoreExpiration: true });

    if (!grant) {
      throw new RequestError({ code: 'oidc.invalid_grant', status: 404 });
    }

    if (grant.accountId !== userId) {
      throw new RequestError({ code: 'oidc.invalid_grant', status: 404 });
    }

    if (!isGrantExpired(grant)) {
      await revokeGrantChain(provider, grantId);
      // Note: Same as session revoke in management API.
      // No OIDC route context is available here, so `grant.revoked` cannot be emitted safely.
    }

    await removeUserSessionAuthorizationByGrantIdWithErrorCatch(provider, userId, grantId);
  };

  const revokeUserGrantsByIds = async (provider: Provider, userId: string, grantIds: string[]) => {
    const uniqueGrantIds = deduplicate(grantIds);
    const { succeededNames: succeededGrantIds, failedTasks } = await runNamedTasksWithSummary({
      items: uniqueGrantIds,
      getName: (grantId) => grantId,
      runner: async (grantId) => {
        await revokeGrantChain(provider, grantId);
        await removeUserSessionAuthorizationByGrantIdWithErrorCatch(provider, userId, grantId);
      },
      normalizeCause: serializeErrorCause,
      concurrency: 5, // Revoke in parallel with a reasonable concurrency limit
    });

    if (failedTasks.length > 0) {
      throw new RequestError(
        { code: 'oidc.failed_to_revoke_grant', status: 500 },
        {
          details: {
            succeededGrantIds,
            failedGrants: failedTasks.map(({ name, cause }) => ({
              grantId: name,
              cause,
            })),
          },
        }
      );
    }
  };

  return {
    findUserActiveSessionsWithExtensions,
    findUserActiveSessionWithExtension,
    findUserActiveApplicationGrants,
    revokeSessionAssociatedGrants,
    revokeUserGrantById,
    revokeUserGrantsByIds,
    removeUserSessionAuthorizationByGrantId,
  };
};
/* eslint-enable max-lines */
