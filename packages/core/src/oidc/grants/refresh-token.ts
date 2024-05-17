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
 * @see {@link https://github.com/panva/node-oidc-provider/blob/cf2069cbb31a6a855876e95157372d25dde2511c/lib/actions/grants/refresh_token.js | oidc-provider/lib/actions/grants/refresh_token.js} for the original code.
 *
 * @remarks
 * Since the original code is not exported, we have to copy the code here. This file should be
 * treated as a fork of the original file, which means, we should keep the code in sync with the
 * original file as much as possible.
 *
 * The commit hash of the original file is `cf2069cbb31a6a855876e95157372d25dde2511c`.
 */

import { type X509Certificate } from 'node:crypto';

import { UserScope, buildOrganizationUrn } from '@logto/core-kit';
import { type Optional, isKeyInObject, cond } from '@silverhand/essentials';
import type Provider from 'oidc-provider';
import { errors } from 'oidc-provider';
import difference from 'oidc-provider/lib/helpers/_/difference.js';
import certificateThumbprint from 'oidc-provider/lib/helpers/certificate_thumbprint.js';
import epochTime from 'oidc-provider/lib/helpers/epoch_time.js';
import filterClaims from 'oidc-provider/lib/helpers/filter_claims.js';
import resolveResource from 'oidc-provider/lib/helpers/resolve_resource.js';
import revoke from 'oidc-provider/lib/helpers/revoke.js';
import dpopValidate from 'oidc-provider/lib/helpers/validate_dpop.js';
import validatePresence from 'oidc-provider/lib/helpers/validate_presence.js';
import instance from 'oidc-provider/lib/helpers/weak_cache.js';

import { type EnvSet } from '#src/env-set/index.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

import {
  getSharedResourceServerData,
  isThirdPartyApplication,
  reversedResourceAccessTokenTtl,
  isOrganizationConsentedToApplication,
} from '../resource.js';

const {
  InvalidClient,
  InvalidGrant,
  InvalidScope,
  InsufficientScope,
  AccessDenied,
  InvalidRequest,
} = errors;

/** The grant type name. `gty` follows the name in oidc-provider. */
const gty = 'refresh_token';

/**
 * The valid parameters for the `organization_token` grant type. Note the `resource` parameter is
 * not included here since it should be handled per configuration when registering the grant type.
 */
export const parameters = Object.freeze(['refresh_token', 'organization_id', 'scope'] as const);

/**
 * The required parameters for the grant type.
 *
 * @see {@link parameters} for the full list of valid parameters.
 */
const requiredParameters = Object.freeze(['refresh_token'] as const) satisfies ReadonlyArray<
  (typeof parameters)[number]
>;

// We have to disable the rules because the original implementation is written in JavaScript and
// uses mutable variables.
/* eslint-disable @silverhand/fp/no-let, @typescript-eslint/no-non-null-assertion, @silverhand/fp/no-mutation, unicorn/no-array-method-this-argument */
export const buildHandler: (
  envSet: EnvSet,
  queries: Queries
  // eslint-disable-next-line complexity
) => Parameters<Provider['registerGrantType']>['1'] = (envSet, queries) => async (ctx, next) => {
  const { client, params, requestParamScopes, provider } = ctx.oidc;
  const { RefreshToken, Account, AccessToken, Grant, ReplayDetection, IdToken } = provider;

  assertThat(params, new InvalidGrant('parameters must be available'));
  assertThat(client, new InvalidClient('client must be available'));

  validatePresence(ctx, ...requiredParameters);

  const providerInstance = instance(provider);
  const {
    rotateRefreshToken,
    conformIdTokenClaims,
    features: {
      mTLS: { getCertificate },
      userinfo,
      resourceIndicators,
    },
  } = providerInstance.configuration();

  const dPoP = await dpopValidate(ctx);

  // @gao: I believe the presence of the param is validated by required parameters of this grant.
  // Add `String` to make TS happy.
  let refreshTokenValue = String(params.refresh_token);
  let refreshToken = await RefreshToken.find(refreshTokenValue, { ignoreExpiration: true });

  if (!refreshToken) {
    throw new InvalidGrant('refresh token not found');
  }

  if (refreshToken.clientId !== client.clientId) {
    throw new InvalidGrant('client mismatch');
  }

  if (refreshToken.isExpired) {
    throw new InvalidGrant('refresh token is expired');
  }

  let cert: Optional<string | X509Certificate>;
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- the original code uses `||`
  if (client.tlsClientCertificateBoundAccessTokens || refreshToken['x5t#S256']) {
    cert = getCertificate(ctx);
    if (!cert) {
      throw new InvalidGrant('mutual TLS client certificate not provided');
    }
  }

  if (!dPoP && client.dpopBoundAccessTokens) {
    throw new InvalidGrant('DPoP proof JWT not provided');
  }

  if (refreshToken['x5t#S256'] && refreshToken['x5t#S256'] !== certificateThumbprint(cert!)) {
    throw new InvalidGrant('failed x5t#S256 verification');
  }

  /* === RFC 0001 === */
  // The value type is `unknown`, which will swallow other type inferences. So we have to cast it
  // to `Boolean` first.
  const organizationId = cond(Boolean(params.organization_id) && String(params.organization_id));
  if (
    organizationId && // Validate if the refresh token has the required scope from RFC 0001.
    !refreshToken.scopes.has(UserScope.Organizations)
  ) {
    throw new InsufficientScope('refresh token missing required scope', UserScope.Organizations);
  }
  /* === End RFC 0001 === */

  if (!refreshToken.grantId) {
    throw new InvalidGrant('grantId not found');
  }

  const grant = await Grant.find(refreshToken.grantId, {
    ignoreExpiration: true,
  });

  if (!grant) {
    throw new InvalidGrant('grant not found');
  }

  /**
   * It's actually available on the `BaseModel` class - but missing from the typings.
   *
   * @see {@link https://github.com/panva/node-oidc-provider/blob/cf2069cbb31a6a855876e95157372d25dde2511c/lib/models/base_model.js#L128 | oidc-provider/lib/models/base_model.js#L128}
   */
  if (isKeyInObject(grant, 'isExpired') && grant.isExpired) {
    throw new InvalidGrant('grant is expired');
  }

  if (grant.clientId !== client.clientId) {
    throw new InvalidGrant('client mismatch');
  }

  if (params.scope) {
    const missing = difference([...requestParamScopes], [...refreshToken.scopes]);

    if (missing.length > 0) {
      throw new InvalidScope(
        `refresh token missing requested ${missing.length > 1 ? 'scopes' : 'scope'}`,
        missing.join(' ')
      );
    }
  }

  if (dPoP) {
    // @ts-expect-error -- code from oidc-provider
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const unique: unknown = await ReplayDetection.unique(
      client.clientId,
      dPoP.jti,
      epochTime() + 300
    );

    assertThat(unique, new errors.InvalidGrant('DPoP proof JWT Replay detected'));
  }

  if (refreshToken.jkt && (!dPoP || refreshToken.jkt !== dPoP.thumbprint)) {
    throw new InvalidGrant('failed jkt verification');
  }

  ctx.oidc.entity('RefreshToken', refreshToken);
  ctx.oidc.entity('Grant', grant);

  // @ts-expect-error -- code from oidc-provider. the original type definition does not include
  // `RefreshToken` but it's actually available.
  const account = await Account.findAccount(ctx, refreshToken.accountId, refreshToken);

  if (!account) {
    throw new InvalidGrant('refresh token invalid (referenced account not found)');
  }

  if (refreshToken.accountId !== grant.accountId) {
    throw new InvalidGrant('accountId mismatch');
  }

  ctx.oidc.entity('Account', account);

  if (refreshToken.consumed) {
    await Promise.all([refreshToken.destroy(), revoke(ctx, refreshToken.grantId)]);
    throw new InvalidGrant('refresh token already used');
  }

  /* === RFC 0001 === */

  if (organizationId) {
    // Check membership
    if (!(await queries.organizations.relations.users.exists(organizationId, account.accountId))) {
      const error = new AccessDenied('user is not a member of the organization');
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
      error.statusCode = 403;
      throw error;
    }
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
      'x5t#S256': refreshToken['x5t#S256'],
      jkt: refreshToken.jkt,
    });

    if (refreshToken.gty && !refreshToken.gty.endsWith(gty)) {
      refreshToken.gty = `${refreshToken.gty} ${gty}`;
    }

    ctx.oidc.entity('RefreshToken', refreshToken);
    refreshTokenValue = await refreshToken.save();
  }

  const at = new AccessToken({
    accountId: account.accountId,
    client,
    expiresWithSession: refreshToken.expiresWithSession,
    grantId: refreshToken.grantId!,
    gty: refreshToken.gty!,
    sessionUid: refreshToken.sessionUid,
    sid: refreshToken.sid,
    scope: undefined!,
  });

  if (client.tlsClientCertificateBoundAccessTokens) {
    // @ts-expect-error -- code from oidc-provider
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    at.setThumbprint('x5t', cert);
  }

  if (dPoP) {
    // @ts-expect-error -- code from oidc-provider
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    at.setThumbprint('jkt', dPoP.thumbprint);
  }

  if (at.gty && !at.gty.endsWith(gty)) {
    at.gty = `${at.gty} ${gty}`;
  }

  /** The scopes requested by the client. If not provided, use the scopes from the refresh token. */
  const scope = params.scope ? requestParamScopes : refreshToken.scopes;

  // Note, issue organization token only if `params.resource` is not present.
  // If resource is set, will issue normal access token with extra claim "organization_id",
  // the logic is handled in `getResourceServerInfo` and `extraTokenClaims`, see the init file of oidc-provider.
  if (organizationId && !params.resource) {
    /* === RFC 0001 === */
    const audience = buildOrganizationUrn(organizationId);
    /** All available scopes for the user in the organization. */
    const availableScopes = await queries.organizations.relations.rolesUsers
      .getUserScopes(organizationId, account.accountId)
      .then((scopes) => scopes.map(({ name }) => name));

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

  ctx.oidc.entity('AccessToken', at);
  const accessToken = await at.save();

  let idToken;
  if (scope.has('openid')) {
    const claims = filterClaims(refreshToken.claims, 'id_token', grant);
    // @ts-expect-error -- code from oidc-provider
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const rejected: string[] = grant.getRejectedOIDCClaims();
    const token = new IdToken(
      {
        ...(await account.claims('id_token', [...scope].join(' '), claims, rejected)),
        acr: refreshToken.acr,
        amr: refreshToken.amr,
        auth_time: refreshToken.authTime,
      },
      { ctx }
    );

    // eslint-disable-next-line unicorn/prefer-ternary
    if (conformIdTokenClaims && userinfo.enabled && !at.aud) {
      // @ts-expect-error -- code from oidc-provider
      token.scope = 'openid';
    } else {
      // @ts-expect-error -- code from oidc-provider
      token.scope = grant.getOIDCScopeFiltered(scope);
    }
    // @ts-expect-error -- code from oidc-provider
    token.mask = claims;
    // @ts-expect-error -- code from oidc-provider
    token.rejected = rejected;

    token.set('nonce', refreshToken.nonce);
    token.set('at_hash', accessToken);
    token.set('sid', refreshToken.sid);

    idToken = await token.issue({ use: 'idtoken' });
  }

  ctx.body = {
    access_token: accessToken,
    expires_in: at.expiration,
    id_token: idToken,
    refresh_token: refreshTokenValue,
    scope: at.scope,
    token_type: at.tokenType,
  };

  await next();
};
/* eslint-enable @silverhand/fp/no-let, @typescript-eslint/no-non-null-assertion, @silverhand/fp/no-mutation, unicorn/no-array-method-this-argument */
