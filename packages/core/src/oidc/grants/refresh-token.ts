/**
 * @overview This file implements the custom `refresh_token` grant which extends the original
 * `refresh_token` grant with the issuing of organization tokens (RFC 0001).
 *
 * Note the code is edited from oidc-provider, most parts are kept the same unless it requires
 * changes for TypeScript or RFC 0001.
 *
 * For "RFC 0001"-related edited parts, we added comments with `=== RFC 0001 ===` and
 * `=== End RFC 0001 ===` to indicate the changes.
 *
 * @see {@link https://github.com/logto-io/rfcs | Logto RFCs} for more information about RFC 0001.
 * @see {@link https://github.com/logto-io/node-oidc-provider/blob/d60ae9bd6d089e69f3a243119c6d87db25e837ce/lib/actions/grants/refresh_token.js | Original file}.
 *
 * @remarks
 * Since the original code is not exported, we have to copy the code here. This file should be
 * treated as a fork of the original file, which means, we should keep the code in sync with the
 * original file as much as possible.
 *
 * The original file is from the fork's `v9` branch at commit
 * `d60ae9bd6d089e69f3a243119c6d87db25e837ce`, where it is identical to the upstream v9.9.1 tag.
 * Its shared helpers (`grant_common.js` and friends) are consumed through the
 * `oidc-provider-internals.js` seam module. Following the v9 original, the ID token issued here
 * no longer carries `at_hash` (the official SDK sweep confirmed no SDK depends on it).
 *
 * Deliberate deviations from the original file:
 *
 * - `deviceCodeGty` is a local constant instead of a deep import of the upstream `device_code`
 *   grant module, which would pull in the whole grant for one string literal.
 * - The explicit `grantId not found` guard before grant validation is a Logto addition kept
 *   from the v8 fork; upstream relies on the grant lookup failing instead.
 */

import { UserScope } from '@logto/core-kit';
import { noop } from '@silverhand/essentials';
import { errors, type Provider } from 'oidc-provider';

import { type EnvSet } from '#src/env-set/index.js';
import { assertUserHasApplicationAccessForOidc } from '#src/oidc/application-access-control.js';
import {
  applyMtlsBinding,
  buildTokenResponse,
  certificateThumbprint,
  checkAccountMismatch,
  checkAttestBinding,
  checkDpopRequired,
  checkRar,
  createAccessToken,
  CHALLENGE_OK_WINDOW,
  difference,
  dpopValidate,
  epochTime,
  getProviderConfiguration,
  type GrantTypeHandler,
  issueIdToken,
  pluralize,
  type ReplayDetectionClass,
  resolveResource,
  revoke,
  validateAccount,
  validateGrant,
  validatePresence,
} from '#src/oidc/oidc-provider-internals.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

import { handleOrganizationToken, checkOrganizationAccess } from './utils.js';

const { InvalidClient, InvalidGrant, InvalidRequest, InvalidScope, InsufficientScope } = errors;

/** The grant type name. `gty` follows the name in oidc-provider. */
const gty = 'refresh_token';

/**
 * The `gty` of the upstream `device_code` grant. The original file imports it from the sibling
 * `device_code.js` grant module; hardcoded here to avoid deep-importing a whole grant for one
 * string literal.
 */
const deviceCodeGty = 'device_code';

/**
 * The `RefreshToken` instance widened with v9 runtime properties missing from
 * `@types/oidc-provider`: `rar` (RFC 9396 authorization details) and `attestationJkt`
 * (attestation-based client authentication binding).
 */
type WidenedRefreshToken = InstanceType<Provider['RefreshToken']> & {
  rar?: unknown;
  attestationJkt?: string;
};

/**
 * The valid parameters for the `refresh_token` grant type. Note the `resource` parameter is
 * not included here since it should be handled per configuration when registering the grant type.
 */
export const parameters = Object.freeze(['refresh_token', 'scope', 'organization_id']);

/**
 * The required parameters for the grant type.
 *
 * @see {@link parameters} for the full list of valid parameters.
 */
const requiredParameters = Object.freeze(['refresh_token']) satisfies ReadonlyArray<
  (typeof parameters)[number]
>;

// We have to disable the rules because the original implementation is written in JavaScript and
// uses mutable variables.
/* eslint-disable complexity, @silverhand/fp/no-let, @typescript-eslint/no-non-null-assertion, @silverhand/fp/no-mutation, unicorn/no-array-method-this-argument */
const rarSupported = (token: WidenedRefreshToken) => {
  const [origin] = token.gty!.split(' ');
  return origin !== deviceCodeGty;
};

