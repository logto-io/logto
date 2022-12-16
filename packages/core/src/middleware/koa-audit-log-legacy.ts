import { LogResult } from '@logto/schemas';
import type {
  BaseLogPayload,
  LogPayload,
  LogPayloads,
  LogType,
} from '@logto/schemas/lib/types/log-legacy.js';
import deepmerge from 'deepmerge';
import type { MiddlewareType } from 'koa';
import type { IRouterParamContext } from 'koa-router';
import pick from 'lodash.pick';
import { nanoid } from 'nanoid';

import RequestError from '#src/errors/RequestError/index.js';
import { insertLog } from '#src/queries/log.js';

type MergeLog = <T extends LogType>(type: T, payload: LogPayloads[T]) => void;

type SessionPayload = {
  sessionId?: string;
  applicationId?: string;
};

type AddLogContext = (sessionPayload: SessionPayload) => void;

/** @deprecated This will be removed soon. Use `kua-audit-log.js` instead. */
export type LogContextLegacy = {
  addLogContext: AddLogContext;
  log: MergeLog;
};

/** @deprecated This will be removed soon. Use `kua-audit-log.js` instead. */
export type WithLogContextLegacy<ContextT extends IRouterParamContext = IRouterParamContext> =
  ContextT & LogContextLegacy;

type Logger = {
  type?: LogType;
  basePayload?: BaseLogPayload;
  payload: LogPayload;
  set: (basePayload: BaseLogPayload) => void;
  log: MergeLog;
  save: () => Promise<void>;
};

/* eslint-disable @silverhand/fp/no-mutation */
const initLogger = (basePayload?: Readonly<BaseLogPayload>) => {
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

/** @deprecated This will be removed soon. Use `kua-audit-log.js` instead. */
export default function koaAuditLogLegacy<
  StateT,
  ContextT extends IRouterParamContext,
  ResponseBodyT
>(): MiddlewareType<StateT, WithLogContextLegacy<ContextT>, ResponseBodyT> {
  return async (ctx, next) => {
    const {
      ip,
      headers: { 'user-agent': userAgent },
    } = ctx.request;

    const logger = initLogger({ result: LogResult.Success, ip, userAgent });
    ctx.addLogContext = logger.set;
    ctx.log = logger.log;

    try {
      await next();
    } catch (error: unknown) {
      logger.set({
        result: LogResult.Error,
        error:
          error instanceof RequestError
            ? pick(error, 'message', 'code', 'data')
            : { message: String(error) },
      });
      throw error;
    } finally {
      await logger.save();
    }
  };
}
