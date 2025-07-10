/**
 * @overview
 * This file implements the `federated_third_party_token_exchange` grant type.
 * It allows Logto authenticated users to exchange for tokens from third-party identity providers
 * (e.g., Google, GitHub) using their Logto refresh token.
 */
import { conditional, isKeyInObject } from '@silverhand/essentials';
import type { Provider, UnknownObject } from 'oidc-provider';
import { errors } from 'oidc-provider';
import revoke from 'oidc-provider/lib/helpers/revoke.js';
import validatePresence from 'oidc-provider/lib/helpers/validate_presence.js';

import { EnvSet } from '#src/env-set/index.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

import RequestError from '../../errors/RequestError/index.js';
import { decryptTokens } from '../../utils/secret-encryption.js';

const { InvalidClient, InvalidGrant, InvalidRequest } = errors;

enum FederatedThirdPartyTokenExchangeTokenType {
  ThirdPartyAccessToken = 'urn:logto:token-type:federated_third_party_access_token',
}

enum SubjectTokenType {
  RefreshToken = 'urn:ietf:params:oauth:token-type:refresh_token',
}

enum ThirdPartyProviderType {
  Social = 'social',
  SSO = 'sso',
}

type ConnectorTarget = {
  type: ThirdPartyProviderType;
  target: string;
};

export const parameters = Object.freeze([
  'subject_token',
  'subject_token_type',
  'requested_token_type',
  'connector',
] as const);

const requiredParameters = Object.freeze([
  'subject_token',
  'subject_token_type',
  'requested_token_type',
  'connector',
] as const) satisfies ReadonlyArray<(typeof parameters)[number]>;

const validateTokenTypes = (params: UnknownObject): void => {
  const subjectTokenType = String(params.subject_token_type);
  const requestedTokenType = String(params.requested_token_type);

  assertThat(
    subjectTokenType === SubjectTokenType.RefreshToken,
    new InvalidRequest('Invalid subject token type')
  );

  assertThat(
    requestedTokenType === FederatedThirdPartyTokenExchangeTokenType.ThirdPartyAccessToken,
    new InvalidRequest('Invalid requested token type')
  );
};

/**
 * Validate the connector parameter.
 * @remarks
 * We use `connector` to identify the third-party identity provider,
 * in the format of `social:<target>` or `sso:<connector-id>`.
 *
 * This function checks if the `connector` parameter is provided and is in a valid format.
 */
const parseConnectorParameter = (params: UnknownObject): ConnectorTarget => {
  const connector = String(params.connector);
  assertThat(connector, new InvalidRequest('connector must be provided'));

  const [targetType, targetValue] = connector.split(':');
  assertThat(
    (targetType === ThirdPartyProviderType.Social || targetType === ThirdPartyProviderType.SSO) &&
      targetValue,
    new InvalidRequest(
      'Invalid connector format, expected "social:<target>" or "sso:<connector-id>"'
    )
  );

  return {
    type: targetType,
    target: targetValue,
  };
};

const getThirdPartyTokenSetSecret = async (
  queries: Queries,
  userId: string,
  { type, target }: ConnectorTarget
) => {
  const tokenSetSecret =
    type === ThirdPartyProviderType.Social
      ? await queries.secrets.findSocialTokenSetSecretByUserIdAndTarget(userId, target)
      : await queries.secrets.findEnterpriseSsoTokenSetSecretByUserIdAndConnectorId(userId, target);

  if (!tokenSetSecret) {
    throw new RequestError({
      code: 'third_party_token_exchange.token_not_found',
      status: 401,
    });
  }

  const {
    id,
    metadata: { expiresAt, scope, tokenType },
    iv,
    encryptedDek,
    ciphertext,
    authTag,
  } = tokenSetSecret;

  const { access_token, refresh_token } = decryptTokens({
    iv,
    encryptedDek,
    ciphertext,
    authTag,
  });

  if (!access_token) {
    throw new RequestError({
      code: 'third_party_token_exchange.token_not_found',
      status: 401,
    });
  }

  const now = Math.floor(Date.now() / 1000);

  if (expiresAt && now >= expiresAt && !refresh_token) {
    await queries.secrets.deleteById(id);
    throw new RequestError({
      code: 'third_party_token_exchange.token_expires',
      status: 401,
    });
  }

  // TODO: refresh expired token if refresh_token is available
  // If the token is expired and a refresh token is available, we should refresh it.

  // Recalculate expires_in based on the current time and expiresAt
  // If expiresAt is not set, expires_in will be undefined
  const expires_in = expiresAt ? expiresAt - now : undefined;

  return {
    access_token,
    ...conditional(scope && { scope }),
    ...conditional(tokenType && { token_type: tokenType }),
    ...conditional(expires_in && { expires_in }),
  };
};

/* eslint-disable unicorn/no-array-method-this-argument */
export const buildHandler: (
  envSet: EnvSet,
  queries: Queries
  // eslint-disable-next-line complexity
) => Parameters<Provider['registerGrantType']>[1] = (envSet, queries) => async (ctx, next) => {
  const { client, params, provider } = ctx.oidc;
  const { RefreshToken, Account, Grant } = provider;

  // TODO: remove this dev feature guard
  assertThat(EnvSet.values.isDevFeaturesEnabled, new InvalidRequest('Invalid grant type'));

  /* === Start standard OIDC refresh token  validation  === */
  assertThat(params, new InvalidGrant('parameters must be available'));
  assertThat(client, new InvalidClient('client must be available'));

  validatePresence(ctx, ...requiredParameters);

  validateTokenTypes(params);

  const refreshTokenValue = String(params.subject_token);

  const refreshToken = await RefreshToken.find(refreshTokenValue, { ignoreExpiration: true });

  if (!refreshToken) {
    throw new InvalidGrant('refresh token not found');
  }

  if (refreshToken.clientId !== client.clientId) {
    throw new InvalidGrant('client mismatch');
  }

  if (refreshToken.isExpired) {
    throw new InvalidGrant('refresh token is expired');
  }

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
  /* === End standard OIDC refresh token grant type validation === */

  const connector = String(params.connector);
  assertThat(connector, new InvalidGrant('connector must be provided'));

  const connectorTarget = parseConnectorParameter(params);
  const result = await getThirdPartyTokenSetSecret(queries, account.accountId, connectorTarget);

  ctx.body = result;

  await next();
};
/* eslint-enable unicorn/no-array-method-this-argument */
