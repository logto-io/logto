import {
  SessionGrantRevokeTarget,
  jwtCustomizerUserInteractionContextGuard,
  oidcSessionInstancePayloadGuard,
  userApplicationGrantPayloadGuard,
} from '@logto/schemas';
import { deduplicate, trySafe } from '@silverhand/essentials';
import type { Provider } from 'oidc-provider';

import RequestError from '#src/errors/RequestError/index.js';
import { type SessionInstanceWithExtension } from '#src/queries/oidc-session-extensions.js';
import type Queries from '#src/tenants/Queries.js';

import { revokeGrantChain } from './grant.js';
import { runNamedTasksWithSummary, serializeErrorCause } from './utils.js';

export { consent, getMissingScopes } from './consent.js';
export { assignInteractionResults } from './interaction.js';

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
