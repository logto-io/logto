/**
 * @overview This file implements the custom `client_credentials` grant which extends the original
 * `client_credentials` grant with the issuing of organization tokens (RFC 0006).
 *
 * Note the code is edited from oidc-provider, most parts are kept the same unless it requires
 * changes for TypeScript or RFC 0006.
 *
 * For "RFC 0006"-related edited parts, we added comments with `=== RFC 0006 ===` and
 * `=== End RFC 0006 ===` to indicate the changes.
 *
 * @see {@link https://github.com/logto-io/rfcs | Logto RFCs} for more information about RFC 0006.
 * @see {@link https://github.com/logto-io/node-oidc-provider/blob/7722ac95d77cd62a41528aec4eb711b3d12589d4/lib/actions/grants/client_credentials.js | Original file}.
 *
 * @remarks
 * Since the original code is not exported, we have to copy the code here. This file should be
 * treated as a fork of the original file, which means, we should keep the code in sync with the
 * original file as much as possible.
 *
 * The original file is from the fork's `v9` branch at commit
 * `7722ac95d77cd62a41528aec4eb711b3d12589d4`, where it differs from the upstream v9.9.1 tag only
 * by the fork's scope-always-present patch in the token response. Its shared helpers
 * (`grant_common.js`) are consumed through the `oidc-provider-internals.js` seam module.
 *
 * Deliberate deviations from the original file:
 *
 * - The `ctx.oidc.resourceServers` destructure is hoisted above the scope validation so the
 *   RFC 0006 guard (`` both `resource` and `organization_id` are not provided ``) rejects the
 *   request before a token instance is created; the original file reads it after creating the
 *   token.
 */

import { type X509Certificate } from 'node:crypto';

import { cond } from '@silverhand/essentials';
import { errors, type Provider } from 'oidc-provider';

import { type EnvSet } from '#src/env-set/index.js';
import {
  applyDpopBinding,
  checkDpopRequired,
  checkMtlsCert,
  checkResource,
  dpopValidate,
  getProviderConfiguration,
  type GrantTypeHandler,
} from '#src/oidc/oidc-provider-internals.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

import { handleOrganizationToken } from './utils.js';

const { AccessDenied, InvalidClient, InvalidRequest, InvalidScope, InvalidTarget } = errors;

/**
 * The `ClientCredentials` instance widened with the `setThumbprint` model mixin missing from
 * `@types/oidc-provider`.
 */
type WidenedClientCredentials = InstanceType<Provider['ClientCredentials']> & {
  setThumbprint(name: 'jkt' | 'x5t', input: string | X509Certificate): void;
};

/**
 * The valid parameters for the `client_credentials` grant type. Note the `resource` parameter is
 * not included here since it should be handled per configuration when registering the grant type.
 */
export const parameters = Object.freeze(['scope', 'organization_id']);

// We have to disable the rules because the original implementation is written in JavaScript and
// uses mutable variables.
/* eslint-disable @silverhand/fp/no-mutation, @typescript-eslint/no-non-null-assertion */
export const buildHandler: (
  envSet: EnvSet,
  queries: Queries
  // eslint-disable-next-line complexity
) => GrantTypeHandler = (envSet, queries) => async (ctx) => {
  const { client, params } = ctx.oidc;
  const { ClientCredentials } = ctx.oidc.provider;

  assertThat(client, new InvalidClient('client must be available'));

  const {
    features: {
      mTLS: { getCertificate },
      dPoP: { allowReplay },
    },
    scopes: statics,
  } = getProviderConfiguration(ctx.oidc.provider);

  const dPoP = await dpopValidate(ctx);

  if (params?.authorization_details) {
    throw new InvalidRequest('authorization_details is unsupported for this grant_type');
  }

  /* === RFC 0006 === */
  // The value type is `unknown`, which will swallow other type inferences. So we have to cast it
  // to `Boolean` first.
  const organizationId = cond(Boolean(params?.organization_id) && String(params?.organization_id));

  if (
    organizationId &&
    !(await queries.organizations.relations.apps.exists({
      organizationId,
      applicationId: client.clientId,
    }))
  ) {
    const error = new AccessDenied('app has not associated with the organization');
    error.statusCode = 403;
    throw error;
  }
  /* === End RFC 0006 === */

  // Do not check the resource if the organization ID is provided and the resource is not. In this
  // case, the default resource server will be ignored, and an organization token will be issued.
  if (!(organizationId && !params?.resource)) {
    // This line is copied from the original file. It checks the resource server according to the
    // configuration and parameters, then saves them in `ctx.oidc.resourceServers`.
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await checkResource(ctx, async () => {});
  }

  const { 0: resourceServer, length } = Object.values(ctx.oidc.resourceServers ?? {});

  if (!organizationId && length === 0) {
    throw new InvalidTarget('both `resource` and `organization_id` are not provided');
  }

  const scopes = params?.scope ? [...new Set(String(params.scope).split(' '))] : [];

  if (client.scope) {
    const allowList = new Set(client.scope.split(' '));

    for (const scope of scopes.filter(Set.prototype.has.bind(statics))) {
      if (!allowList.has(scope)) {
        throw new InvalidScope('requested scope is not allowed', scope);
      }
    }
  }

  // eslint-disable-next-line no-restricted-syntax -- widen with the model mixin missing from the typings, see `WidenedClientCredentials`
  const token = new ClientCredentials({
    client,
    scope: scopes.join(' ') || undefined!,
  }) as WidenedClientCredentials;

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

  // Issue organization token only if resource server is not present.
  // If it's present, the flow falls into the `checkResource` and `if (resourceServer)` block above.
  if (organizationId && !resourceServer) {
    /* === RFC 0006 === */
    const availableScopes = await queries.organizations.relations.appsRoles
      .getApplicationScopes(organizationId, client.clientId)
      .then((scope) => scope.map(({ name }) => name));

    await handleOrganizationToken({
      envSet,
      availableScopes,
      accessToken: token,
      organizationId,
      scope: new Set(scopes),
    });
    /* === End RFC 0006 === */
  }

  const cert = checkMtlsCert(ctx, getCertificate);
  if (cert) {
    token.setThumbprint('x5t', cert);
  }

  await applyDpopBinding(ctx, dPoP, token, allowReplay);
  checkDpopRequired(ctx, dPoP);

  ctx.oidc.entity('ClientCredentials', token);
  const value = await token.save();

  ctx.body = {
    access_token: value,
    expires_in: token.expiration,
    token_type: token.tokenType,
    /**
     * LOGTO PATCH(scope-always-present): always echo the token's scope in the token response.
     * Upstream drops falsy scopes, but Logto clients rely on `scope` being present.
     *
     * Upstream: scope: token.scope || undefined,
     */
    scope: token.scope,
  };
};
/* eslint-enable @silverhand/fp/no-mutation, @typescript-eslint/no-non-null-assertion */
