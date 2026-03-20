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
