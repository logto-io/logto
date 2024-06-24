/**
 * @overview This file implements the `token_exchange` grant type. The grant type is used to impersonate
 *
 * @see {@link https://github.com/logto-io/rfcs | Logto RFCs} for more information about RFC 0005.
 */

import { GrantType } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';
import type Provider from 'oidc-provider';
import { errors } from 'oidc-provider';
import resolveResource from 'oidc-provider/lib/helpers/resolve_resource.js';
import validatePresence from 'oidc-provider/lib/helpers/validate_presence.js';
import instance from 'oidc-provider/lib/helpers/weak_cache.js';

import { type EnvSet } from '#src/env-set/index.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

const { InvalidClient, InvalidGrant } = errors;

/**
 * The valid parameters for the `urn:ietf:params:oauth:grant-type:token-exchange` grant type. Note the `resource` parameter is
 * not included here since it should be handled per configuration when registering the grant type.
 */
export const parameters = Object.freeze([
  'subject_token',
  'subject_token_type',
  'organization_id',
  'scope',
] as const);

/**
 * The required parameters for the grant type.
 *
 * @see {@link parameters} for the full list of valid parameters.
 */
const requiredParameters = Object.freeze([
  'subject_token',
  'subject_token_type',
] as const) satisfies ReadonlyArray<(typeof parameters)[number]>;

export const buildHandler: (
  envSet: EnvSet,
  queries: Queries
) => Parameters<Provider['registerGrantType']>['1'] = (envSet, queries) => async (ctx, next) => {
  const { client, params, requestParamScopes, provider } = ctx.oidc;
  const { Account, AccessToken } = provider;
  const {
    subjectTokens: { findSubjectToken, updateSubjectTokenById },
  } = queries;

  assertThat(params, new InvalidGrant('parameters must be available'));
  assertThat(client, new InvalidClient('client must be available'));
  assertThat(
    params.subject_token_type === 'urn:ietf:params:oauth:token-type:access_token',
    new InvalidGrant('unsupported subject token type')
  );

  validatePresence(ctx, ...requiredParameters);

  const providerInstance = instance(provider);
  const {
    features: { userinfo, resourceIndicators },
  } = providerInstance.configuration();

  const subjectToken = await trySafe(async () => findSubjectToken(String(params.subject_token)));
  assertThat(subjectToken, new InvalidGrant('subject token not found'));
  assertThat(subjectToken.expiresAt > Date.now(), new InvalidGrant('subject token is expired'));
  assertThat(!subjectToken.consumedAt, new InvalidGrant('subject token is already consumed'));

  const account = await Account.findAccount(ctx, subjectToken.userId);

  if (!account) {
    throw new InvalidGrant('refresh token invalid (referenced account not found)');
  }

  // TODO: (LOG-9501) Implement general security checks like dPop
  ctx.oidc.entity('Account', account);

  // TODO: (LOG-9140) Check organization permissions

  const accessToken = new AccessToken({
    accountId: account.accountId,
    clientId: client.clientId,
    gty: GrantType.TokenExchange,
    client,
    grantId: subjectToken.id, // There is no actual grant, so we use the subject token ID
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    scope: undefined!,
  });

  /* eslint-disable @silverhand/fp/no-mutation */

  /** The scopes requested by the client. If not provided, use the scopes from the refresh token. */
  const scope = requestParamScopes;
  const resource = await resolveResource(
    ctx,
    {
      // We don't restrict the resource indicators to the requested resource,
      // because the subject token does not have a resource indicator.
      // Use the params.resource to bypass the resource indicator check.
      resourceIndicators: new Set([params.resource]),
    },
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
    accessToken.resourceServer = new provider.ResourceServer(resource, resourceServerInfo);
    // For access token scopes, there is no "grant" to check,
    // filter the scopes based on the resource server's scopes
    accessToken.scope = [...scope]
      // @ts-expect-error -- code from oidc-provider
      .filter(Set.prototype.has.bind(accessToken.resourceServer.scopes))
      .join(' ');
  } else {
    // TODO: (LOG-9166) Check claims and scopes
    accessToken.claims = ctx.oidc.claims;
    accessToken.scope = Array.from(scope).join(' ');
  }
  // TODO: (LOG-9140) Handle organization token

  /* eslint-enable @silverhand/fp/no-mutation */

  ctx.oidc.entity('AccessToken', accessToken);
  const accessTokenString = await accessToken.save();

  // Consume the subject token
  await updateSubjectTokenById(subjectToken.id, {
    consumedAt: Date.now(),
  });

  ctx.body = {
    access_token: accessTokenString,
    expires_in: accessToken.expiration,
    scope: accessToken.scope,
    token_type: accessToken.tokenType,
  };

  await next();
};
