import type { KoaContextWithOIDC, PromptDetail } from 'oidc-provider';

import { assertLogContext } from '#src/middleware/koa-audit-log.js';

import { extractInteractionContext } from './utils.js';

const interactionListener = (
  event: 'started' | 'ended',
  ctx: KoaContextWithOIDC,
  prompt?: PromptDetail
) => {
  assertLogContext(ctx);

  const log = ctx.createLog(`Interaction.${event === 'started' ? 'Create' : 'End'}`);
  log.append({ ...extractInteractionContext(ctx), prompt });
};

export const interactionStartedListener = (ctx: KoaContextWithOIDC, prompt: PromptDetail) => {
  interactionListener('started', ctx, prompt);
};

export const interactionEndedListener = (ctx: KoaContextWithOIDC) => {
  interactionListener('ended', ctx);
};
