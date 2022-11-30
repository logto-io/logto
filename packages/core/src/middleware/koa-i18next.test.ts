import i18next from 'i18next';

import initI18n from '#src/i18n/init.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import koaI18next from './koa-i18next.js';

// Can not access outter scope function in jest mock
// eslint-disable-next-line unicorn/consistent-function-scoping
jest.mock('#src/i18n/detect-language.js', () => () => ['zh-cn']);
const changLanguageSpy = jest.spyOn(i18next, 'changeLanguage');

describe('koaI18next', () => {
  const next = jest.fn();

  it('detect language', async () => {
    const ctx = {
      ...createContextWithRouteParameters(),
      query: {},
      locale: 'en',
    };
    await initI18n();
    await koaI18next()(ctx, next);
    expect(ctx.locale).toEqual('zh-CN');
    expect(changLanguageSpy).toBeCalled();
  });
});
