import type { Provider } from 'oidc-provider';

import type { AnonymousRouter } from '../types.js';
import koaInteractionBodyGuard from './middleware/koa-interaction-body-guard.js';
import koaInteractionSieGuard from './middleware/koa-interaction-sie-guard.js';

export default function interactionRoutes<T extends AnonymousRouter>(
  router: T,
  provider: Provider
) {
  router.put(
    '/interaction',
    koaInteractionBodyGuard(),
    koaInteractionSieGuard(provider),
    async (ctx, next) => {
      return next();
    }
  );
}
