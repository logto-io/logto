import type { KoaContextWithOIDC, PromptDetail } from 'oidc-provider';

import { type EnvSet } from '#src/env-set/index.js';
import { assertLogContext } from '#src/middleware/koa-audit-log.js';

import { extractInteractionContext } from './utils.js';

const interactionListener = (
  envSet: EnvSet,
  event: 'started' | 'ended',
  ctx: KoaContextWithOIDC,
  prompt?: PromptDetail
) => {
  assertLogContext(ctx);

  const log = ctx.createLog(`Interaction.${event === 'started' ? 'Create' : 'End'}`);
  log.append({ ...extractInteractionContext(envSet, ctx), prompt });
};

export const createInteractionStartedListener =
  (envSet: EnvSet) => (ctx: KoaContextWithOIDC, prompt: PromptDetail) => {
    interactionListener(envSet, 'started', ctx, prompt);
  };

export const createInteractionEndedListener = (envSet: EnvSet) => (ctx: KoaContextWithOIDC) => {
  interactionListener(envSet, 'ended', ctx);
};
