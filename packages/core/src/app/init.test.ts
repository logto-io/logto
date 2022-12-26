import { mockEsm, pickDefault } from '@logto/shared/esm';
import Koa from 'koa';

import { emptyMiddleware } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const middlewareList = [
  'error-handler',
  'i18next',
  'audit-log',
  'oidc-error-handler',
  'slonik-error-handler',
  'spa-proxy',
].map((name) => {
  const mock = jest.fn(() => emptyMiddleware);
  mockEsm(`#src/middleware/koa-${name}.js`, () => ({
    default: mock,
    ...(name === 'audit-log' && { LogEntry: jest.fn() }),
  }));

  return mock;
});

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
