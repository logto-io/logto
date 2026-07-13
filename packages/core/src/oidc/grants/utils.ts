import { buildOrganizationUrn } from '@logto/core-kit';
import { cond } from '@silverhand/essentials';
import { errors } from 'oidc-provider';
import type { Provider, Account, KoaContextWithOIDC } from 'oidc-provider';

import { type EnvSet } from '#src/env-set/index.js';
import {
  certificateThumbprint,
  dpopValidate,
  epochTime,
  getProviderConfiguration,
} from '#src/oidc/oidc-provider-internals.js';
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
 * The `ReplayDetection` model class with its static `unique` method. `@types/oidc-provider`
 * declares `unique` only as an instance method, but the runtime implements it as a static method
 * of the class. Do not declare the missing static via module augmentation: the typings export the
 * model classes with `export type` on purpose, and a value declaration would make
 * `import { ReplayDetection } from 'oidc-provider'` pass type checking while failing at runtime.
 *
 * See https://github.com/logto-io/node-oidc-provider/blob/5570006785b44e0f125ee4cb6bf540338721b1f3/lib/models/replay_detection.js
 */
type ReplayDetectionClass = Provider['ReplayDetection'] & {
  unique: (iss: string, jti: string, exp?: number) => Promise<boolean>;
};

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
    const { ReplayDetection } = ctx.oidc.provider;
    // eslint-disable-next-line no-restricted-syntax -- widen with the static method missing from the typings, see `ReplayDetectionClass`
    const unique = await (ReplayDetection as ReplayDetectionClass).unique(
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

  const {
    features: {
      mTLS: { getCertificate },
    },
  } = getProviderConfiguration(provider);

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

    // Check if the organization is granted (third-party application only) by the user
    if (
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
