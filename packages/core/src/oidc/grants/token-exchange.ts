/**
 * @overview This file implements the `token_exchange` grant type. The grant type is used to impersonate
 *
 * @see {@link https://github.com/logto-io/rfcs | Logto RFCs} for more information about RFC 0005.
 */

import { buildOrganizationUrn } from '@logto/core-kit';
import { GrantType } from '@logto/schemas';
import { cond, trySafe } from '@silverhand/essentials';
import type Provider from 'oidc-provider';
import { errors } from 'oidc-provider';
import resolveResource from 'oidc-provider/lib/helpers/resolve_resource.js';
import validatePresence from 'oidc-provider/lib/helpers/validate_presence.js';
import instance from 'oidc-provider/lib/helpers/weak_cache.js';

import { type EnvSet } from '#src/env-set/index.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

import {
  isThirdPartyApplication,
  getSharedResourceServerData,
  reversedResourceAccessTokenTtl,
} from '../resource.js';

const { InvalidClient, InvalidGrant, AccessDenied } = errors;

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
  // We don't allow third-party applications to perform token exchange
  assertThat(
    !(await isThirdPartyApplication(queries, client.clientId)),
    new InvalidClient('third-party applications are not allowed for this grant type')
  );
  assertThat(
    params.subject_token_type === 'urn:ietf:params:oauth:token-type:access_token',
    new InvalidGrant('unsupported subject token type')
  );

  validatePresence(ctx, ...requiredParameters);

  const providerInstance = instance(provider);
  const {
    features: { userinfo, resourceIndicators },
    scopes: oidcScopes,
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

  /* eslint-disable @silverhand/fp/no-mutation, @typescript-eslint/no-unsafe-assignment */

  /* === RFC 0001 === */
  // The value type is `unknown`, which will swallow other type inferences. So we have to cast it
  // to `Boolean` first.
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
      error.statusCode = 403;
      throw error;
    }
  }
  /* === End RFC 0001 === */

  const accessToken = new AccessToken({
    accountId: account.accountId,
    clientId: client.clientId,
    gty: GrantType.TokenExchange,
    client,
    grantId: subjectToken.id, // There is no actual grant, so we use the subject token ID
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    scope: undefined!,
  });

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

  if (organizationId && !resource) {
    /* === RFC 0001 === */
    const audience = buildOrganizationUrn(organizationId);
    /** All available scopes for the user in the organization. */
    const availableScopes = await queries.organizations.relations.usersRoles
      .getUserScopes(organizationId, account.accountId)
      .then((scopes) => scopes.map(({ name }) => name));

    /** The intersection of the available scopes and the requested scopes. */
    const issuedScopes = availableScopes.filter((name) => scope.has(name)).join(' ');

    accessToken.aud = audience;
    // Note: the original implementation uses `new provider.ResourceServer` to create the resource
    // server. But it's not available in the typings. The class is actually very simple and holds
    // no provider-specific context. So we just create the object manually.
    // See https://github.com/panva/node-oidc-provider/blob/cf2069cbb31a6a855876e95157372d25dde2511c/lib/helpers/resource_server.js
    accessToken.resourceServer = {
      ...getSharedResourceServerData(envSet),
      accessTokenTTL: reversedResourceAccessTokenTtl,
      audience,
      scope: availableScopes.join(' '),
    };
    accessToken.scope = issuedScopes;
    /* === End RFC 0001 === */
  } else if (resource) {
    const resourceServerInfo = await resourceIndicators.getResourceServerInfo(
      ctx,
      resource,
      client
    );
    // @ts-expect-error -- code from oidc-provider
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    accessToken.resourceServer = new provider.ResourceServer(resource, resourceServerInfo);
    // For access token scopes, there is no "grant" to check,
    // filter the scopes based on the resource server's scopes
    accessToken.scope = [...scope]
      // @ts-expect-error -- code from oidc-provider
      .filter(Set.prototype.has.bind(accessToken.resourceServer.scopes))
      .join(' ');
  } else {
    accessToken.claims = ctx.oidc.claims;
    // Filter scopes from `oidcScopes`,
    // in other grants, this is done by `Grant` class
    // See https://github.com/panva/node-oidc-provider/blob/0c569cf5c36dd5faa105fb931a43b2e587530def/lib/helpers/oidc_context.js#L159
    accessToken.scope = Array.from(scope)
      // Wrong typing for oidc-provider, `oidcScopes` is actully a Set,
      // wrap it with `new Set` to make it work
      .filter((name) => new Set(oidcScopes).has(name))
      .join(' ');
  }
  /* eslint-enable @silverhand/fp/no-mutation, @typescript-eslint/no-unsafe-assignment */

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
