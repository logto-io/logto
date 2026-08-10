import { buildOrganizationUrn } from '@logto/core-kit';
import { cond } from '@silverhand/essentials';
import { errors } from 'oidc-provider';
import type { Provider, Account, KoaContextWithOIDC } from 'oidc-provider';

import { type EnvSet } from '#src/env-set/index.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

import { isCimdClient } from '../cimd/index.js';
import {
  getSharedResourceServerData,
  isOrganizationConsentedToApplication,
  isThirdPartyApplication,
  reversedResourceAccessTokenTtl,
} from '../resource.js';

const { InvalidGrant, InvalidClient, AccessDenied } = errors;

/**
 * Assert the organization was authorized on the grant behind the current refresh token, reading
 * `cimd_grant_organizations`. Caller contract: organization tokens are only obtainable through
 * the refresh grant — CIMD `grant_types` are pinned to authorization_code + refresh_token and
 * the fork's token endpoint gates every grant type through `grantTypeAllowed`, so the
 * client-credentials and token-exchange callers never reach here with a CIMD client — and the
 * refresh grant asserts `grantId` before validating the grant, so the refresh token entity is
 * always present on this path. Fail closed if it ever is not.
 */
const assertCimdOrganizationGrantAccess = async (
  ctx: KoaContextWithOIDC,
  queries: Queries,
  organizationId: string
) => {
  const grantId = ctx.oidc.entities.RefreshToken?.grantId;

  if (!grantId || !(await queries.cimd.grantOrganizations.exists(grantId, organizationId))) {
    const error = new AccessDenied('organization access is not granted to the application');
    // eslint-disable-next-line @silverhand/fp/no-mutation -- oidc-provider errors take the HTTP status by assignment after construction
    error.statusCode = 403;
    throw error;
  }
};

/**
 * Implement access check for RFC 0001
 */
export const checkOrganizationAccess = async (
  ctx: KoaContextWithOIDC,
  {
    envSet,
    queries,
    account,
    isThirdParty,
  }: {
    envSet: EnvSet;
    queries: Queries;
    account: Account;
    isThirdParty?: boolean;
  }
): Promise<{ organizationId?: string }> => {
  const { client, params } = ctx.oidc;

  assertThat(params, new InvalidGrant('parameters must be available'));
  assertThat(client, new InvalidClient('client must be available'));

  const organizationId = cond(Boolean(params.organization_id) && String(params.organization_id));

  if (organizationId) {
    // Check membership
    if (
      !(await queries.organizations.relations.users.exists({
        organizationId,
        userId: account.accountId,
      }))
    ) {
      const error = new AccessDenied('user is not a member of the organization');
      // eslint-disable-next-line @silverhand/fp/no-mutation
      error.statusCode = 403;
      throw error;
    }

    /**
     * CIMD organization access is grant-scoped (`cimd_grant_organizations`), not the cross-grant
     * relation registered third-party applications use. The branch must come before
     * `isThirdPartyApplication`, whose not-found fallback reads the identifier URL as
     * first-party and would silently skip the user-to-client grant check.
     */
    if (isCimdClient(envSet, client.clientId)) {
      await assertCimdOrganizationGrantAccess(ctx, queries, organizationId);
    } else if (
      // Check if the organization is granted (third-party application only) by the user
      (isThirdParty ?? (await isThirdPartyApplication(queries, client.clientId))) &&
      !(await isOrganizationConsentedToApplication(
        queries,
        client.clientId,
        account.accountId,
        organizationId
      ))
    ) {
      const error = new AccessDenied('organization access is not granted to the application');
      // eslint-disable-next-line @silverhand/fp/no-mutation
      error.statusCode = 403;
      throw error;
    }

    // Check if the organization requires MFA and the user has MFA enabled
    const { isMfaRequired, hasMfaConfigured } = await queries.organizations.getMfaStatus(
      organizationId,
      account.accountId
    );
    if (isMfaRequired && !hasMfaConfigured) {
      const error = new AccessDenied('organization requires MFA but user has no MFA configured');
      // eslint-disable-next-line @silverhand/fp/no-mutation
      error.statusCode = 403;
      throw error;
    }
  }

  return { organizationId };
};

/**
 * Implement organization token for RFC 0001
 */
export const handleOrganizationToken = async ({
  envSet,
  availableScopes,
  accessToken: at,
  organizationId,
  scope,
}: {
  envSet: EnvSet;
  availableScopes: string[];
  accessToken: InstanceType<Provider['AccessToken']> | InstanceType<Provider['ClientCredentials']>;
  organizationId: string;
  scope: Set<string>;
}): Promise<void> => {
  /* eslint-disable @silverhand/fp/no-mutation */
  const audience = buildOrganizationUrn(organizationId);

  /** The intersection of the available scopes and the requested scopes. */
  const issuedScopes = availableScopes.filter((name) => scope.has(name)).join(' ');

  at.aud = audience;
  // Note: the original implementation uses `new provider.ResourceServer` to create the resource
  // server. But it's not available in the typings. The class is actually very simple and holds
  // no provider-specific context. So we just create the object manually.
  // See https://github.com/panva/node-oidc-provider/blob/cf2069cbb31a6a855876e95157372d25dde2511c/lib/helpers/resource_server.js
  at.resourceServer = {
    ...getSharedResourceServerData(envSet),
    accessTokenTTL: reversedResourceAccessTokenTtl,
    audience,
    scope: availableScopes.join(' '),
  };
  at.scope = issuedScopes;

  /* eslint-enable @silverhand/fp/no-mutation */
};
