import { buildOrganizationUrn } from '@logto/core-kit';
import { cond } from '@silverhand/essentials';
import type Provider from 'oidc-provider';
import { type Account, errors, type KoaContextWithOIDC } from 'oidc-provider';
import certificateThumbprint from 'oidc-provider/lib/helpers/certificate_thumbprint.js';
import epochTime from 'oidc-provider/lib/helpers/epoch_time.js';
import dpopValidate from 'oidc-provider/lib/helpers/validate_dpop.js';
import instance from 'oidc-provider/lib/helpers/weak_cache.js';

import { type EnvSet } from '#src/env-set/index.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

import {
  getSharedResourceServerData,
  isOrganizationConsentedToApplication,
  isThirdPartyApplication,
  reversedResourceAccessTokenTtl,
} from '../resource.js';

const { InvalidGrant, InvalidClient, AccessDenied } = errors;

/**
 * Handle DPoP bound access tokens.
 */
export const handleDPoP = async (
  ctx: KoaContextWithOIDC,
  token: InstanceType<Provider['AccessToken']> | InstanceType<Provider['ClientCredentials']>,
  originalToken?: InstanceType<Provider['RefreshToken']>
) => {
  const { client } = ctx.oidc;
  assertThat(client, new InvalidClient('client must be available'));

  const dPoP = await dpopValidate(ctx);

  if (dPoP) {
    // @ts-expect-error -- code from oidc-provider
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const unique: unknown = await ReplayDetection.unique(
      client.clientId,
      dPoP.jti,
      epochTime() + 300
    );

    assertThat(unique, new InvalidGrant('DPoP proof JWT Replay detected'));

    // @ts-expect-error -- code from oidc-provider
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    token.setThumbprint('jkt', dPoP.thumbprint);
  } else if (client.dpopBoundAccessTokens) {
    throw new InvalidGrant('DPoP proof JWT not provided');
  }

  if (originalToken?.jkt && (!dPoP || originalToken.jkt !== dPoP.thumbprint)) {
    throw new InvalidGrant('failed jkt verification');
  }
};

/**
 * Handle client certificate bound access tokens.
 */
export const handleClientCertificate = async (
  ctx: KoaContextWithOIDC,
  token: InstanceType<Provider['AccessToken']> | InstanceType<Provider['ClientCredentials']>,
  originalToken?: InstanceType<Provider['RefreshToken']>
) => {
  const { client, provider } = ctx.oidc;
  assertThat(client, new InvalidClient('client must be available'));

  const providerInstance = instance(provider);
  const {
    features: {
      mTLS: { getCertificate },
    },
  } = providerInstance.configuration();

  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  if (client.tlsClientCertificateBoundAccessTokens || originalToken?.['x5t#S256']) {
    const cert = getCertificate(ctx);

    if (!cert) {
      throw new InvalidGrant('mutual TLS client certificate not provided');
    }
    // @ts-expect-error -- code from oidc-provider
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    token.setThumbprint('x5t', cert);

    if (originalToken?.['x5t#S256'] && originalToken['x5t#S256'] !== certificateThumbprint(cert)) {
      throw new InvalidGrant('failed x5t#S256 verification');
    }
  }
};

/**
 * Implement access check for RFC 0001
 */
export const checkOrganizationAccess = async (
  ctx: KoaContextWithOIDC,
  queries: Queries,
  account: Account
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

    // Check if the organization is granted (third-party application only) by the user
    if (
      (await isThirdPartyApplication(queries, client.clientId)) &&
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
