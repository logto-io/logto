import resources from '@logto/phrases';

import RequestError from '#src/errors/RequestError/index.js';
import initI18n from '#src/i18n/init.js';
import { i18next } from '#src/utils/i18n.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import koaI18next from './koa-i18next.js';

const { jest } = import.meta;

describe('koaI18next', () => {
  const next = jest.fn();

  beforeAll(async () => {
    await initI18n();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    ['zh-cn', 'zh-CN'],
    ['es-MX', 'es'],
    ['fr-CA', 'fr'],
    ['pt-BR', 'pt-BR'],
    ['pt-PT', 'pt-PT'],
    ['pl', 'pl-PL'],
    ['en;q=0.5,es-MX;q=0.9', 'es'],
    ['es-MX;q=0.5,fr;q=0.9', 'fr'],
    ['xx-XX,fr-CA;q=0.9', 'fr'],
    ['xx-XX', 'en'],
    ['*', 'en'],
    ['', 'en'],
  ] as const)('localizes API errors for Accept-Language %s to %s', async (language, expected) => {
    const ctx = {
      ...createContextWithRouteParameters({ headers: { 'accept-language': language } }),
      query: {},
    };

    await koaI18next()(ctx, next);

    expect(ctx.locale).toEqual(expected);
    expect(new RequestError('session.not_found').toBody(ctx.i18n)).toMatchObject({
      code: 'session.not_found',
      message: resources[expected].errors?.session?.not_found,
    });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('prioritizes the locale query over Accept-Language', async () => {
    const ctx = {
      ...createContextWithRouteParameters({ headers: { 'accept-language': 'es' } }),
      query: { locale: 'fr-CA' },
    };

    await koaI18next()(ctx, next);

    expect(ctx.locale).toEqual('fr');
  });

  it('keeps the language scoped to each request', async () => {
    const spanishContext = {
      ...createContextWithRouteParameters({ headers: { 'accept-language': 'es-MX' } }),
      query: {},
    };
    const frenchContext = {
      ...createContextWithRouteParameters({ headers: { 'accept-language': 'fr-CA' } }),
      query: {},
    };

    await koaI18next()(spanishContext, next);
    await koaI18next()(frenchContext, next);

    expect(spanishContext.i18n.language).toEqual('es');
    expect(frenchContext.i18n.language).toEqual('fr');
    expect(spanishContext.i18n).not.toBe(frenchContext.i18n);
    expect(spanishContext.i18n).not.toBe(i18next);
    expect(i18next.language).toEqual('en');
  });
});
