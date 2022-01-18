import { ApplicationCreate } from '@logto/schemas';
import dayjs from 'dayjs';
import { AdapterFactory, AllClientMetadata } from 'oidc-provider';
import snakecaseKeys from 'snakecase-keys';

import { findApplicationById } from '@/queries/application';
import {
  consumeInstanceById,
  destoryInstanceById,
  findPayloadById,
  findPayloadByPayloadField,
  revokeInstanceByGrantId,
  upsertInstance,
} from '@/queries/oidc-model-instance';

import { getApplicationTypeString } from './utils';

export default function postgresAdapter(modelName: string): ReturnType<AdapterFactory> {
  if (modelName === 'Client') {
    const reject = async () => Promise.reject(new Error('Not implemented'));
    const transpileClient = ({
      id: client_id,
      name: client_name,
      type,
      oidcClientMetadata,
      customClientMetadata,
    }: ApplicationCreate): AllClientMetadata => ({
      client_id,
      client_name,
      application_type: getApplicationTypeString(type),
      grant_types: ['authorization_code', 'refresh_token'],
      token_endpoint_auth_method: 'none',
      ...snakecaseKeys(oidcClientMetadata),
      ...customClientMetadata, // OIDC Provider won't camelcase custom parameter keys
    });

    return {
      upsert: reject,
      find: async (id) => transpileClient(await findApplicationById(id)),
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
    destroy: async (id) => destoryInstanceById(modelName, id),
    revokeByGrantId: async (grantId) => revokeInstanceByGrantId(modelName, grantId),
  };
}
