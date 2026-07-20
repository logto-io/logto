import { appInsights } from '@logto/app-insights/node';
import {
  LogResult,
  type ExceptionHookEvent,
  type GrantLimitExceededEventData,
  userApplicationGrantPayloadGuard,
} from '@logto/schemas';
import { type ConsoleLog } from '@logto/shared';
import { trySafe } from '@silverhand/essentials';
import type { KoaContextWithOIDC, Provider } from 'oidc-provider';

import RequestError from '#src/errors/RequestError/index.js';
import { createSessionLibrary } from '#src/libraries/session/index.js';
import { assertLogContext, type LogContext } from '#src/middleware/koa-audit-log.js';
import type Queries from '#src/tenants/Queries.js';
import { getConsoleLogFromContext } from '#src/utils/console.js';
import { stringifyError } from '#src/utils/format.js';
import { buildAppInsightsTelemetry } from '#src/utils/request.js';

import { extractInteractionContext } from './utils.js';

export type TriggerEvent = (
  consoleLog: ConsoleLog,
  event: ExceptionHookEvent,
  payload: GrantLimitExceededEventData,
  metadata?: { ip?: string; userAgent?: string }
) => Promise<void>;

const isDefined = <T>(value: T | undefined): value is T => value !== undefined;
const toError = (error: unknown): Error =>
  error instanceof Error ? error : new Error(String(error));

const getGrantIdsToRevokeForMaxAllowedGrants = ({
  activeGrants,
  maxAllowedGrants,
}: {
  activeGrants: Awaited<
    ReturnType<Queries['oidcModelInstances']['findUserActiveGrantsByClientId']>
  >;
  maxAllowedGrants: number;
}) => {
  const validatedGrantPayloads = activeGrants
    .map((grant) => {
      const payloadResult = userApplicationGrantPayloadGuard.safeParse(grant.payload);

      // This should never happen in runtime because Grant payload is guaranteed by OIDC persistence.
      if (!payloadResult.success) {
        return;
      }

      return { id: grant.id, payload: payloadResult.data };
    })
    .filter((grant) => isDefined(grant));

  const grantsToRevokeCount = validatedGrantPayloads.length - maxAllowedGrants;

  if (grantsToRevokeCount <= 0) {
    return [];
  }

  return validatedGrantPayloads
    .slice()
    .sort((first, second) => first.payload.iat - second.payload.iat)
    .slice(0, grantsToRevokeCount)
    .map(({ id }) => id);
};

const enforceMaxAllowedGrantsRevocation = async (
  ctx: KoaContextWithOIDC & LogContext,
  provider: Provider,
  queries: Queries,
  triggerEvent?: TriggerEvent
) => {
  const userId = ctx.oidc.session?.accountId;
  const clientId = ctx.oidc.client?.clientId;
  const maxAllowedGrants = ctx.oidc.client?.metadata().maxAllowedGrants;

  if (!userId || !clientId || maxAllowedGrants === undefined) {
    return;
  }

  const sessionLibrary = createSessionLibrary(queries);
  const activeGrants = await queries.oidcModelInstances.findUserActiveGrantsByClientId(
    userId,
    clientId
  );
  const grantIdsToRevoke = getGrantIdsToRevokeForMaxAllowedGrants({
    activeGrants,
    maxAllowedGrants,
  });

  if (grantIdsToRevoke.length === 0) {
    return;
  }

  const revokeGrantsLog = ctx.createLog('RevokeGrants');
  revokeGrantsLog.append({
    ...extractInteractionContext(ctx),
    revokeGrantIds: grantIdsToRevoke,
    reason: 'maxAllowedGrants limit reached',
  });

  await trySafe(
    async () => {
      const revokeResult = await sessionLibrary.revokeUserGrantsByIds(provider, grantIdsToRevoke);

      // Fire webhook unconditionally after grants are revoked,
      // even if subsequent session cleanup or error logging fails.
      if (triggerEvent) {
        void trySafe(
          triggerEvent(
            getConsoleLogFromContext(ctx),
            'Grant.LimitExceeded',
            {
              userId,
              applicationId: clientId,
              revokedGrantIds: revokeResult.succeededNames,
              maxAllowedGrants,
              preRevocationActiveGrantCount: activeGrants.length,
            },
            { ip: ctx.ip, userAgent: ctx.headers['user-agent'] }
          ),
          (error) => {
            getConsoleLogFromContext(ctx).error(
              'authorization.success max-allowed-grants webhook failed:',
              error
            );
          }
        );
      }

      const cleanupResult = await sessionLibrary.removeUserSessionAuthorizationsByGrantIds(
        provider,
        userId,
        revokeResult.succeededNames
      );
      const failedRevokeGrants = revokeResult.failedTasks.map(({ name, cause }) => ({
        grantId: name,
        cause,
      }));

      if (failedRevokeGrants.length === 0 && cleanupResult.failedGrants.length === 0) {
        return;
      }

      throw new RequestError(
        { code: 'oidc.failed_to_revoke_grant', status: 500 },
        {
          details: {
            revokedGrantIds: revokeResult.succeededNames,
            failedRevokeGrants,
            failedSessionAuthorizationRemovalGrants: cleanupResult.failedGrants,
          },
        }
      );
    },
    (error) => {
      revokeGrantsLog.append({
        result: LogResult.Error,
        error: stringifyError(toError(error)),
      });

      getConsoleLogFromContext(ctx).error(
        'authorization.success max-allowed-grants failed:',
        error
      );

      const telemetry = buildAppInsightsTelemetry(ctx);
      void appInsights.trackException(error, {
        ...telemetry,
        properties: {
          ...telemetry.properties,
          event: 'oidc.authorization.max_allowed_grants_enforcement_failed',
          ...(clientId ? { oidcClientId: clientId } : {}),
          ...(userId ? { userId } : {}),
        },
      });

      throw error;
    }
  );
};

export const createAuthorizationSuccessListener = (
  provider: Provider,
  queries: Queries,
  triggerEvent?: TriggerEvent
) => {
  return async (ctx: KoaContextWithOIDC) => {
    assertLogContext(ctx);
    await enforceMaxAllowedGrantsRevocation(ctx, provider, queries, triggerEvent);
  };
};
