import {
  adminConsoleApplicationId,
  ApplicationType,
  CreateApplication,
  GrantType,
} from '@logto/schemas';
import dayjs from 'dayjs';
import { AdapterFactory, AllClientMetadata } from 'oidc-provider';
import snakecaseKeys from 'snakecase-keys';

import envSet from '@/env-set';
import { findApplicationById } from '@/queries/application';
import {
  consumeInstanceById,
  destroyInstanceById,
  findPayloadById,
  findPayloadByPayloadField,
  revokeInstanceByGrantId,
  upsertInstance,
} from '@/queries/oidc-model-instance';

import { getApplicationTypeString } from './utils';

const buildAdminConsoleClientMetadata = (): AllClientMetadata => {
  const { localhostUrl, adminConsoleUrl } = envSet.values;
  const urls = [...new Set([`${localhostUrl}/console`, adminConsoleUrl])];

  return {
    client_id: adminConsoleApplicationId,
    client_name: 'Admin Console',
    application_type: getApplicationTypeString(ApplicationType.SPA),
    grant_types: Object.values(GrantType),
    token_endpoint_auth_method: 'none',
    redirect_uris: urls.map((url) => `${url}/callback`),
    post_logout_redirect_uris: urls,
  };
};

export default function postgresAdapter(modelName: string): ReturnType<AdapterFactory> {
  if (modelName === 'Client') {
    const reject = async () => Promise.reject(new Error('Not implemented'));
    const transpileClient = ({
      id: client_id,
      name: client_name,
      type,
      oidcClientMetadata,
      customClientMetadata,
    }: CreateApplication): AllClientMetadata => ({
      client_id,
      client_name,
      application_type: getApplicationTypeString(type),
      grant_types: Object.values(GrantType),
      token_endpoint_auth_method: 'none',
      ...snakecaseKeys(oidcClientMetadata),
      ...customClientMetadata, // OIDC Provider won't camelcase custom parameter keys
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
