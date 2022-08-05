import { ApplicationType, CreateApplication, GrantType, OidcClientMetadata } from '@logto/schemas';
import { adminConsoleApplicationId, demoAppApplicationId } from '@logto/schemas/lib/seeds';
import dayjs from 'dayjs';
import { AdapterFactory, AllClientMetadata } from 'oidc-provider';
import snakecaseKeys from 'snakecase-keys';

import envSet, { MountedApps } from '@/env-set';
import { findApplicationById } from '@/queries/application';
import {
  consumeInstanceById,
  destroyInstanceById,
  findPayloadById,
  findPayloadByPayloadField,
  revokeInstanceByGrantId,
  upsertInstance,
} from '@/queries/oidc-model-instance';
import { appendPath } from '@/utils/url';

import { getApplicationTypeString } from './utils';

const buildAdminConsoleClientMetadata = (): AllClientMetadata => {
  const { localhostUrl, adminConsoleUrl } = envSet.values;
  const urls = [
    ...new Set([appendPath(localhostUrl, '/console').toString(), adminConsoleUrl.toString()]),
  ];

  return {
    client_id: adminConsoleApplicationId,
    client_name: 'Admin Console',
    application_type: getApplicationTypeString(ApplicationType.SPA),
    grant_types: Object.values(GrantType),
    token_endpoint_auth_method: 'none',
    redirect_uris: urls.map((url) => appendPath(url, '/callback').toString()),
    post_logout_redirect_uris: urls,
  };
};

const buildDemoAppUris = (
  oidcClientMetadata: OidcClientMetadata
): Pick<OidcClientMetadata, 'redirectUris' | 'postLogoutRedirectUris'> => {
  const { localhostUrl, endpoint } = envSet.values;
  const urls = [
    appendPath(localhostUrl, MountedApps.DemoApp).toString(),
    appendPath(endpoint, MountedApps.DemoApp).toString(),
  ];

  const data = {
    redirectUris: [...new Set([...urls, ...oidcClientMetadata.redirectUris])],
    postLogoutRedirectUris: [...new Set([...urls, ...oidcClientMetadata.postLogoutRedirectUris])],
  };

  return data;
};

export default function postgresAdapter(modelName: string): ReturnType<AdapterFactory> {
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
      application_type: getApplicationTypeString(type),
      grant_types: Object.values(GrantType),
      token_endpoint_auth_method:
        type === ApplicationType.Traditional ? 'client_secret_basic' : 'none',
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
          return buildAdminConsoleClientMetadata();
        }

        return transpileClient(await findApplicationById(id));
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
        expiresAt: dayjs().add(expiresIn, 'second').valueOf(),
      }),
    find: async (id) => findPayloadById(modelName, id),
    findByUserCode: async (userCode) => findPayloadByPayloadField(modelName, 'userCode', userCode),
    findByUid: async (uid) => findPayloadByPayloadField(modelName, 'uid', uid),
    consume: async (id) => consumeInstanceById(modelName, id),
    destroy: async (id) => destroyInstanceById(modelName, id),
    revokeByGrantId: async (grantId) => revokeInstanceByGrantId(modelName, grantId),
  };
}
