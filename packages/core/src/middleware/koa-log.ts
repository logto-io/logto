import {
  BaseLogPayload,
  SessionLogPayload,
  LogPayload,
  LogPayloads,
  LogResult,
  LogType,
} from '@logto/schemas';
import deepmerge from 'deepmerge';
import { MiddlewareType } from 'koa';
import { IRouterParamContext } from 'koa-router';
import { nanoid } from 'nanoid';

import { insertLog } from '@/queries/log';

type MergeLog = <T extends LogType>(type: T, payload: LogPayloads[T]) => void;

type MergeSessionLog = (sessionPayload: SessionLogPayload) => void;

export type WithLogContext<ContextT extends IRouterParamContext = IRouterParamContext> =
  ContextT & {
    logSession: MergeSessionLog;
    log: MergeLog;
  };

type Logger = {
  type?: LogType;
  basePayload?: BaseLogPayload;
  sessionPayload: SessionLogPayload;
  payload: LogPayload;
  set: (basePayload: BaseLogPayload) => void;
  logSession: MergeSessionLog;
  log: MergeLog;
  save: () => Promise<void>;
};

/* eslint-disable @silverhand/fp/no-mutation */
const initLogger = (basePayload?: Readonly<BaseLogPayload>) => {
  const logger: Logger = {
    type: undefined,
    basePayload,
    sessionPayload: {},
    payload: {},
    set: (basePayload) => {
      logger.basePayload = {
        ...logger.basePayload,
        ...basePayload,
      };
    },
    logSession: (sessionPayload: SessionLogPayload) => {
      logger.sessionPayload = deepmerge(logger.sessionPayload, sessionPayload);
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
          ...logger.sessionPayload,
          ...logger.payload,
        },
      });
    },
  };

  return logger;
};
/* eslint-enable @silverhand/fp/no-mutation */

export default function koaLog<
  StateT,
  ContextT extends IRouterParamContext,
  ResponseBodyT
>(): MiddlewareType<StateT, WithLogContext<ContextT>, ResponseBodyT> {
  return async (ctx, next) => {
    const {
      ip,
      headers: { 'user-agent': userAgent },
    } = ctx.request;

    const logger = initLogger({ result: LogResult.Success, ip, userAgent });
    ctx.logSession = logger.logSession;
    ctx.log = logger.log;

    try {
      await next();
    } catch (error: unknown) {
      logger.set({ result: LogResult.Error, error: String(error) });
      throw error;
    } finally {
      await logger.save();
    }
  };
}
