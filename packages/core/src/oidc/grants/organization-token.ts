/**
 * @overview This file implements the custom grant type for organization token, which is defined
 * in RFC 0001.
 *
 * Note the code is edited from the `refresh_token` grant type from [oidc-provider](https://github.com/panva/node-oidc-provider/blob/cf2069cbb31a6a855876e95157372d25dde2511c/lib/actions/grants/refresh_token.js).
 * 
 * @remarks
 * The original implementation supports DPoP and mutual TLS client authentication, which are not
 * enabled in Logto. So we removed related code to simplify the implementation. They can be added
 * back if needed.
 */

import assert from 'node:assert';

import { isKeyInObject, pick } from '@silverhand/essentials';
import Provider, { ResourceServer } from 'oidc-provider';
import { errors } from 'oidc-provider';
import difference from 'oidc-provider/lib/helpers/_/difference.js';
import revoke from 'oidc-provider/lib/helpers/revoke.js';
import validatePresence from 'oidc-provider/lib/helpers/validate_presence.js';
import instance from 'oidc-provider/lib/helpers/weak_cache.js';
import { PredefinedScope } from '@logto/schemas';
import { UserScope } from '@logto/core-kit';

const { InvalidClient, InvalidGrant, InvalidScope } = errors;

/** The valid parameters for the `organization_token` grant type. */
export const parameters = Object.freeze(['refresh_token', 'organization_id', 'scope'] as const);

/**
 * The required parameters for the `organization_token` grant type.
 *
 * @see {@link parameters} for the full list of valid parameters.
 */
const requiredParameters = Object.freeze([
  'refresh_token', 'organization_id',
] as const) satisfies ReadonlyArray<(typeof parameters)[number]>;

/** The name of the `organization_token` grant type. */
export const grantType = 'urn:logto:grant-type:organization_token';
/** 
 * The required scope for the `urn:logto:grant-type:organization_token` grant type.
 * 
 * @see {@link grantType}
 */
export const requiredScope = UserScope.Organizations;

// eslint-disable-next-line complexity
export const handler: Parameters<Provider['registerGrantType']>['1'] = async (ctx, next) => {
  validatePresence(ctx, ...requiredParameters);

  const providerInstance = instance(ctx.oidc.provider);
  const {
    rotateRefreshToken,
    features: { dPoP },
  } = providerInstance.configuration();

  // providerInstance.dynamic ||= {};
  // providerInstance.dynamic['AccessToken'] = () => 'jwt';

  if (dPoP.enabled) {
    throw new InvalidGrant('DPoP is not supported for this grant type');
  }

  const { RefreshToken, Account, AccessToken, IdToken, Grant } = ctx.oidc.provider;
  const { client, params, requestParamScopes } = ctx.oidc;

  assert(client, new InvalidClient('client must be available'));
  assert(params, new InvalidGrant('parameters must be available'));

  /* === Validate refresh token === */
  // @gao: I believe the presence of the param is validated by required parameters of this grant. Add `String` to make TS happy.
  let refreshTokenValue = String(params.refresh_token);
  // eslint-disable-next-line @silverhand/fp/no-let
  let refreshToken = await RefreshToken.find(refreshTokenValue);

  if (!refreshToken) {
    throw new InvalidGrant('refresh token not found');
  }

  if (refreshToken.clientId !== client.clientId) {
    throw new InvalidGrant('client mismatch');
  }

  if (refreshToken.isExpired) {
    throw new InvalidGrant('refresh token is expired');
  }

  const certKey = 'x5t#S256';
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- code from oidc-provider
  if (client.tlsClientCertificateBoundAccessTokens || refreshToken[certKey]) {
    throw new InvalidGrant('mutual TLS client authentication is not supported for this grant type');
  }

  console.log('refreshToken scopes', [...refreshToken.scopes]);

  // Validate if the refresh token has the required scope from RFC 0001.
  if (!refreshToken.scopes.has(requiredScope)) {
    console.log('refresh token missing required scope: ' + requiredScope);
    throw new InvalidGrant('refresh token missing required scope: ' + requiredScope);
  }

  if (!refreshToken.grantId) {
    throw new InvalidGrant('grantId is not found');
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
    throw new InvalidGrant('DPoP is not supported for this grant type');
  }

  ctx.oidc.entity('RefreshToken', refreshToken);
  ctx.oidc.entity('Grant', grant);

  const account = await Account.findAccount(ctx, refreshToken.accountId, refreshToken as any);

  if (!account) {
    throw new InvalidGrant('refresh token invalid (referenced account not found)');
  }

  if (refreshToken.accountId !== grant.accountId) {
    throw new InvalidGrant('accountId mismatch');
  }

  ctx.oidc.entity('Account', account);

  // Check membership
  const organizationId = String(params.organization_id);
  // TODO: check membership

  if (refreshToken.consumed) {
    await Promise.all([refreshToken.destroy(), revoke(ctx, refreshToken.grantId)]);
    throw new InvalidGrant('refresh token already used');
  }

  /* === Issue access token === */
  const at = new AccessToken({
    accountId: account.accountId,
    client,
    expiresWithSession: refreshToken.expiresWithSession,
    grantId: refreshToken.grantId!,
    gty: refreshToken.gty!,
    sessionUid: refreshToken.sessionUid,
    sid: refreshToken.sid,
    aud: 'dude',
    scope: 'org 123 456',
    resourceServer: {
      audience: 'dude',
      accessTokenFormat: 'jwt',
      jwt: {
        sign: { alg: 'ES384' },
      },
      scope: 'org 123',
    } satisfies ResourceServer,
  });

  // @ts-expect-error
  console.log('dude??', AccessToken.prototype.getValueAndPayload);

  if (at.gty && !at.gty.endsWith(grantType)) {
    at.gty = `${at.gty} ${grantType}`;
  }

  const requestedScopes = params.scope ? ctx.oidc.requestParamScopes : refreshToken.scopes;

  ctx.oidc.entity('AccessToken', at);
  const accessToken = await at.save();

  ctx.body = {
    access_token: accessToken,
    expires_in: at.expiration,
    // id_token: idToken, -- add later
    refresh_token: refreshTokenValue,
    scope: at.scope,
    token_type: at.tokenType,
  };

  await next();
};
