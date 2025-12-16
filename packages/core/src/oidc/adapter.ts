import type { CreateApplication } from '@logto/schemas';
import {
  ApplicationType,
  accountCenterApplicationId,
  adminConsoleApplicationId,
  demoAppApplicationId,
} from '@logto/schemas';
import { appendPath, tryThat, conditional } from '@silverhand/essentials';
import { addSeconds } from 'date-fns';
import type { AdapterFactory, AllClientMetadata } from 'oidc-provider';
import { errors } from 'oidc-provider';
import snakecaseKeys from 'snakecase-keys';

import { EnvSet } from '#src/env-set/index.js';
import { getTenantUrls } from '#src/env-set/utils.js';
import type Queries from '#src/tenants/Queries.js';

import { getConstantClientMetadata } from './utils.js';

/**
 * Append `redirect_uris` and `post_logout_redirect_uris` for Admin Console
 * as Admin Console is attached to the admin tenant in OSS and its endpoints are dynamic (from env variable).
 */
const transpileMetadata = (clientId: string, data: AllClientMetadata): AllClientMetadata => {
  if (clientId !== adminConsoleApplicationId) {
    return data;
  }

  const { adminUrlSet, cloudUrlSet } = EnvSet.values;

  const urls = [
    ...adminUrlSet.deduplicated().map((url) => appendPath(url, '/console')),
    ...cloudUrlSet.deduplicated(),
  ];

  return {
    ...data,
    redirect_uris: [
      ...(data.redirect_uris ?? []),
      ...urls.map((url) => appendPath(url, '/callback').href),
    ],
    post_logout_redirect_uris: [...(data.post_logout_redirect_uris ?? []), ...urls.map(String)],
  };
};

const buildDemoAppClientMetadata = (envSet: EnvSet): AllClientMetadata => {
  const urlStrings = getTenantUrls(envSet.tenantId, EnvSet.values).map(
    (url) => appendPath(url, '/demo-app').href
  );

  return {
    ...getConstantClientMetadata(envSet, ApplicationType.SPA),
    client_id: demoAppApplicationId,
    client_name: 'Live Preview',
    redirect_uris: urlStrings,
    post_logout_redirect_uris: urlStrings,
  };
};

const buildAccountCenterClientMetadata = (envSet: EnvSet): AllClientMetadata => {
  const urlStrings = getTenantUrls(envSet.tenantId, EnvSet.values).map(
    (url) => appendPath(url, '/account').href
  );

  return {
    ...getConstantClientMetadata(envSet, ApplicationType.SPA),
    client_id: accountCenterApplicationId,
    client_name: 'Account Center',
    redirect_uris: urlStrings,
    post_logout_redirect_uris: urlStrings,
  };
};

/**
 * Restrict third-party client OP scopes to the app-level enabled user claims scopes
 *
 * client OP scopes include:
 * - OIDC scopes: openid, offline_access
 * - custom scopes: @see {@link https://github.com/panva/node-oidc-provider/blob/main/docs/README.md#scopes}
 * - scopes defined in user claims: @see {@link https://github.com/panva/node-oidc-provider/blob/main/docs/README.md#claims}
 *
 * @remark
 * We use the client metadata scope metadata to restrict the third-party client scopes,
 *
 * - @see {@link https://github.com/panva/node-oidc-provider/blob/main/docs/README.md#clients}
 * - client metadata scope must be a valid OP scope, otherwise a invalid metadata error will be thrown. @see{@link https://github.com/panva/node-oidc-provider/blob/main/lib/helpers/client_schema.js#L626}
 * - resource scopes (including Logto organization scopes) are not include in the OP scope, it won't be validate by the client metadata scope as well. @see {@link https://github.com/panva/node-oidc-provider/blob/main/lib/actions/authorization/check_scope.js#L47}
 * - resource scopes (including Logto organization scopes) will be filtered in the resource server's scopes fetching method. @see {@link https://github.com/panva/node-oidc-provider/blob/main/docs/README.md#getresourceserverinfo}
 *
 * Auth request will be rejected if the requested scopes are not included in the client scope metadata.
 */
const getThirdPartyClientScopes = async (
  { userConsentUserScopes }: Queries['applications'],
  applicationId: string
) => {
  const availableUserScopes = await userConsentUserScopes.findAllByApplicationId(applicationId);
  const clientScopes = ['openid', 'offline_access', ...availableUserScopes];

  // ClientScopes does not support prefix matching, so we need to include all the scopes.
  // Resource scopes name are not unique, we need to deduplicate them.
  // Requested resource scopes and organization scopes will be validated in resource server fetching method exclusively.
  return clientScopes;
};

export default function postgresAdapter(
  envSet: EnvSet,
  queries: Queries,
  modelName: string
): ReturnType<AdapterFactory> {
  const {
    applications,
    applications: { findApplicationById },
    oidcModelInstances: {
      consumeInstanceById,
      destroyInstanceById,
      findPayloadById,
      findPayloadByPayloadField,
      revokeInstanceByGrantId,
      upsertInstance,
    },
  } = queries;

  if (modelName === 'Client') {
    const reject = async () => {
      throw new Error('Not implemented');
    };
    const transpileClient = (
      {
        id: client_id,
        secret: client_secret,
        name: client_name,
        type,
        oidcClientMetadata,
        customClientMetadata,
      }: CreateApplication,
      clientScopes?: string[]
    ): AllClientMetadata => ({
      client_id,
      client_secret,
      client_name,
      ...getConstantClientMetadata(envSet, type),
      ...transpileMetadata(client_id, snakecaseKeys(oidcClientMetadata)),
      // `node-oidc-provider` won't camelCase custom parameter keys, so we need to keep the keys camelCased
      ...customClientMetadata,
      /* Third-party client scopes are restricted to the app-level enabled user scopes. */
      ...conditional(clientScopes && { scope: clientScopes.join(' ') }),
    });

    return {
      upsert: reject,
      find: async (id) => {
        if (id === demoAppApplicationId) {
          return buildDemoAppClientMetadata(envSet);
        }
        if (id === accountCenterApplicationId) {
          return buildAccountCenterClientMetadata(envSet);
        }

        const application = await tryThat(
          findApplicationById(id),
          new errors.InvalidClient(`invalid client ${id}`)
        );

        if (application.isThirdParty) {
          const clientScopes = await getThirdPartyClientScopes(applications, id);
          return transpileClient(application, clientScopes);
        }

        return transpileClient(application);
      },
      findByUserCode: reject,
      findByUid: reject,
      consume: reject,
      destroy: reject,
      revokeByGrantId: reject,
    };
  }

  return {
    upsert: async (id, payload, expiresIn) =>
      upsertInstance({
        modelName,
        id,
        payload,
        expiresAt: addSeconds(Date.now(), expiresIn).valueOf(),
      }),
    find: async (id) => findPayloadById(modelName, id),
    findByUserCode: async (userCode) => findPayloadByPayloadField(modelName, 'userCode', userCode),
    findByUid: async (uid) => findPayloadByPayloadField(modelName, 'uid', uid),
    consume: async (id) => consumeInstanceById(modelName, id),
    destroy: async (id) => destroyInstanceById(modelName, id),
    revokeByGrantId: async (grantId) => revokeInstanceByGrantId(modelName, grantId),
  };
}
