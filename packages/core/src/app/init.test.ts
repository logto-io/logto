import { createServer } from 'http';

import { pickDefault } from '@logto/shared/esm';
import Koa from 'koa';

const { jest } = import.meta;

const initI18n = await pickDefault(import('../i18n/init.js'));
const initApp = await pickDefault(import('./init.js'));

describe('App Init', () => {
  const listenMock = jest
    .spyOn(Koa.prototype, 'listen')
    .mockImplementation(jest.fn(() => createServer()));

  it('app init properly with 404 not found route', async () => {
    const app = new Koa();
    await initI18n();
    await initApp(app);

    expect(listenMock).toBeCalled();
  });
});
