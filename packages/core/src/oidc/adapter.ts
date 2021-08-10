import { AdapterFactory, AllClientMetadata } from 'oidc-provider';
import {
  consumeInstanceById,
  destoryInstanceById,
  findPayloadById,
  findPayloadByPayloadField,
  revokeInstanceByGrantId,
  upsertInstance,
} from '@/queries/oidc-model-instance';
import { findApplicationByClientId } from '@/queries/application';
import { ApplicationDBEntry } from '@logto/schemas';

export default function postgresAdapter(modelName: string): ReturnType<AdapterFactory> {
  if (modelName === 'Client') {
    const reject = async () => Promise.reject(new Error('Not implemented'));
    const tranpileClient = ({
      oidcClientId,
      oidcClientMetadata,
    }: ApplicationDBEntry): AllClientMetadata => ({
      client_id: oidcClientId,
      grant_types: ['authorization_code', 'refresh_token'],
      token_endpoint_auth_method: 'none',
      ...oidcClientMetadata,
    });

    return {
      upsert: reject,
      find: async (id) => tranpileClient(await findApplicationByClientId(id)),
      findByUserCode: reject,
      findByUid: reject,
      consume: reject,
      destroy: reject,
      revokeByGrantId: reject,
    };
  }

  return {
    upsert: async (id, payload, expiresIn) => upsertInstance(modelName, id, payload, expiresIn),
    find: async (id) => findPayloadById(modelName, id),
    findByUserCode: async (userCode) => findPayloadByPayloadField(modelName, 'userCode', userCode),
    findByUid: async (uid) => findPayloadByPayloadField(modelName, 'uid', uid),
    consume: async (id) => consumeInstanceById(modelName, id),
    destroy: async (id) => destoryInstanceById(modelName, id),
    revokeByGrantId: async (grantId) => revokeInstanceByGrantId(modelName, grantId),
  };
}
