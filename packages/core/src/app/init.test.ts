import Koa from 'koa';

import * as koaErrorHandler from '#src/middleware/koa-error-handler.js';
import * as koaI18next from '#src/middleware/koa-i18next.js';
import * as koaLog from '#src/middleware/koa-log.js';
import * as koaOIDCErrorHandler from '#src/middleware/koa-oidc-error-handler.js';
import * as koaSlonikErrorHandler from '#src/middleware/koa-slonik-error-handler.js';
import * as koaSpaProxy from '#src/middleware/koa-spa-proxy.js';
import * as initOidc from '#src/oidc/init.js';
import * as initRouter from '#src/routes/init.js';

import initI18n from '../i18n/init.js';
import initApp from './init.js';

describe('App Init', () => {
  const listenMock = jest.spyOn(Koa.prototype, 'listen').mockImplementation(jest.fn());

  const middlewareList = [
    koaErrorHandler,
    koaI18next,
    koaLog,
    koaOIDCErrorHandler,
    koaSlonikErrorHandler,
    koaSpaProxy,
  ];
  const initMethods = [initRouter, initOidc];

  const middlewareSpys = middlewareList.map((module) => jest.spyOn(module, 'default'));
  const initMethodSpys = initMethods.map((module) => jest.spyOn(module, 'default'));

  it('app init properly with 404 not found route', async () => {
    const app = new Koa();
    await initI18n();
    await initApp(app);

    for (const middleware of middlewareSpys) {
      expect(middleware).toBeCalled();
    }

    for (const inits of initMethodSpys) {
      expect(inits).toBeCalled();
    }

    expect(listenMock).toBeCalled();
  });
});
