import type { LogContextPayload, LogKey } from '@logto/schemas';
import { LogKeyUnknown, LogResult } from '@logto/schemas';
import type { MiddlewareType } from 'koa';
import type { IRouterParamContext } from 'koa-router';
import pick from 'lodash.pick';
import { nanoid } from 'nanoid';

import RequestError from '#src/errors/RequestError/index.js';
import { insertLog } from '#src/queries/log.js';

const removeUndefinedKeys = (object: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined));

export type LogPayload = Partial<LogContextPayload> & Record<string, unknown>;

type LogFunction = {
  (data: Readonly<LogPayload>): void;
  setKey: (key: LogKey) => void;
};

export type LogContext = {
  log: LogFunction;
};

export type WithLogContext<ContextT extends IRouterParamContext = IRouterParamContext> = ContextT &
  LogContext;

export default function koaAuditLog<
  StateT,
  ContextT extends IRouterParamContext,
  ResponseBodyT
>(): MiddlewareType<StateT, WithLogContext<ContextT>, ResponseBodyT> {
  return async (ctx, next) => {
    const {
      ip,
      headers: { 'user-agent': userAgent },
    } = ctx.request;

    // eslint-disable-next-line @silverhand/fp/no-let
    let payload: LogContextPayload = {
      key: LogKeyUnknown,
      result: LogResult.Success,
      ip,
      userAgent,
    };

    const log: LogFunction = Object.assign(
      (data: Readonly<LogPayload>) => {
        // eslint-disable-next-line @silverhand/fp/no-mutation
        payload = {
          ...payload,
          ...removeUndefinedKeys(data),
        };
      },
      {
        setKey: (key: LogKey) => {
          // eslint-disable-next-line @silverhand/fp/no-mutation
          payload = { ...payload, key };
        },
      }
    );

    ctx.log = log;

    try {
      await next();
    } catch (error: unknown) {
      log({
        result: LogResult.Error,
        error:
          error instanceof RequestError
            ? pick(error, 'message', 'code', 'data')
            : { message: String(error) },
      });
      throw error;
    } finally {
      // TODO: If no `payload.key` found, should we trigger an alert or something?
      await insertLog({
        id: nanoid(),
        type: payload.key,
        payload,
      });
    }
  };
}