type Handler = (
  envSet: EnvSet,
  queries: Queries,
  applicationAccessControl: Libraries['applicationAccessControl']
) => GrantTypeHandler;

export const buildHandler: Handler = (envSet, queries, appAccess) => async (ctx) => {
  const { client, params, requestParamScopes, provider } = ctx.oidc;

  assertThat(params, new InvalidGrant('parameters must be available'));
  assertThat(client, new InvalidClient('client must be available'));

  validatePresence(ctx, ...requiredParameters);

  const {
    findAccount,
    conformIdTokenClaims,
    rotateRefreshToken,
    features: {
      userinfo,
      mTLS: { getCertificate },
      dPoP: { allowReplay },
      resourceIndicators,
      richAuthorizationRequests,
    },
  } = getProviderConfiguration(provider);

  const { RefreshToken, AccessToken, ReplayDetection } = provider;

  const dPoP = await dpopValidate(ctx);

  // @gao: I believe the presence of the param is validated by required parameters of this grant.
  // Add `String` to make TS happy.
  let refreshTokenValue = String(params.refresh_token);
  let refreshToken: WidenedRefreshToken | undefined = await RefreshToken.find(refreshTokenValue, {
    ignoreExpiration: true,
  });

  if (!refreshToken) {
    throw new InvalidGrant('refresh token not found');
  }

  if (refreshToken.clientId !== client.clientId) {
    throw new InvalidGrant('client mismatch');
  }

  if (refreshToken.isExpired) {
    throw new InvalidGrant('refresh token is expired');
  }

  let cert: ReturnType<typeof getCertificate>;
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  if (client.tlsClientCertificateBoundAccessTokens || refreshToken['x5t#S256']) {
    cert = getCertificate(ctx);
    if (!cert) {
      throw new InvalidGrant('mutual TLS client certificate not provided');
    }
  }

  checkDpopRequired(ctx, dPoP);

  if (refreshToken['x5t#S256'] && refreshToken['x5t#S256'] !== certificateThumbprint(cert!)) {
    throw new InvalidGrant('failed x5t#S256 verification');
  }

  if (!refreshToken.grantId) {
    throw new InvalidGrant('grantId not found');
  }

  const grant = await validateGrant(ctx, refreshToken.grantId);

  if (params.scope) {
    const missing = difference([...requestParamScopes], [...refreshToken.scopes]);

    if (missing.length > 0) {
      throw new InvalidScope(
        `refresh token missing requested ${pluralize('scope', missing.length)}`,
        missing.join(' ')
      );
    }
  }

  if (dPoP && !allowReplay) {
    // eslint-disable-next-line no-restricted-syntax -- widen with the static method missing from the typings, see `ReplayDetectionClass`
    const unique = await (ReplayDetection as ReplayDetectionClass).unique(
      client.clientId,
      dPoP.jti,
      epochTime() + CHALLENGE_OK_WINDOW
    );

    assertThat(unique, new InvalidGrant('DPoP proof JWT Replay detected'));
  }

  if (refreshToken.jkt && (!dPoP || refreshToken.jkt !== dPoP.thumbprint)) {
    throw new InvalidGrant('failed jkt verification');
  }

  if (client.clientAuthMethod === 'attest_jwt_client_auth') {
    await checkAttestBinding(ctx, refreshToken);
  }

  ctx.oidc.entity('RefreshToken', refreshToken);
  ctx.oidc.entity('Grant', grant);

  const account = await validateAccount(ctx, findAccount, refreshToken, 'refresh token');
  checkAccountMismatch(refreshToken, grant);

  ctx.oidc.entity('Account', account);

  if (refreshToken.consumed) {
    await Promise.all([refreshToken.destroy(), revoke(ctx, refreshToken.grantId)]);
    throw new InvalidGrant('refresh token already used');
  }

  if (params.authorization_details && !rarSupported(refreshToken)) {
    throw new InvalidRequest('authorization_details is unsupported for this refresh token');
  }

  /* === RFC 0001 === */
  await assertUserHasApplicationAccessForOidc(
    appAccess,
    client.clientId,
    account.accountId,
    client.metadata().appLevelAccessControlEnabled
  );

  const { organizationId } = await checkOrganizationAccess(ctx, queries, account);

  if (
    organizationId && // Validate if the refresh token has the required scope from RFC 0001.
    !refreshToken.scopes.has(UserScope.Organizations)
  ) {
    throw new InsufficientScope('refresh token missing required scope', UserScope.Organizations);
  }
  /* === End RFC 0001 === */

  if (
    rotateRefreshToken === true ||
    (typeof rotateRefreshToken === 'function' && (await rotateRefreshToken(ctx)))
  ) {
    await refreshToken.consume();
    ctx.oidc.entity('RotatedRefreshToken', refreshToken);

    refreshToken = new RefreshToken({
      accountId: refreshToken.accountId,
      acr: refreshToken.acr,
      amr: refreshToken.amr,
      authTime: refreshToken.authTime,
      claims: refreshToken.claims,
      client,
      expiresWithSession: refreshToken.expiresWithSession,
      iiat: refreshToken.iiat,
      grantId: refreshToken.grantId,
      gty: refreshToken.gty!,
      nonce: refreshToken.nonce,
      resource: refreshToken.resource,
      rotations: typeof refreshToken.rotations === 'number' ? refreshToken.rotations + 1 : 1,
      scope: refreshToken.scope!,
      sessionUid: refreshToken.sessionUid,
      sid: refreshToken.sid,
      rar: refreshToken.rar,
      'x5t#S256': refreshToken['x5t#S256'],
      jkt: refreshToken.jkt,
      attestationJkt: refreshToken.attestationJkt,
    });

    if (refreshToken.gty && !refreshToken.gty.endsWith(gty)) {
      refreshToken.gty = `${refreshToken.gty} ${gty}`;
    }

    ctx.oidc.entity('RefreshToken', refreshToken);
    refreshTokenValue = await refreshToken.save();
  }

  const at = createAccessToken(
    ctx,
    AccessToken,
    {
      accountId: account.accountId,
      expiresWithSession: refreshToken.expiresWithSession,
      grantId: refreshToken.grantId,
      sessionUid: refreshToken.sessionUid,
      sid: refreshToken.sid,
    },
    refreshToken.gty!
  );

  applyMtlsBinding(at, cert);

  if (dPoP) {
    at.setThumbprint('jkt', dPoP.thumbprint);
  }

  if (at.gty && !at.gty.endsWith(gty)) {
    at.gty = `${at.gty} ${gty}`;
  }

  /** The scopes requested by the client. If not provided, use the scopes from the refresh token. */
  const scope = params.scope ? requestParamScopes : refreshToken.scopes;
  await checkRar(ctx, noop);

  // Note, issue organization token only if `params.resource` is not present.
  // If resource is set, we will issue normal access token with extra claim "organization_id",
  // the logic is handled in `getResourceServerInfo` and `extraTokenClaims`, see the init file of oidc-provider.
  if (organizationId && !params.resource) {
    /* === RFC 0001 === */
    /** All available scopes for the user in the organization. */
    const availableScopes = await queries.organizations.relations.usersRoles
      .getUserScopes(organizationId, account.accountId)
      .then((scopes) => scopes.map(({ name }) => name));
    await handleOrganizationToken({
      envSet,
      availableScopes,
      accessToken: at,
      organizationId,
      scope,
    });
    /* === End RFC 0001 === */
  } else {
    const resource = await resolveResource(
      ctx,
      refreshToken,
      { userinfo, resourceIndicators },
      scope
    );

    if (resource) {
      const resourceServerInfo = await resourceIndicators.getResourceServerInfo(
        ctx,
        resource,
        client
      );
      // @ts-expect-error -- code from oidc-provider
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      at.resourceServer = new provider.ResourceServer(resource, resourceServerInfo);
      at.scope = grant.getResourceScopeFiltered(
        resource,
        // @ts-expect-error -- code from oidc-provider
        [...scope].filter(Set.prototype.has.bind(at.resourceServer.scopes))
      );
    } else {
      at.claims = refreshToken.claims;
      at.scope = grant.getOIDCScopeFiltered(scope);
    }
  }

  if (richAuthorizationRequests.enabled && at.resourceServer) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- `@types/oidc-provider` types the members of this experimental feature as `any`
    at.rar = await richAuthorizationRequests.rarForRefreshTokenResponse(ctx, at.resourceServer);
  }

  ctx.oidc.entity('AccessToken', at);
  const accessToken = await at.save();

  const idToken = await issueIdToken(
    ctx,
    refreshToken,
    at,
    grant,
    { conformIdTokenClaims, userinfo },
    scope
  );

  ctx.body = buildTokenResponse(at, accessToken, {
    idToken,
    refreshToken: refreshTokenValue,
    source: refreshToken,
    rar: at.rar,
  });
};
/* eslint-enable complexity, @silverhand/fp/no-let, @typescript-eslint/no-non-null-assertion, @silverhand/fp/no-mutation, unicorn/no-array-method-this-argument */
