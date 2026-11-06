import { appInsights } from '@logto/app-insights/node';
import { type IRouterContext } from 'koa-router';
import { errors } from 'oidc-provider';

import { resetDevFeaturesEnabled, setDevFeaturesEnabled } from '#src/test-utils/dev-features.js';
import { i18next } from '#src/utils/i18n.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import { type WithI18nContext } from './koa-i18next.js';
import koaOidcErrorHandler, { errorOut } from './koa-oidc-error-handler.js';

const { jest } = import.meta;

describe('koaOidcErrorHandler middleware', () => {
  const next = jest.fn();

  const expectErrorResponse = async (
    ctx: WithI18nContext<IRouterContext>,
    error: errors.OIDCProviderError,
    extraMatch?: Record<string, unknown>
  ) => {
    next.mockImplementationOnce(() => {
      throw error;
    });

    const out = errorOut(error);
    const code = `oidc.${out.error}`;
    await koaOidcErrorHandler()(ctx, next);
    expect(ctx.status).toBe(error.statusCode);
    expect(ctx.body).toMatchObject({
      ...out,
      code,
      message: i18next.t('errors:' + code),
      ...extraMatch,
    });
  };

  const handleRedirectUriError = async (url: string, accept?: string) => {
    const ctx = createContextWithRouteParameters({
      url,
      ...(accept && { headers: { accept } }),
    });
    // The helper spreads the Koa context, which drops what it delegates from its prototype.
    Reflect.set(ctx, 'accepts', ctx.request.accepts.bind(ctx.request));
    Reflect.set(ctx, 'query', ctx.request.query);

    // The provider's own error handlers set the body instead of throwing.
    next.mockImplementationOnce(() => {
      ctx.status = 400;
      ctx.body = errorOut(new errors.InvalidRedirectUri());
    });
    await koaOidcErrorHandler()(ctx, next);

    return ctx;
  };

  it('should throw no errors if no errors are caught', async () => {
    const ctx = createContextWithRouteParameters();
    await expect(koaOidcErrorHandler()(ctx, next)).resolves.not.toThrow();
  });

  it('should throw original error if error type is not OIDCProviderError', async () => {
    const error = new Error('err');
    const ctx = createContextWithRouteParameters();

    next.mockImplementationOnce(() => {
      throw error;
    });

    await expect(koaOidcErrorHandler()(ctx, next)).rejects.toMatchError(error);
  });

  it('should recognize invalid scope error', async () => {
    const ctx = createContextWithRouteParameters();
    const error_description = 'Mock scope is invalid';
    const mockScope = 'read:foo';
    await expectErrorResponse(ctx, new errors.InvalidScope(error_description, mockScope), {
      message: 'Invalid scope: read:foo.',
    });
  });

  it('should not escape the interpolated scope', async () => {
    const ctx = createContextWithRouteParameters();

    await expectErrorResponse(ctx, new errors.InvalidScope('Mock scope is invalid', 'read:a&b'), {
      message: 'Invalid scope: read:a&b.',
    });
  });

  it('should transform session not found error code', async () => {
    const ctx = createContextWithRouteParameters();
    await expectErrorResponse(ctx, new errors.SessionNotFound('session not found'), {
      code: 'session.not_found',
      message: i18next.t('errors:session.not_found'),
    });
  });

  it('should add scope in response when needed', async () => {
    const error_description = 'Insufficient scope for access_token';
    const scope = 'read:foo';
    const ctx = createContextWithRouteParameters();

    await expectErrorResponse(ctx, new errors.InsufficientScope(error_description, scope), {
      scope,
      message: 'Token missing scope `read:foo`.',
    });
  });

  it('should add error uri when available', async () => {
    const error = new errors.InvalidGrant('invalid grant');
    const ctx = createContextWithRouteParameters();

    await expectErrorResponse(ctx, error, {
      error_uri: 'https://openid.sh/debug/invalid_grant',
    });
  });

  it('should expose invalid request error description', async () => {
    const ctx = createContextWithRouteParameters();

    await expectErrorResponse(
      ctx,
      new errors.InvalidRequest("Custom claims script error: 'x' not exists in 'context'."),
      {
        error_description: "Custom claims script error: 'x' not exists in 'context'.",
      }
    );
  });

  it('should handle unrecognized oidc error', async () => {
    const unrecognizedError = { error: 'some_error', error_description: 'some error description' };
    const ctx = createContextWithRouteParameters();

    ctx.status = 500;
    ctx.body = unrecognizedError;

    await koaOidcErrorHandler()(ctx, next);

    expect(ctx.status).toBe(500);
    expect(ctx.body).toMatchObject({ ...unrecognizedError, code: 'oidc.some_error' });
  });

  describe('error page', () => {
    const browserAccept =
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8';
    const code = 'oidc.invalid_redirect_uri';

    beforeEach(() => {
      setDevFeaturesEnabled(true);
    });

    afterEach(() => {
      resetDevFeaturesEnabled();
      jest.restoreAllMocks();
    });

    it.each([
      '/oidc/auth',
      '/oidc/auth/some-uid',
      '/oidc/session/end',
      '/oidc/session/end/confirm',
    ])('renders the page for a browser on %s', async (url) => {
      const ctx = await handleRedirectUriError(url, browserAccept);

      expect(ctx.status).toBe(400);
      expect(ctx.type).toBe('html');
      expect(ctx.body).toContain('<!DOCTYPE html>');
      expect(ctx.body).toContain(code);
      expect(ctx.response.get('Content-Security-Policy')).toContain("default-src 'none'");
    });

    it.each(['/oidc/token', '/oidc/device', '/oidc/authorize', '/auth', '/api/oidc/auth'])(
      'keeps the JSON body on %s',
      async (url) => {
        const ctx = await handleRedirectUriError(url, browserAccept);

        expect(ctx.body).toMatchObject({ code });
      }
    );

    it.each(['application/json', '*/*', 'text/plain', undefined])(
      'keeps the JSON body when Accept is %s',
      async (accept) => {
        const ctx = await handleRedirectUriError('/oidc/auth', accept);

        expect(ctx.body).toMatchObject({ code });
      }
    );

    it('keeps the JSON body when dev features are disabled', async () => {
      setDevFeaturesEnabled(false);

      const ctx = await handleRedirectUriError('/oidc/auth', browserAccept);

      expect(ctx.body).toMatchObject({ code });
    });

    it('keeps the raw error body when parse_error is false', async () => {
      const ctx = await handleRedirectUriError('/oidc/auth?parse_error=false', browserAccept);

      expect(ctx.body).toEqual(errorOut(new errors.InvalidRedirectUri()));
    });

    it('tracks the JSON body before rendering the page', async () => {
      const trackException = jest.spyOn(appInsights, 'trackException');

      const ctx = await handleRedirectUriError('/oidc/auth', browserAccept);

      expect(typeof ctx.body).toBe('string');
      expect(trackException).toHaveBeenCalledWith(
        expect.objectContaining({ code }),
        expect.anything()
      );
    });
  });
});
