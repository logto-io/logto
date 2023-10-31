/**
 * @file The custom grant type for organization token, which is defined in RFC 0001.
 *
 * Note the code is edited from the `refresh_token` grant type from [oidc-provider](https://github.com/panva/node-oidc-provider/blob/cf2069cbb31a6a855876e95157372d25dde2511c/lib/actions/grants/refresh_token.js).
 */

import assert from 'node:assert';

import { isKeyInObject, pick } from '@silverhand/essentials';
import type Provider from 'oidc-provider';
import { errors } from 'oidc-provider';
import difference from 'oidc-provider/lib/helpers/_/difference.js';
import revoke from 'oidc-provider/lib/helpers/revoke.js';
import validatePresence from 'oidc-provider/lib/helpers/validate_presence.js';
import instance from 'oidc-provider/lib/helpers/weak_cache.js';

const { InvalidClient, InvalidGrant, InvalidScope } = errors;

/** The valid parameters for the `organization_token` grant type. */
export const parameters = Object.freeze(['refresh_token, organization_id', 'scope'] as const);

/**
 * The required parameters for the `organization_token` grant type.
 *
 * @see {@link parameters} for the full list of valid parameters.
 */
const requiredParameters = Object.freeze([
  'refresh_token, organization_id',
] as const) satisfies ReadonlyArray<(typeof parameters)[number]>;

/** The name of the `organization_token` grant type. */
export const name = 'urn:logto:grant-type:organization_token';

// eslint-disable-next-line complexity
export const handler: Parameters<Provider['registerGrantType']>['1'] = async (ctx, next) => {
  validatePresence(ctx, ...requiredParameters);

  const {
    rotateRefreshToken,
    features: { dPoP },
  } = instance(ctx.oidc.provider).configuration();

  if (dPoP.enabled) {
    throw new InvalidGrant('DPoP is not supported for this grant type');
  }

  const { RefreshToken, Account, AccessToken, IdToken, ReplayDetection, Grant } = ctx.oidc.provider;
  const { client, params, requestParamScopes } = ctx.oidc;

  assert(client, new InvalidClient('client must be available'));

  // @gao: I believe the presence of the param is validated by required parameters of this grant. Add `String` to make TS happy.
  const refreshTokenValue = String(params?.refresh_token);
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

  if (params?.scope) {
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

  const account = await Account.findAccount(ctx, refreshToken.accountId, refreshToken);

  if (!account) {
    throw new InvalidGrant('refresh token invalid (referenced account not found)');
  }

  if (refreshToken.accountId !== grant.accountId) {
    throw new InvalidGrant('accountId mismatch');
  }

  ctx.oidc.entity('Account', account);

  if (refreshToken.consumed) {
    await Promise.all([refreshToken.destroy(), revoke(ctx, refreshToken.grantId ?? '')]);
    throw new InvalidGrant('refresh token already used');
  }

  if (
    rotateRefreshToken === true ||
    (typeof rotateRefreshToken === 'function' && (await rotateRefreshToken(ctx)))
  ) {
    await refreshToken.consume();
    ctx.oidc.entity('RotatedRefreshToken', refreshToken);

    // eslint-disable-next-line @silverhand/fp/no-mutation
    refreshToken = new RefreshToken({
      ...pick(
        refreshToken,
        'accountId',
        'acr',
        'amr',
        'authTime',
        'claims',
        'expiresWithSession',
        'iiat',
        'grantId',
        'gty',
        'nonce',
        'resource',
        'sessionUid',
        'sid',
        'x5t#S256',
        'jkt'
      ),
      scope: refreshToken.scope ?? '',
      client,
      rotations: typeof refreshToken.rotations === 'number' ? refreshToken.rotations + 1 : 1,
    });

    if (refreshToken.gty && !refreshToken.gty.endsWith(gty)) {
      refreshToken.gty = `${refreshToken.gty} ${gty}`;
    }

    ctx.oidc.entity('RefreshToken', refreshToken);
    refreshTokenValue = await refreshToken.save();
  }
};
