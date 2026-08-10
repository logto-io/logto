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

/** Build the 403 denial the RFC 0001 organization access checks answer with. */
const accessDenied = (message: string) => {
  const error = new AccessDenied(message);
  // eslint-disable-next-line @silverhand/fp/no-mutation -- oidc-provider errors take the HTTP status by assignment after construction
  error.statusCode = 403;
  return error;
};

type OrganizationAccessOptions = {
  envSet: EnvSet;
  queries: Queries;
  account: Account;
  isThirdParty?: boolean;
};

/**
 * Whether the user has granted this organization to this client.
 *
 * The CIMD test must come first: `isThirdPartyApplication`'s not-found fallback reads the
 * identifier URL as first-party, which would skip the user-to-client grant check entirely.
 */
const isOrganizationGrantedToClient = async (
  ctx: KoaContextWithOIDC,
  clientId: string,
  organizationId: string,
  { envSet, queries, account, isThirdParty }: OrganizationAccessOptions
): Promise<boolean> => {
  /**
   * CIMD organization access is grant-scoped, keyed on the grant behind the current refresh
   * token. Caller contract: organization tokens are only obtainable through the refresh grant —
   * CIMD `grant_types` are pinned to authorization_code + refresh_token and the fork's token
   * endpoint gates every grant type through `grantTypeAllowed`, so the client-credentials and
   * token-exchange callers never reach here with a CIMD client — and the refresh grant asserts
   * `grantId` before validating the grant, so the entity is always present. Fail closed if it
   * ever is not: at an authorization boundary a broken contract must not be distinguishable
   * from a plain denial.
   */
  if (isCimdClient(envSet, clientId)) {
    const grantId = ctx.oidc.entities.RefreshToken?.grantId;

    return grantId !== undefined && queries.cimd.grantOrganizations.exists(grantId, organizationId);
  }

  // Registered third-party applications carry the cross-grant consent relation.
  if (isThirdParty ?? (await isThirdPartyApplication(queries, clientId))) {
    return isOrganizationConsentedToApplication(
      queries,
      clientId,
      account.accountId,
      organizationId
    );
  }

  // First-party applications are implicitly granted every organization the user belongs to.
  return true;
};

/**
 * Implement access check for RFC 0001
 */
export const checkOrganizationAccess = async (
  ctx: KoaContextWithOIDC,
  options: OrganizationAccessOptions
): Promise<{ organizationId?: string }> => {
  const { queries, account } = options;
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
      throw accessDenied('user is not a member of the organization');
    }

    // Check if the organization is granted to the client by the user
    if (!(await isOrganizationGrantedToClient(ctx, client.clientId, organizationId, options))) {
      throw accessDenied('organization access is not granted to the application');
    }

    // Check if the organization requires MFA and the user has MFA enabled
    const { isMfaRequired, hasMfaConfigured } = await queries.organizations.getMfaStatus(
      organizationId,
      account.accountId
    );
    if (isMfaRequired && !hasMfaConfigured) {
      throw accessDenied('organization requires MFA but user has no MFA configured');
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
