import { mockEsmDefault, pickDefault } from '@logto/shared/esm';
import Koa from 'koa';

import { emptyMiddleware } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const middlewareList = [
  jest.fn(() => emptyMiddleware),
  jest.fn(() => emptyMiddleware),
  jest.fn(() => emptyMiddleware),
  jest.fn(() => emptyMiddleware),
  jest.fn(() => emptyMiddleware),
  jest.fn(() => emptyMiddleware),
] as const;

mockEsmDefault('#src/middleware/koa-error-handler.js', () => middlewareList[0]);
mockEsmDefault('#src/middleware/koa-i18next.js', () => middlewareList[1]);
mockEsmDefault('#src/middleware/koa-log.js', () => middlewareList[2]);
mockEsmDefault('#src/middleware/koa-oidc-error-handler.js', () => middlewareList[3]);
mockEsmDefault('#src/middleware/koa-slonik-error-handler.js', () => middlewareList[4]);
mockEsmDefault('#src/middleware/koa-spa-proxy.js', () => middlewareList[5]);

const initI18n = await pickDefault(import('../i18n/init.js'));
const initApp = await pickDefault(import('./init.js'));

describe('App Init', () => {
  const listenMock = jest.spyOn(Koa.prototype, 'listen').mockImplementation(jest.fn());

  it('app init properly with 404 not found route', async () => {
    const app = new Koa();
    await initI18n();
    await initApp(app);

    for (const middleware of middlewareList) {
      expect(middleware).toBeCalled();
    }

    expect(listenMock).toBeCalled();
  });
});
