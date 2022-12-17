import type { KoaContextWithOIDC, PromptDetail } from 'oidc-provider';

import type { WithLogContext } from '#src/middleware/koa-audit-log.js';

import { extractInteractionContext } from './utils.js';

const interactionListener = (
  event: 'started' | 'ended',
  ctx: KoaContextWithOIDC & WithLogContext,
  prompt?: PromptDetail
) => {
  const log = ctx.createLog(`Interaction.${event === 'started' ? 'Create' : 'End'}`);
  log.append({ ...extractInteractionContext(ctx), prompt });
};

export const interactionStartedListener = (
  ctx: KoaContextWithOIDC & WithLogContext,
  prompt: PromptDetail
) => {
  interactionListener('started', ctx, prompt);
};

export const interactionEndedListener = (ctx: KoaContextWithOIDC & WithLogContext) => {
  interactionListener('ended', ctx);
};
