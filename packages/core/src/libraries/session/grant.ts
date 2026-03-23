import { deduplicate } from '@silverhand/essentials';
import type { Provider } from 'oidc-provider';

import RequestError from '#src/errors/RequestError/index.js';

import { runNamedTasksWithSummary, serializeErrorCause } from './utils.js';

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
export const revokeGrantChain = async (provider: Provider, grantId: string) => {
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

const isGrantExpired = (grant: { exp?: number }) =>
  typeof grant.exp === 'number' && grant.exp <= Date.now() / 1000;

export const revokeUserGrantById = async (provider: Provider, userId: string, grantId: string) => {
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
};

/**
 * Revokes multiple grant chains and returns a batch execution summary.
 *
 * This method does not throw on per-grant failures. Every unique grant ID is attempted,
 * and failures are returned in `failedTasks` with normalized causes.
 *
 * Intended for upstream callers that already validated ownership and expiry, then decide
 * how to handle partial failures based on the returned summary.
 */
export const revokeUserGrantsByIds = async (provider: Provider, grantIds: string[]) => {
  const uniqueGrantIds = deduplicate(grantIds);
  return runNamedTasksWithSummary({
    items: uniqueGrantIds,
    getName: (grantId) => grantId,
    runner: async (grantId) => {
      // Intentionally call `revokeGrantChain` directly instead of `revokeUserGrantById`.
      // Upstream already ensures these grantIds belong to the user and are non-expired.
      await revokeGrantChain(provider, grantId);
    },
    normalizeCause: serializeErrorCause,
    concurrency: 5, // Revoke in parallel with a reasonable concurrency limit
  });
};
