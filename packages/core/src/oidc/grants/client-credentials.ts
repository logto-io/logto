/**
 * @overview This file implements the custom `client_credentials` grant which extends the original
 * `client_credentials` grant with the issuing of organization tokens (based on RFC 0001, but for
 * machine-to-machine apps).
 *
 * Note the code is edited from oidc-provider, most parts are kept the same unless it requires
 * changes for TypeScript or RFC 0001.
 *
 * For "RFC 0001"-related edited parts, we added comments with `=== RFC 0001 ===` and
 * `=== End RFC 0001 ===` to indicate the changes.
 *
 * @see {@link https://github.com/logto-io/rfcs | Logto RFCs} for more information about RFC 0001.
 * @see {@link https://github.com/panva/node-oidc-provider/blob/0c52469f08b0a4a1854d90a96546a3f7aa090e5e/lib/actions/grants/client_credentials.js | Original file}.
 *
 * @remarks
 * Since the original code is not exported, we have to copy the code here. This file should be
 * treated as a fork of the original file, which means, we should keep the code in sync with the
 * original file as much as possible.
 *
 * The commit hash of the original file is `0c52469f08b0a4a1854d90a96546a3f7aa090e5e`.
 */

import type Provider from 'oidc-provider';
import { errors } from 'oidc-provider';
import epochTime from 'oidc-provider/lib/helpers/epoch_time.js';
import dpopValidate from 'oidc-provider/lib/helpers/validate_dpop.js';
import instance from 'oidc-provider/lib/helpers/weak_cache.js';
import checkResource from 'oidc-provider/lib/shared/check_resource.js';

import { type EnvSet } from '#src/env-set/index.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

const { InvalidClient, InvalidGrant, InvalidScope, InvalidTarget } = errors;

/**
 * The valid parameters for the `client_credentials` grant type. Note the `resource` parameter is
 * not included here since it should be handled per configuration when registering the grant type.
 */
export const parameters = Object.freeze(['scope']);

// We have to disable the rules because the original implementation is written in JavaScript and
// uses mutable variables.
/* eslint-disable @silverhand/fp/no-mutation, @typescript-eslint/no-non-null-assertion */
export const buildHandler: (
  envSet: EnvSet,
  queries: Queries
  // eslint-disable-next-line complexity, unicorn/consistent-function-scoping
) => Parameters<Provider['registerGrantType']>[1] = (_envSet, _queries) => async (ctx, next) => {
  const { client } = ctx.oidc;
  const { ClientCredentials, ReplayDetection } = ctx.oidc.provider;

  assertThat(client, new InvalidClient('client must be available'));

  const {
    features: {
      mTLS: { getCertificate },
    },
    scopes: statics,
  } = instance(ctx.oidc.provider).configuration();

  const dPoP = await dpopValidate(ctx);

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  await checkResource(ctx, async () => {});

  const scopes = ctx.oidc.params?.scope
    ? [...new Set(String(ctx.oidc.params.scope).split(' '))]
    : [];

  if (client.scope) {
    const allowList = new Set(client.scope.split(' '));

    for (const scope of scopes.filter(Set.prototype.has.bind(statics))) {
      if (!allowList.has(scope)) {
        throw new InvalidScope('requested scope is not allowed', scope);
      }
    }
  }

  const token = new ClientCredentials({
    client,
    scope: scopes.join(' ') || undefined!,
  });

  const { 0: resourceServer, length } = Object.values(ctx.oidc.resourceServers ?? {});
  if (resourceServer) {
    if (length !== 1) {
      throw new InvalidTarget(
        'only a single resource indicator value is supported for this grant type'
      );
    }
    token.resourceServer = resourceServer;
    token.scope =
      scopes.filter(Set.prototype.has.bind(new Set(resourceServer.scope.split(' ')))).join(' ') ||
      undefined;
  }

  if (client.tlsClientCertificateBoundAccessTokens) {
    const cert = getCertificate(ctx);

    if (!cert) {
      throw new InvalidGrant('mutual TLS client certificate not provided');
    }
    // @ts-expect-error -- code from oidc-provider
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    token.setThumbprint('x5t', cert);
  }

  if (dPoP) {
    // @ts-expect-error -- code from oidc-provider
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const unique: unknown = await ReplayDetection.unique(
      client.clientId,
      dPoP.jti,
      epochTime() + 300
    );

    assertThat(unique, new InvalidGrant('DPoP proof JWT Replay detected'));

    // @ts-expect-error -- code from oidc-provider
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    token.setThumbprint('jkt', dPoP.thumbprint);
  } else if (ctx.oidc.client?.dpopBoundAccessTokens) {
    throw new InvalidGrant('DPoP proof JWT not provided');
  }

  ctx.oidc.entity('ClientCredentials', token);
  const value = await token.save();

  ctx.body = {
    access_token: value,
    expires_in: token.expiration,
    token_type: token.tokenType,
    scope: token.scope,
  };

  await next();
};
/* eslint-enable @silverhand/fp/no-mutation, @typescript-eslint/no-non-null-assertion */
