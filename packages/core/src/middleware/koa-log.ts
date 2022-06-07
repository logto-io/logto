import { BaseLogPayload, LogPayload, LogPayloads, LogResult, LogType } from '@logto/schemas';
import deepmerge from 'deepmerge';
import { MiddlewareType } from 'koa';
import { IRouterParamContext } from 'koa-router';
import pick from 'lodash.pick';
import { nanoid } from 'nanoid';

import RequestError from '@/errors/RequestError';
import { insertLog } from '@/queries/log';

type MergeLog = <T extends LogType>(type: T, payload: LogPayloads[T]) => void;

type SessionPayload = {
  sessionId?: string;
  applicationId?: string;
};

type AddLogContext = (sessionPayload: SessionPayload) => void;

export type WithLogContext<ContextT extends IRouterParamContext = IRouterParamContext> =
  ContextT & {
    addLogContext: AddLogContext;
    log: MergeLog;
  };

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
