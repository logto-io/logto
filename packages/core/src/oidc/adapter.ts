import { ApplicationDBEntry, UserLogResult, UserLogType } from '@logto/schemas';
import dayjs from 'dayjs';
import { nanoid } from 'nanoid';
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
import { insertUserLog } from '@/queries/user-log';

export default function postgresAdapter(modelName: string): ReturnType<AdapterFactory> {
  if (modelName === 'Client') {
    const reject = async () => Promise.reject(new Error('Not implemented'));
    const transpileClient = ({
      id,
      oidcClientMetadata,
    }: ApplicationDBEntry): AllClientMetadata => ({
      client_id: id,
      grant_types: ['authorization_code', 'refresh_token'],
      token_endpoint_auth_method: 'none',
      ...snakecaseKeys(oidcClientMetadata),
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
    upsert: async (id, payload, expiresIn) => {
      if (modelName === 'AccessToken' && payload.accountId) {
        const application = payload.clientId ? await findApplicationById(payload.clientId) : null;

        await insertUserLog({
          id: nanoid(),
          userId: payload.accountId,
          type: UserLogType.ExchangeAccessToken,
          result: UserLogResult.Success,
          payload: {
            applicationId: payload.clientId,
            applicationName: application ? application.name : undefined,
            details: {
              scope: payload.scope,
              grantId: payload.grantId,
              sessionUid: payload.sessionUid,
              exp: payload.exp,
              iat: payload.iat,
              gty: payload.gty,
            },
          },
        });
      }

      return upsertInstance({
        modelName,
        id,
        payload,
        expiresAt: dayjs().add(expiresIn, 'second').valueOf(),
      });
    },
    find: async (id) => findPayloadById(modelName, id),
    findByUserCode: async (userCode) => findPayloadByPayloadField(modelName, 'userCode', userCode),
    findByUid: async (uid) => findPayloadByPayloadField(modelName, 'uid', uid),
    consume: async (id) => consumeInstanceById(modelName, id),
    destroy: async (id) => destoryInstanceById(modelName, id),
    revokeByGrantId: async (grantId) => revokeInstanceByGrantId(modelName, grantId),
  };
}
