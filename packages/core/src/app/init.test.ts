import Koa from 'koa';
import request from 'supertest';

import { envVariablesSetUp } from '@/utils/test-utils';

/**
 * Need to mock env variables ahead
 */

envVariablesSetUp();

/* eslint-disable import/first */
import initI18n from '../i18n/init';
import initApp from './init';
/* eslint-enable import/first */

describe('App Init', () => {
  jest.mock('jose/jwk/from_key_like', () => ({
    fromKeyLike: jest.fn(),
  }));

  it('app init properly with 404 not found route', async () => {
    const app = new Koa();
    await initI18n();
    const server = await initApp(app);
    const response = await request(app.callback()).get('/oidc/test');
    expect(response.status).toBe(404);
    server.close();
  });
});
