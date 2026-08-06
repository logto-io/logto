import { buildOrganizationUrn } from '@logto/core-kit';
import { cond } from '@silverhand/essentials';
import { errors } from 'oidc-provider';
import type { Provider, Account, KoaContextWithOIDC } from 'oidc-provider';

import { type EnvSet } from '#src/env-set/index.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

import { isCimdClientId } from '../cimd/client-id.js';
import { isCimdEffectivelyEnabled } from '../cimd/index.js';
import {
  getSharedResourceServerData,
  isOrganizationConsentedToApplication,
  isThirdPartyApplication,
  reversedResourceAccessTokenTtl,
} from '../resource.js';

const { InvalidGrant, InvalidClient, AccessDenied } = errors;

/**
 * Implement access check for RFC 0001
 */
export const checkOrganizationAccess = async (
  ctx: KoaContextWithOIDC,
  envSet: EnvSet,
  queries: Queries,
  account: Account,
  isThirdParty?: boolean
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

    // DEV: CIMD (client ID metadata document) support
    /**
     * A CIMD identifier would silently fall through `isThirdPartyApplication` — the not-found
     * fallback reads as first-party — while also querying the applications table with the URL.
     * Keep the skip explicit instead: organization grants are keyed to registered applications
     * (`application_user_consent_organizations`), and the grant-scoped check for CIMD clients
     * lands with LOG-13930. Until then organization tokens for CIMD clients stay gated by the
     * membership check above and the MFA check below.
     */
    const isCimdClient = isCimdEffectivelyEnabled(envSet) && isCimdClientId(client.clientId);

    // Check if the organization is granted (third-party application only) by the user
    if (
      !isCimdClient &&
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
