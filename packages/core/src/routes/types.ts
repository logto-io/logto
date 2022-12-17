import type Router from 'koa-router';
import type { KoaContextWithOIDC } from 'oidc-provider';

import type { WithLogContextLegacy } from '#src/middleware/koa-audit-log-legacy.js';
import type { WithLogContext } from '#src/middleware/koa-audit-log.js';
import type { WithAuthContext } from '#src/middleware/koa-auth.js';
import type { WithI18nContext } from '#src/middleware/koa-i18next.js';

export type AnonymousRouter = Router<
  unknown,
  WithLogContext & WithI18nContext & KoaContextWithOIDC
>;

/** @deprecated This will be removed soon. Use `kua-log-session.js` instead. */
export type AnonymousRouterLegacy = Router<unknown, WithLogContextLegacy & WithI18nContext>;

export type AuthedRouter = Router<unknown, WithAuthContext & WithLogContext & WithI18nContext>;
