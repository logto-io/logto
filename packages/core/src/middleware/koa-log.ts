import { BaseLogPayload, LogPayload, LogPayloads, LogResult, LogType } from '@logto/schemas';
import { Optional } from '@silverhand/essentials';
import deepmerge from 'deepmerge';
import { MiddlewareType } from 'koa';
import { nanoid } from 'nanoid';

import { insertLog } from '@/queries/log';

type MergeLog = <T extends LogType>(type: T, payload: LogPayloads[T]) => void;

export type WithLogContext<ContextT> = ContextT & { log: MergeLog };

const initLog = (baseLogPayload?: Readonly<BaseLogPayload>) => {
  /* eslint-disable @silverhand/fp/no-let */
  let type: Optional<LogType>;
  let payload: LogPayload;
  /* eslint-enable @silverhand/fp/no-let */

  /* eslint-disable @silverhand/fp/no-mutation */
  const mergeLog: MergeLog = (logType, logPayload) => {
    if (type !== logType) {
      // Reset payload when type changes
      payload = { result: LogResult.Success, ...baseLogPayload };
    }

    type = logType;
    payload = deepmerge(payload, logPayload);
  };

  const mergeLogError = (error: unknown) => {
    payload = deepmerge(payload, { result: LogResult.Error, error: String(error) });
  };
  /* eslint-enable @silverhand/fp/no-mutation */

  const getLog = () => ({ type, payload });

  return { mergeLog, mergeLogError, getLog };
};

const saveLog = async (type: LogType, payload: LogPayload) => {
  try {
    await insertLog({
      id: nanoid(),
      type,
      payload,
    });
  } catch (error: unknown) {
    console.error('An error occurred while inserting log');
    console.error(error);
  }
};

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

    const { mergeLog, mergeLogError, getLog } = initLog({ ip, userAgent });
    ctx.log = mergeLog;

    try {
      await next();
    } catch (error: unknown) {
      mergeLogError(error);
      throw error;
    } finally {
      const { type, payload } = getLog();

      if (type) {
        void saveLog(type, payload);
      }
    }
  };
}
