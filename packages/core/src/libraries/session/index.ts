import {
  SessionGrantRevokeTarget,
  jwtCustomizerUserInteractionContextGuard,
  oidcSessionInstancePayloadGuard,
  userApplicationGrantPayloadGuard,
} from '@logto/schemas';
import { deduplicate } from '@silverhand/essentials';
import type { Provider, Session } from 'oidc-provider';

import RequestError from '#src/errors/RequestError/index.js';
import { type SessionInstanceWithExtension } from '#src/queries/oidc-session-extensions.js';
import type Queries from '#src/tenants/Queries.js';

import { revokeGrantChain, revokeUserGrantById, revokeUserGrantsByIds } from './grant.js';
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

const removeSessionAuthorizationsByGrantIds = async (
  session: Session,
  userId: string,
  grantIds: string[]
) => {
  if (session.accountId !== userId || !session.authorizations || grantIds.length === 0) {
    return;
  }

  // Align with oidc-provider client-scoped end-session branch:
  // delete matched authorization entry + reset session identifier.
  // oidc-provider/lib/actions/end_session.js
  const grantIdSet = new Set(grantIds);
  const authorizationEntries = Object.entries(session.authorizations);
  const filteredEntries = authorizationEntries.filter(
    ([, authorization]) => !authorization.grantId || !grantIdSet.has(authorization.grantId)
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

    if (!session) {
      return;
    }

    await removeSessionAuthorizationsByGrantIds(session, userId, [grantId]);
  };

  const removeUserSessionAuthorizationsByGrantIds = async (
    provider: Provider,
    userId: string,
    grantIds: string[]
  ) => {
    const uniqueGrantIds = deduplicate(grantIds);

    if (uniqueGrantIds.length === 0) {
      return { succeededGrantIds: [], failedGrants: [] };
    }

    const sessionReferences = await Promise.all(
      uniqueGrantIds.map(async (grantId) => {
        const sessionReference = await queries.oidcModelInstances.findUserActiveSessionUidByGrantId(
          userId,
          grantId
        );

        return {
          grantId,
          sessionUid: sessionReference?.sessionUid,
        };
      })
    );
    const grantIdsBySessionUid = new Map<string, string[]>();

    for (const { sessionUid, grantId } of sessionReferences) {
      if (!sessionUid) {
        continue;
      }

      const sessionGrantIds = grantIdsBySessionUid.get(sessionUid);

      if (!sessionGrantIds) {
        grantIdsBySessionUid.set(sessionUid, [grantId]);
        continue;
      }

      if (!sessionGrantIds.includes(grantId)) {
        grantIdsBySessionUid.set(sessionUid, [...sessionGrantIds, grantId]);
      }
    }

    const { failedTasks } = await runNamedTasksWithSummary({
      items: Array.from(grantIdsBySessionUid.entries()),
      getName: ([sessionUid]) => sessionUid,
      runner: async ([sessionUid, sessionGrantIds]) => {
        const session = await provider.Session.findByUid(sessionUid);

        if (!session) {
          return;
        }

        await removeSessionAuthorizationsByGrantIds(session, userId, sessionGrantIds);
      },
      normalizeCause: serializeErrorCause,
      concurrency: 5,
    });

    const failedGrantCauseById = new Map<string, unknown>();

    for (const { name: sessionUid, cause } of failedTasks) {
      const sessionGrantIds = grantIdsBySessionUid.get(sessionUid) ?? [];

      for (const grantId of sessionGrantIds) {
        if (!failedGrantCauseById.has(grantId)) {
          failedGrantCauseById.set(grantId, cause);
        }
      }
    }

    return {
      succeededGrantIds: uniqueGrantIds.filter((grantId) => !failedGrantCauseById.has(grantId)),
      failedGrants: Array.from(failedGrantCauseById.entries()).map(([grantId, cause]) => ({
        grantId,
        cause,
      })),
    };
  };

  return {
    findUserActiveSessionsWithExtensions,
    findUserActiveSessionWithExtension,
    findUserActiveApplicationGrants,
    revokeSessionAssociatedGrants,
    revokeUserGrantById,
    revokeUserGrantsByIds,
    removeUserSessionAuthorizationByGrantId,
    removeUserSessionAuthorizationsByGrantIds,
  };
};
