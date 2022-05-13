import {
  BaseLogPayload,
  GrantType,
  IssuedTokenType,
  LogPayload,
  LogPayloads,
  LogResult,
  LogType,
} from '@logto/schemas';
import { notFalsy } from '@silverhand/essentials';
import deepmerge from 'deepmerge';
import { nanoid } from 'nanoid';
import { KoaContextWithOIDC } from 'oidc-provider';

import { insertLog } from '@/queries/log';

export type MergeLog = <T extends LogType>(type: T, payload: LogPayloads[T]) => void;

type Logger = {
  type?: LogType;
  basePayload?: BaseLogPayload;
  payload: LogPayload;
  set: (basePayload: BaseLogPayload) => void;
  log: MergeLog;
  save: () => Promise<void>;
};

/* eslint-disable @silverhand/fp/no-mutation */
export const initLogger = (basePayload?: Readonly<BaseLogPayload>) => {
  const logger: Logger = {
    type: undefined,
    basePayload,
    payload: {},
    set: (basePayload) => {
      logger.basePayload = {
        ...logger.basePayload,
        ...basePayload,
      };
    },
    log: (type, payload) => {
      if (type !== logger.type) {
        logger.type = type;
        logger.payload = payload;

        return;
      }

      logger.payload = deepmerge(logger.payload, payload);
    },
    save: async () => {
      if (!logger.type) {
        return;
      }

      await insertLog({
        id: nanoid(),
        type: logger.type,
        payload: {
          ...logger.basePayload,
          ...logger.payload,
        },
      });
    },
  };

  return logger;
};
/* eslint-enable @silverhand/fp/no-mutation */

/**
 * See https://github.com/panva/node-oidc-provider/tree/main/lib/actions/grants
 * - https://github.com/panva/node-oidc-provider/blob/564b1095ee869c89381d63dfdb5875c99f870f5f/lib/actions/grants/authorization_code.js#L209
 * - https://github.com/panva/node-oidc-provider/blob/564b1095ee869c89381d63dfdb5875c99f870f5f/lib/actions/grants/refresh_token.js#L225
 * - ……
 */
interface GrantBody {
  access_token?: string;
  refresh_token?: string;
  id_token?: string;
  scope?: string;
}

export const initTokenExchangeSuccessLogger = () => {
  return async (ctx: KoaContextWithOIDC & { body: GrantBody }) => {
    const {
      oidc: {
        entities: { Account: account, Grant: grant, Client: client },
        params,
      },
      request: {
        ip,
        headers: { 'user-agent': userAgent },
      },
      body,
    } = ctx;

    const grantType = params?.grant_type;
    const logType: LogType =
      grantType === GrantType.AuthorizationCode ? 'CodeExchangeToken' : 'RefreshTokenExchangeToken';

    const { access_token, refresh_token, id_token, scope } = body;
    const issued: IssuedTokenType[] = [
      access_token && 'accessToken',
      refresh_token && 'refreshToken',
      id_token && 'idToken',
    ].filter((value): value is IssuedTokenType => notFalsy(value));

    const logger = initLogger({
      result: LogResult.Success,
      ip,
      userAgent,
      applicationId: client?.clientId,
      sessionId: grant?.jti,
    });
    const userId = account?.accountId;
    logger.log(logType, { userId, params, issued, scope });
    await logger.save();
  };
};
