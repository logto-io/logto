import type { LogtoErrorI18nKey } from '@logto/phrases';
import i18next from 'i18next';

import initI18n from '#src/i18n/init.js';

import RequestError from './index.js';

describe('RequestError', () => {
  beforeAll(async () => {
    await initI18n();
  });

  it('standard RequestError use LogtoErrorCode', () => {
    const errorCode = 'auth.unauthorized';
    const expectMessage = i18next.t<string, LogtoErrorI18nKey>(`errors:${errorCode}`);
    const data = { foo: 'foo' };

    const newRequestError = new RequestError(errorCode, data);

    expect(newRequestError.status).toEqual(400);
    expect(newRequestError.code).toEqual(errorCode);
    expect(newRequestError.expose).toEqual(true);
    expect(newRequestError.message).toEqual(expectMessage);
    expect(newRequestError.body).toEqual({
      code: errorCode,
      data,
      message: expectMessage,
    });
  });

  it('standard RequestError use RequestErrorMetadata', () => {
    const errorCode = 'auth.unauthorized';
    const expectMessage = i18next.t<string, LogtoErrorI18nKey>(`errors:${errorCode}`);
    const data = { foo: 'foo' };

    const newRequestError = new RequestError(
      {
        code: errorCode,
        status: 500,
        expose: false,
      },
      data
    );

    expect(newRequestError.status).toEqual(500);
    expect(newRequestError.code).toEqual(errorCode);
    expect(newRequestError.expose).toEqual(false);
    expect(newRequestError.message).toEqual(expectMessage);
    expect(newRequestError.body).toEqual({
      code: errorCode,
      data,
      message: expectMessage,
    });
  });

  it('RequestError with interpolation error message', () => {
    const errorCode = 'entity.create_failed';
    const entityName = 'mockEntity';
    const expectMessage = i18next.t<string, LogtoErrorI18nKey>(`errors:${errorCode}`, {
      name: entityName,
    });

    const newRequestError = new RequestError({
      code: errorCode,
      status: 500,
      expose: false,
      name: entityName,
    });

    expect(newRequestError.status).toEqual(500);
    expect(newRequestError.code).toEqual(errorCode);
    expect(newRequestError.expose).toEqual(false);
    expect(newRequestError.message).toEqual(expectMessage);
    expect(newRequestError.message).toContain('mockEntity');
  });
});
