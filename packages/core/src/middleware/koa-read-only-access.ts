import { readOnlyAccessHeader } from '@logto/schemas';
import type { MiddlewareType } from 'koa';

import RequestError from '#src/errors/RequestError/index.js';

import { type WithAuthContext } from './koa-auth/index.js';

const safeMethods: ReadonlySet<string> = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Marks a Management API request that carries the read-only access header as read-only and refuses
 * every method except GET, HEAD and OPTIONS. The header can only narrow access, so it is honored
 * from any authenticated caller, and any non-empty value but `false` counts, including joined
 * duplicates such as `false, true`.
 */
export default function koaReadOnlyAccess<
  StateT,
  ContextT extends WithAuthContext,
  ResponseBodyT,
>(): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  return async (ctx, next) => {
    const value = ctx.get(readOnlyAccessHeader);

    if (!value || value === 'false') {
      return next();
    }

    ctx.auth = { ...ctx.auth, isReadOnly: true };

    if (!safeMethods.has(ctx.method)) {
      throw new RequestError({ code: 'auth.read_only_access', status: 403 });
    }

    return next();
  };
}

/**
 * Refuses a read-only request to a GET endpoint whose payload is a credential, which the method
 * check in {@link koaReadOnlyAccess} lets through.
 */
export const assertNotReadOnly = ({ isReadOnly }: { isReadOnly?: boolean }) => {
  if (isReadOnly) {
    throw new RequestError({ code: 'auth.read_only_access', status: 403 });
  }
};
