import { appInsights } from '@logto/app-insights/node';
import { userApplicationGrantPayloadGuard } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';
import type { KoaContextWithOIDC, Provider } from 'oidc-provider';

import { createSessionLibrary } from '#src/libraries/session.js';
import type Queries from '#src/tenants/Queries.js';
import { getConsoleLogFromContext } from '#src/utils/console.js';
import { buildAppInsightsTelemetry } from '#src/utils/request.js';

const isDefined = <T>(value: T | undefined): value is T => value !== undefined;

const getGrantIdsToRevokeForMaxAllowedGrants = ({
  activeGrants,
  maxAllowedGrants,
}: {
  activeGrants: Awaited<
    ReturnType<Queries['oidcModelInstances']['findUserActiveGrantsByClientId']>
  >;
  maxAllowedGrants: number;
}) => {
  const grantsToRevokeCount = activeGrants.length - maxAllowedGrants;

  if (grantsToRevokeCount <= 0) {
    return [];
  }

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

  return validatedGrantPayloads
    .slice()
    .sort((first, second) => first.payload.iat - second.payload.iat)
    .slice(0, grantsToRevokeCount)
    .map(({ id }) => id);
};

const enforceMaxAllowedGrantsRevocation = async (
  ctx: KoaContextWithOIDC,
  provider: Provider,
  queries: Queries
) => {
  const userId = ctx.oidc.session?.accountId;
  const clientId = ctx.oidc.client?.clientId;
  const maxAllowedGrants = ctx.oidc.client?.metadata().maxAllowedGrants;

  if (!userId || !clientId || maxAllowedGrants === undefined) {
    return;
  }

  await trySafe(
    async () => {
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

      await sessionLibrary.revokeUserGrantsByIds(provider, userId, grantIdsToRevoke);

      // TODO: Trigger a webhook event for max-allowed-grants evictions.
    },
    (error) => {
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
    }
  );
};

export const createAuthorizationSuccessListener = (provider: Provider, queries: Queries) => {
  return async (ctx: KoaContextWithOIDC) => {
    await enforceMaxAllowedGrantsRevocation(ctx, provider, queries);
  };
};
