import type { Event } from '@logto/schemas';
import type { Context } from 'koa';
import type { Provider } from 'oidc-provider';

import type { Identifier } from '../types/index.js';

export const assignIdentifierVerificationResult = async (
  payload: { event: Event; identifiers: Identifier[] },
  ctx: Context,
  provider: Provider
) => {
  await provider.interactionResult(ctx.req, ctx.res, payload, { mergeWithLastSubmission: true });
};
