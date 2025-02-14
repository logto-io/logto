import { pickDefault, createMockUtils } from '@logto/shared/esm';

import { i18next } from '#src/utils/i18n.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

const { jest } = import.meta;
const { mockEsmDefault } = createMockUtils(jest);

const mockLanguage = () => ['zh-cn'];
mockEsmDefault('#src/i18n/detect-language.js', () => mockLanguage);

const initI18n = await pickDefault(import('#src/i18n/init.js'));
const koaI18next = await pickDefault(import('./koa-i18next.js'));
const cloneInstanceSpy = jest.spyOn(i18next, 'cloneInstance');

describe('koaI18next', () => {
  const next = jest.fn();

  it('detect language', async () => {
    const ctx = {
      ...createContextWithRouteParameters(),
      query: {},
      i18n: i18next,
      locale: '',
    };
    await initI18n();
    await koaI18next()(ctx, next);
    expect(ctx.locale).toEqual('zh-CN');
    expect(cloneInstanceSpy).toBeCalled();
  });
});
