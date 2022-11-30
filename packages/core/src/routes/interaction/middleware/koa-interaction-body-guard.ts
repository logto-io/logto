import type { MiddlewareType } from 'koa';
import koaBody from 'koa-body';

import RequestError from '#src/errors/RequestError/index.js';

import type { InteractionPayload } from '../types/guard.js';
import { interactionPayloadGuard } from '../types/guard.js';

export type WithGuardedIdentifierPayloadContext<ContextT> = ContextT & {
  interactionPayload: InteractionPayload;
};

const parse = (data: unknown) => {
  try {
    return interactionPayloadGuard.parse(data);
  } catch (error: unknown) {
    throw new RequestError({ code: 'guard.invalid_input' }, error);
  }
};

/**
 *  Need this as our koaGuard does not infer the body type properly
 *  from the ZodEffects Output after data transform
 */
export default function koaInteractionBodyGuard<StateT, ContextT, ResponseT>(): MiddlewareType<
  StateT,
  WithGuardedIdentifierPayloadContext<ContextT>,
  ResponseT
> {
  return async (ctx, next) => {
    return koaBody<StateT, ContextT>()(ctx, async () => {
      ctx.interactionPayload = parse(ctx.request.body);

      return next();
    });
  };
}
