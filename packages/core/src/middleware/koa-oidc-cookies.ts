import type { MiddlewareType } from 'koa';
import { type Provider } from 'oidc-provider';

/**
 * Bind `ctx.cookies` to a context created by the provider itself, so every cookie operation uses
 * the provider's `cookies.keys` configuration.
 *
 * Logto mounts the provider into its own Koa apps via `koa-mount`, which reuses the context
 * created by the outermost Koa app, so `ctx.cookies` is bound to that app's (unset) `keys`.
 * Since v9, oidc-provider reads and writes through `ctx.cookies` directly — it previously
 * created its own cookies instance carrying the configured `cookies.keys` — and signed cookies
 * would fail with ".keys required for signed cookies" without the rebinding.
 *
 * Register before every other provider middleware so all downstream cookie operations go
 * through the rebound instance.
 */
export default function koaOidcCookies<StateT, ContextT>(
  provider: Provider
): MiddlewareType<StateT, ContextT> {
  return async (ctx, next) => {
    const { cookies } = provider.createContext(ctx.req, ctx.res);
    /**
     * Upgrade the cookie `secure` flag from the outer context: the provider itself may not be
     * aware of TLS offloading while the outer app is (e.g., `trust proxy`).
     */
    // eslint-disable-next-line @silverhand/fp/no-mutation
    cookies.secure ||= ctx.secure;
    ctx.cookies = cookies;

    return next();
  };
}
