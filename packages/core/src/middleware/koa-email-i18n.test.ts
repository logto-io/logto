import { pickDefault } from '@logto/shared/esm';

import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const { MockQueries } = await import('#src/test-utils/tenant.js');
const findAllCustomLanguageTags = jest.fn();

const queries = new MockQueries({
  customPhrases: { findAllCustomLanguageTags },
  signInExperiences: {
    findDefaultSignInExperience: jest.fn().mockResolvedValue({
      languageInfo: {
        autoDetect: true,
        fallbackLanguage: 'en',
      },
    }),
  },
});

const koaEmailI18n = await pickDefault(import('./koa-email-i18n.js'));

describe('koaEmailI18n', () => {
  const next = jest.fn();

  it('should resolve fr as fr-CA is not a built-in language', async () => {
    const ctx = {
      ...createContextWithRouteParameters({
        cookies: { _logto: '{ "uiLocales": "fr-CA fr" }' },
        headers: { 'accept-language': 'fr' },
      }),
      query: { locale: 'fr' },
    };
    findAllCustomLanguageTags.mockResolvedValueOnce([]);
    await koaEmailI18n(queries)(ctx, next);
    expect(ctx.emailI18n?.locale).toEqual('fr');
    expect(ctx.emailI18n?.uiLocales).toEqual('fr-CA fr');
  });

  it('should resolve fr-CA after adding fr-CA as a custom language', async () => {
    const ctx = {
      ...createContextWithRouteParameters({
        cookies: { _logto: '{ "uiLocales": "fr-CA fr" }' },
        headers: { 'accept-language': 'fr' },
      }),
      query: {},
    };
    findAllCustomLanguageTags.mockResolvedValueOnce(['fr-CA']);
    await koaEmailI18n(queries)(ctx, next);
    expect(ctx.emailI18n?.locale).toEqual('fr-CA');
    expect(ctx.emailI18n?.uiLocales).toEqual('fr-CA fr');
  });

  it('should resolve fallback language when no match found', async () => {
    const ctx = {
      ...createContextWithRouteParameters({
        cookies: { _logto: '{ "uiLocales": "de-DE" }' },
      }),
      query: {},
    };
    findAllCustomLanguageTags.mockResolvedValueOnce(['fr-CA']);
    await koaEmailI18n(queries)(ctx, next);
    expect(ctx.emailI18n?.locale).toEqual('en');
    expect(ctx.emailI18n?.uiLocales).toEqual('de-DE');
  });

  it('should not include `uiLocales` when no `ui_locales` param is provided', async () => {
    const ctx = {
      ...createContextWithRouteParameters({
        headers: { 'accept-language': 'ja' },
      }),
      query: {},
    };
    findAllCustomLanguageTags.mockResolvedValueOnce([]);
    await koaEmailI18n(queries)(ctx, next);
    expect(ctx.emailI18n?.locale).toEqual('ja');
    expect(ctx.emailI18n?.uiLocales).toBeUndefined();
  });
});
