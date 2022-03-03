import Koa from 'koa';

import * as koaErrorHandler from '@/middleware/koa-error-handler';
import * as koaI18next from '@/middleware/koa-i18next';
import * as koaOIDCErrorHandler from '@/middleware/koa-oidc-error-handler';
import * as koaSlonikErrorHandler from '@/middleware/koa-slonik-error-handler';
import * as koaSpaProxy from '@/middleware/koa-spa-proxy';
import * as koaUserLog from '@/middleware/koa-user-log';
import * as initOidc from '@/oidc/init';
import * as initRouter from '@/routes/init';

import initI18n from '../i18n/init';
import initApp from './init';

describe('App Init', () => {
  const listenMock = jest.spyOn(Koa.prototype, 'listen').mockImplementation(jest.fn());

  const middlewareList = [
    koaErrorHandler,
    koaI18next,
    koaOIDCErrorHandler,
    koaSlonikErrorHandler,
    koaSpaProxy,
    koaUserLog,
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
