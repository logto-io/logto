import { BaseLogPayload, LogPayload, LogPayloads, LogResult, LogType } from '@logto/schemas';
import deepmerge from 'deepmerge';
import { MiddlewareType } from 'koa';
import { nanoid } from 'nanoid';

import { insertLog } from '@/queries/log';

type MergeLog = <T extends LogType>(type: T, payload: LogPayloads[T] & BaseLogPayload) => void;

export type WithLogContext<ContextT> = ContextT & { log: MergeLog };

type Logger = {
  type?: LogType;
  basePayload: BaseLogPayload;
  logPayload: LogPayload;
  set: (base: BaseLogPayload) => void;
  log: MergeLog;
  save: () => Promise<void> | undefined;
};

/* eslint-disable @silverhand/fp/no-mutation */
const logger: Logger = {
  type: undefined,
  basePayload: {},
  logPayload: {},
  set: (basePayload) => {
    logger.basePayload = { ...logger.basePayload, ...basePayload };
  },
  log: (type, payload) => {
    if (type !== logger.type) {
      logger.type = type;
      logger.logPayload = payload;

      return;
    }

    logger.logPayload = deepmerge(logger.logPayload, payload);
  },
  save: () => {
    if (!logger.type) {
      return;
    }

    return insertLog({
      id: nanoid(),
      type: logger.type,
      payload: { ...logger.basePayload, ...logger.logPayload },
    });
  },
};
/* eslint-enable @silverhand/fp/no-mutation */

export default function koaLog<StateT, ContextT, ResponseBodyT>(): MiddlewareType<
  StateT,
  WithLogContext<ContextT>,
  ResponseBodyT
> {
  return async (ctx, next) => {
    const {
      ip,
      headers: { 'user-agent': userAgent },
    } = ctx.request;

    logger.set({ ip, userAgent });
    ctx.log = logger.log;

    try {
      await next();
    } catch (error: unknown) {
      logger.set({ result: LogResult.Error, error: String(error) });
      throw error;
    } finally {
      void logger.save();
    }
  };
}
