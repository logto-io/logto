import { deviceFlowXsrfCookieKey } from '@logto/schemas';
import { type MiddlewareType } from 'koa';

type DeviceAuthorizationBody = {
  verification_uri: string;
  verification_uri_complete: string;
};

const isDeviceAuthorizationBody = (value: unknown): value is DeviceAuthorizationBody =>
  typeof value === 'object' &&
  value !== null &&
  'verification_uri' in value &&
  typeof value.verification_uri === 'string';

const shortenVerificationUri = (uri: string): string => uri.replace('/oidc/device', '/device');

/**
 * Makes `/device` work as a shorthand for `/oidc/device` since device flow users may need to
 * manually type the verification URL on input-constrained devices (smart TVs, CLI tools, etc.).
 *
 * - Rewrites `verification_uri(_complete)` in `POST /oidc/device/auth` responses.
 * - Redirects `GET /device` → `/oidc/device` when the XSRF cookie is absent (first visit);
 *   once the provider sets the cookie and redirects back, the request falls through to the
 *   Experience SPA. This avoids a redirect loop with the provider's own redirect to `/device`.
 */
export default function koaDeviceFlowShortcut<
  StateT,
  ContextT extends {
    path: string;
    method: string;
    body?: unknown;
    search: string;
    cookies: { get: (name: string) => string | undefined };
    redirect: (url: string) => void;
  },
  ResponseBodyT,
>(): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  return async (ctx, next) => {
    if (
      ctx.path === '/device' &&
      ctx.method === 'GET' &&
      /**
       * When the XSRF cookie is absent the user hasn't been through the oidc-provider yet;
       * redirect to /oidc/device so it can create a session and set the cookie. When the
       * provider redirects back to /device the cookie will be present and we fall through to
       * the Experience SPA, breaking the loop.
       */
      !ctx.cookies.get(String(deviceFlowXsrfCookieKey))
    ) {
      ctx.redirect(`/oidc/device${ctx.search}`);
      return;
    }

    await next();

    if (
      ctx.path === '/oidc/device/auth' &&
      ctx.method === 'POST' &&
      isDeviceAuthorizationBody(ctx.body)
    ) {
      ctx.body = {
        ...ctx.body,
        verification_uri: shortenVerificationUri(ctx.body.verification_uri),
        verification_uri_complete: shortenVerificationUri(ctx.body.verification_uri_complete),
      };
    }
  };
}
