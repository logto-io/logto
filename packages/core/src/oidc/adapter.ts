import type { CreateApplication, OidcClientMetadata } from '@logto/schemas';
import { ApplicationType, adminConsoleApplicationId, demoAppApplicationId } from '@logto/schemas';
import { tryThat } from '@logto/shared';
import { deduplicate } from '@silverhand/essentials';
import { addSeconds } from 'date-fns';
import type { AdapterFactory, AllClientMetadata } from 'oidc-provider';
import { errors } from 'oidc-provider';
import snakecaseKeys from 'snakecase-keys';

import { EnvSet, MountedApps } from '#src/env-set/index.js';
import type Queries from '#src/tenants/Queries.js';
import { appendPath } from '#src/utils/url.js';

import { getConstantClientMetadata } from './utils.js';

const buildAdminConsoleClientMetadata = (envSet: EnvSet): AllClientMetadata => {
  const { localhostUrl, adminConsoleUrl } = EnvSet.values;
  const urls = deduplicate([
    appendPath(localhostUrl, '/console').toString(),
    adminConsoleUrl.toString(),
  ]);

  return {
    ...getConstantClientMetadata(envSet, ApplicationType.SPA),
    client_id: adminConsoleApplicationId,
    client_name: 'Admin Console',
    redirect_uris: urls.map((url) => appendPath(url, '/callback').toString()),
    post_logout_redirect_uris: urls,
  };
};

const buildDemoAppUris = (
  oidcClientMetadata: OidcClientMetadata
): Pick<OidcClientMetadata, 'redirectUris' | 'postLogoutRedirectUris'> => {
  const { localhostUrl, endpoint } = EnvSet.values;
  const urls = [
    appendPath(localhostUrl, MountedApps.DemoApp).toString(),
    appendPath(endpoint, MountedApps.DemoApp).toString(),
  ];

  const data = {
    redirectUris: deduplicate([...urls, ...oidcClientMetadata.redirectUris]),
    postLogoutRedirectUris: deduplicate([...urls, ...oidcClientMetadata.postLogoutRedirectUris]),
  };

  return data;
};

export default function postgresAdapter(
  envSet: EnvSet,
  queries: Queries,
  modelName: string
): ReturnType<AdapterFactory> {
  const {
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
    const transpileClient = ({
      id: client_id,
      secret: client_secret,
      name: client_name,
      type,
      oidcClientMetadata,
      customClientMetadata,
    }: CreateApplication): AllClientMetadata => ({
      client_id,
      client_secret,
      client_name,
      ...getConstantClientMetadata(envSet, type),
      ...snakecaseKeys(oidcClientMetadata),
      ...(client_id === demoAppApplicationId &&
        snakecaseKeys(buildDemoAppUris(oidcClientMetadata))),
      // `node-oidc-provider` won't camelCase custom parameter keys, so we need to keep the keys camelCased
      ...customClientMetadata,
    });

    return {
      upsert: reject,
      find: async (id) => {
        // Directly return client metadata since Admin Console does not belong to any tenant in the OSS version.
        if (id === adminConsoleApplicationId) {
          return buildAdminConsoleClientMetadata(envSet);
        }

        return transpileClient(
          await tryThat(findApplicationById(id), new errors.InvalidClient(`invalid client ${id}`))
        );
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
