import { ReservedScope } from '@logto/core-kit';
import { Prompt } from '@logto/js';
import type { MiddlewareType } from 'koa';

import type { EnvSet } from '#src/env-set/index.js';
import { shouldTreatAsCimdClient } from '#src/oidc/cimd/index.js';
import type Queries from '#src/tenants/Queries.js';

/**
 * The provider drops `offline_access` unless `prompt` contains `consent` (OpenID Connect Core
 * §11), but the MCP authorization spec only asks clients to request the scope, so they never get
 * a refresh token.
 */
export default function koaCimdOfflineAccessConsentPrompt<StateT, ContextT, ResponseBodyT>(
  envSet: EnvSet,
  { logtoConfigs: { getCimdConfig } }: Queries
): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  return async (ctx, next) => {
    const { query } = ctx.request;
    const { client_id: clientId, scope, prompt = '' } = query;

    // Array values are duplicated parameters, which the provider rejects as they are.
    if (
      ctx.path !== '/auth' ||
      typeof clientId !== 'string' ||
      typeof scope !== 'string' ||
      typeof prompt !== 'string' ||
      !shouldTreatAsCimdClient(envSet, clientId) ||
      !scope.split(' ').includes(ReservedScope.OfflineAccess)
    ) {
      return next();
    }

    const prompts = prompt.split(' ');

    // `prompt=none` must be used alone and forbids any interaction.
    if (prompts.includes(Prompt.Consent) || prompts.includes(Prompt.None)) {
      return next();
    }

    const { addConsentPromptForOfflineAccess } = await getCimdConfig();

    if (!addConsentPromptForOfflineAccess) {
      return next();
    }

    ctx.request.query = {
      ...query,
      prompt: prompt ? `${prompt} ${Prompt.Consent}` : Prompt.Consent,
    };

    return next();
  };
}
