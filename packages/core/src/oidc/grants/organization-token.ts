/**
 * @overview This file implements the custom grant type for organization token, which is defined
 * in RFC 0001.
 *
 * Note the code is edited from the `refresh_token` grant type from [oidc-provider](https://github.com/panva/node-oidc-provider/blob/cf2069cbb31a6a855876e95157372d25dde2511c/lib/actions/grants/refresh_token.js).
 * Most parts are kept the same unless it requires changes for TypeScript or RFC 0001.
 *
 * For "RFC 0001"-related edited parts, we added comments with `=== RFC 0001 ===` and
 * `=== End RFC 0001 ===` to indicate the changes.
 *
 * @remarks
 * The original implementation supports DPoP and mutual TLS client authentication, which are not
 * enabled in Logto. So we removed related code to simplify the implementation. They can be added
 * back if needed.
 *
 * The original implementation also supports issuing ID tokens. But we don't support it for now
 * due to the lack of development type definitions in the `IdToken` class.
 */

import assert from 'node:assert';

import { UserScope, buildOrganizationUrn } from '@logto/core-kit';
import { GrantType } from '@logto/schemas';
import { isKeyInObject } from '@silverhand/essentials';
import type Provider from 'oidc-provider';
import { errors } from 'oidc-provider';
import difference from 'oidc-provider/lib/helpers/_/difference.js';
import revoke from 'oidc-provider/lib/helpers/revoke.js';
import validatePresence from 'oidc-provider/lib/helpers/validate_presence.js';
import instance from 'oidc-provider/lib/helpers/weak_cache.js';

import { type EnvSet } from '#src/env-set/index.js';
import type OrganizationQueries from '#src/queries/organizations.js';

import { getSharedResourceServerData, reversedResourceAccessTokenTtl } from '../resource.js';

const {
  InvalidClient,
  InvalidRequest,
  InvalidGrant,
  InvalidScope,
  InsufficientScope,
  AccessDenied,
} = errors;

const grantType = GrantType.OrganizationToken;

/** The valid parameters for the `organization_token` grant type. */
export const parameters = Object.freeze(['refresh_token', 'organization_id', 'scope'] as const);

/**
 * The required parameters for the `organization_token` grant type.
 *
 * @see {@link parameters} for the full list of valid parameters.
 */
const requiredParameters = Object.freeze([
  'refresh_token',
  'organization_id',
] as const) satisfies ReadonlyArray<(typeof parameters)[number]>;

/**
 * The required scope for the `urn:logto:grant-type:organization_token` grant type.
 *
 * @see {@link GrantType.OrganizationToken}
 */
const requiredScope = UserScope.Organizations;

// We have to disable the rules because the original implementation is written in JavaScript and
// uses mutable variables.
/* eslint-disable @silverhand/fp/no-let, @typescript-eslint/no-non-null-assertion, @silverhand/fp/no-mutation, unicorn/no-array-method-this-argument */
export const buildHandler: (
  envSet: EnvSet,
  queries: OrganizationQueries
  // eslint-disable-next-line complexity
) => Parameters<Provider['registerGrantType']>['1'] = (envSet, queries) => async (ctx, next) => {
  validatePresence(ctx, ...requiredParameters);

  const providerInstance = instance(ctx.oidc.provider);
  const { rotateRefreshToken } = providerInstance.configuration();
  const { client, params, requestParamScopes, provider } = ctx.oidc;
  const { RefreshToken, Account, AccessToken, Grant } = provider;

  assert(client, new InvalidClient('client must be available'));
  assert(params, new InvalidGrant('parameters must be available'));

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

  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- code from oidc-provider
  if (client.tlsClientCertificateBoundAccessTokens || refreshToken['x5t#S256']) {
    throw new InvalidRequest(
      'mutual TLS client authentication is not supported for this grant type'
    );
  }

  /* === RFC 0001 === */
  // Validate if the refresh token has the required scope from RFC 0001.
  if (!refreshToken.scopes.has(requiredScope)) {
    throw new InsufficientScope('refresh token missing required scope', requiredScope);
  }
  /* === End RFC 0001 === */

  if (!refreshToken.grantId) {
    throw new InvalidGrant('grant id not found');
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

  if (refreshToken.jkt) {
    throw new InvalidRequest('DPoP is not supported for this grant type');
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
  // Check membership
  const organizationId = String(params.organization_id);
  if (!(await queries.relations.users.exists(organizationId, account.accountId))) {
    throw new AccessDenied('user is not a member of the organization');
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

    if (refreshToken.gty && !refreshToken.gty.endsWith(grantType)) {
      refreshToken.gty = `${refreshToken.gty} ${grantType}`;
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

  if (at.gty && !at.gty.endsWith(grantType)) {
    at.gty = `${at.gty} ${grantType}`;
  }

  /* === RFC 0001 === */
  const audience = buildOrganizationUrn(organizationId);
  /** All available scopes for the user in the organization. */
  const availableScopes = await queries.relations.rolesUsers
    .getUserScopes(organizationId, account.accountId)
    .then((scopes) => scopes.map(({ name }) => name));
  /** The scopes requested by the client. If not provided, use the scopes from the refresh token. */
  const scope = params.scope ? requestParamScopes : refreshToken.scopes;
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

  ctx.oidc.entity('AccessToken', at);
  const accessToken = await at.save();

  ctx.body = {
    access_token: accessToken,
    expires_in: at.expiration,
    // `id_token: idToken` -- see the comment at the beginning of this file.
    refresh_token: refreshTokenValue,
    scope: at.scope,
    token_type: at.tokenType,
  };

  await next();
};
/* eslint-enable @silverhand/fp/no-let, @typescript-eslint/no-non-null-assertion, @silverhand/fp/no-mutation, unicorn/no-array-method-this-argument */
