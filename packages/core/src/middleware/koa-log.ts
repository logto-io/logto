import { LogPayload, LogPayloads, LogResult, LogType } from '@logto/schemas';
import { Optional } from '@silverhand/essentials';
import deepmerge from 'deepmerge';
import { MiddlewareType } from 'koa';
import { nanoid } from 'nanoid';

import { insertLog } from '@/queries/log';

export type WithLogContext<ContextT> = ContextT & {
  log: <T extends LogType>(type: T, payload: LogPayloads[T]) => void;
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
    // eslint-disable-next-line @silverhand/fp/no-let
    let logType: Optional<LogType>;
    // eslint-disable-next-line @silverhand/fp/no-let
    let logPayload: LogPayload = {};

    ctx.log = (type, payload) => {
      if (logType !== type) {
        // eslint-disable-next-line @silverhand/fp/no-mutation
        logPayload = {}; // Reset payload when type changes
      }

      // eslint-disable-next-line @silverhand/fp/no-mutation
      logType = type; // Use first initialized log type
      // eslint-disable-next-line @silverhand/fp/no-mutation
      logPayload = deepmerge(logPayload, payload);
    };

    try {
      await next();

      if (logType) {
        await saveLog(logType, { ...logPayload, result: LogResult.Success });
      }
    } catch (error: unknown) {
      if (logType) {
        await saveLog(logType, { ...logPayload, result: LogResult.Error, error: String(error) });
      }
      throw error;
    }
  };
}
