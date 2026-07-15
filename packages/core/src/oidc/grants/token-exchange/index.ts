/**
 * @overview This file implements the `token_exchange` grant type. The grant type is used to impersonate
 *
 * @see {@link https://github.com/logto-io/rfcs | Logto RFCs} for more information about RFC 0005.
 *
 * @remarks
 * Unlike the `refresh_token` and `client_credentials` grants, this grant is Logto's own and has
 * no upstream counterpart to stay in sync with. It still consumes the shared token-endpoint
 * helpers from v9's `grant_common.js` through the `oidc-provider-internals.js` seam module, so
 * the sender-constraining (mTLS and DPoP) behavior stays aligned with the forked grants.
 */

import { buildOrganizationUrn } from '@logto/core-kit';
import { GrantType } from '@logto/schemas';
import { nanoid } from 'nanoid';
import { errors } from 'oidc-provider';

import { type EnvSet } from '#src/env-set/index.js';
import { assertUserHasApplicationAccessForOidc } from '#src/oidc/application-access-control.js';
import {
  applyDpopBinding,
  applyMtlsBinding,
  checkDpopRequired,
  checkMtlsCert,
  createAccessToken,
  dpopValidate,
  getProviderConfiguration,
  type GrantTypeHandler,
  resolveResource,
  validateAccount,
  validatePresence,
} from '#src/oidc/oidc-provider-internals.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

import {
  getSharedResourceServerData,
  isThirdPartyApplication,
  reversedResourceAccessTokenTtl,
} from '../../resource.js';
import { checkOrganizationAccess } from '../utils.js';

import { validateSubjectToken } from './account.js';
import { handleActorToken } from './actor-token.js';
import { type TokenExchangeAct } from './types.js';

const { InvalidClient, InvalidGrant } = errors;

/**
 * The valid parameters for the `urn:ietf:params:oauth:grant-type:token-exchange` grant type. Note the `resource` parameter is
 * not included here since it should be handled per configuration when registering the grant type.
 */
export const parameters = Object.freeze([
  'subject_token',
  'subject_token_type',
  'actor_token',
  'actor_token_type',
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

/* eslint-disable @silverhand/fp/no-mutation, @typescript-eslint/no-unsafe-assignment */
type Handler = (
  envSet: EnvSet,
  queries: Queries,
  applicationAccessControl: Libraries['applicationAccessControl']
) => GrantTypeHandler;

export const buildHandler: Handler = (envSet, queries, appAccess) => async (ctx) => {
  const { client, params, requestParamScopes, provider } = ctx.oidc;
  const { AccessToken, Grant } = provider;

  assertThat(params, new InvalidGrant('parameters must be available'));
  assertThat(client, new InvalidClient('client must be available'));

  const isThirdParty = await isThirdPartyApplication(queries, client.clientId);

  validatePresence(ctx, ...requiredParameters);

  const {
    features: {
      userinfo,
      resourceIndicators,
      mTLS: { getCertificate },
      dPoP: { allowReplay },
    },
    scopes: oidcScopes,
    findAccount,
  } = getProviderConfiguration(provider);

  const dPoP = await dpopValidate(ctx);

  const { userId, subjectTokenId } = await validateSubjectToken({
    queries,
    subjectToken: String(params.subject_token),
    subjectTokenType: String(params.subject_token_type),
    AccessToken,
    jwtVerificationOptions: {
      localJWKSet: envSet.oidc.localJWKSet,
      issuer: envSet.oidc.issuer,
    },
  });

  const account = await validateAccount(ctx, findAccount, { accountId: userId }, 'subject token');

  ctx.oidc.entity('Account', account);

  await assertUserHasApplicationAccessForOidc(
    appAccess,
    client.clientId,
    account.accountId,
    client.metadata().appLevelAccessControlEnabled
  );

  // Pre-generate grant ID to avoid a separate DB write just to obtain it.
  // oidc-provider's BaseModel.save() skips ID generation when jti is already set.
  const grantId = nanoid();
  // eslint-disable-next-line no-restricted-syntax -- jti is accepted by BaseModel constructor at runtime but not in Grant typings
  const grant = new Grant({
    jti: grantId,
    accountId: account.accountId,
    clientId: client.clientId,
  } as ConstructorParameters<typeof Grant>[0]);

  const { organizationId } = await checkOrganizationAccess(ctx, queries, account, isThirdParty);

  const accessToken = createAccessToken(
    ctx,
    AccessToken,
    {
      accountId: account.accountId,
      grantId,
    },
    GrantType.TokenExchange
  );
  accessToken.extra = {
    ...(subjectTokenId ? { subjectTokenId } : {}),
  };

  await applyDpopBinding(ctx, dPoP, accessToken, allowReplay);
  checkDpopRequired(ctx, dPoP);

  const cert = checkMtlsCert(ctx, getCertificate);
  applyMtlsBinding(accessToken, cert);

  /** The scopes requested by the client. */
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
    grant.addResourceScope(audience, accessToken.scope);
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
    grant.addResourceScope(resource, accessToken.scope);
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
    grant.addOIDCScope(accessToken.scope);
  }

  // Handle the actor token
  const { actorId } = await handleActorToken(ctx);
  if (actorId) {
    // @see https://github.com/panva/node-oidc-provider/blob/main/lib/models/formats/jwt.js#L118
    // The JWT generator in node-oidc-provider only recognizes a fixed list of claims,
    // to add other claims to JWT, the only way is to return them in `extraTokenClaims` function.
    // We save the `act` data in the `extra` field temporarily,
    // so that we can get this context it in the `extraTokenClaims` function and add it to the JWT.
    accessToken.extra = {
      ...accessToken.extra,
      ...({ act: { sub: actorId } } satisfies TokenExchangeAct),
    };
  }

  await grant.save();
  ctx.oidc.entity('Grant', grant);
  ctx.oidc.entity('AccessToken', accessToken);
  const accessTokenString = await accessToken.save();

  if (subjectTokenId) {
    await queries.subjectTokens.updateSubjectTokenById(subjectTokenId, {
      consumedAt: Date.now(),
    });
  }

  ctx.body = {
    access_token: accessTokenString,
    expires_in: accessToken.expiration,
    scope: accessToken.scope,
    token_type: accessToken.tokenType,
  };
};
/* eslint-enable @silverhand/fp/no-mutation, @typescript-eslint/no-unsafe-assignment */
