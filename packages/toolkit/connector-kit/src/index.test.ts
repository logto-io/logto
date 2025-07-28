import nock from 'nock';
import { describe, it, expect, afterEach } from 'vitest';
import { z } from 'zod';

import {
  parseJson,
  parseJsonObject,
  replaceSendMessageHandlebars,
  validateConfig,
  getValue,
  getAccessTokenByRefreshToken,
} from './index.js';

describe('validateConfig', () => {
  it('valid config', () => {
    const testingTypeGuard = z.unknown();
    const testingConfig = { foo: 'foo', bar: 1, baz: true };
    expect(() => {
      validateConfig(testingConfig, testingTypeGuard);
    }).not.toThrow();
  });

  it('invalid config', () => {
    const testingTypeGuard = z.record(z.string());
    const testingConfig = { foo: 'foo', bar: 1 };
    expect(() => {
      validateConfig(testingConfig, testingTypeGuard);
    }).toThrow();
  });
});

describe('parseJson', () => {
  it('should return parsed result', () => {
    const literalContent = 'foo';
    expect(parseJson(JSON.stringify(literalContent))).toEqual(literalContent);

    const objectContent = { foo: 'foo', bar: 1, baz: true, qux: [1, '2', null] };
    expect(parseJson(JSON.stringify(objectContent))).toEqual(objectContent);
  });

  it('throw error when parsing invalid Json string', () => {
    expect(() => parseJson('[1,2,3,"4",]')).toThrow();
  });
});

describe('parseJsonObject', () => {
  it('should return parsed object', () => {
    const objectContent = { foo: 'foo', bar: 1, baz: true, qux: [1, '2', null] };
    expect(parseJsonObject(JSON.stringify(objectContent))).toEqual(objectContent);
  });

  it('throw error when parsing non-object result', () => {
    expect(() => parseJsonObject(JSON.stringify('foo'))).toThrow();
  });
});

describe('replaceSendMessageHandlebars', () => {
  it('should replace handlebars with payload', () => {
    const template = 'Your verification code is {{code}}';
    const payload = { code: '123456' };
    expect(replaceSendMessageHandlebars(template, payload)).toEqual(
      'Your verification code is 123456'
    );
  });

  it('should not replace handlebars if payload does not contain the key', () => {
    const template = 'Your verification code is {{code}}';
    const payload = {};
    expect(replaceSendMessageHandlebars(template, payload)).toEqual(
      'Your verification code is {{code}}'
    );
  });

  it('should replace all handlebars even they are not in the predefined list for payload', () => {
    const template = 'Your verification code is {{code}} and {{foo}}';
    const payload = { code: '123456', foo: 'bar' };
    expect(replaceSendMessageHandlebars(template, payload)).toEqual(
      'Your verification code is 123456 and bar'
    );
  });

  it('should ignore handlebars that are not in the payload', () => {
    const template = 'Your verification code is {{code}} and {{foo}}';
    const payload = { code: '123456' };
    expect(replaceSendMessageHandlebars(template, payload)).toEqual(
      'Your verification code is 123456 and {{foo}}'
    );
  });

  it('should replace handlebars that have extra spaces with payload', () => {
    const template = 'Your verification code is {{     code }}';
    const payload = { code: '123456' };
    expect(replaceSendMessageHandlebars(template, payload)).toEqual(
      'Your verification code is 123456'
    );
  });

  it('should replace handlebars that have nested properties with payload', () => {
    const template =
      'Your application name is {{application.name}}, {{ application.customData.foo }}, {{ application.customData.bar }}, {{ application.customData.baz.1 }}';
    const payload = {
      application: {
        name: 'Logto',
        customData: {
          foo: 'foo',
          baz: [1, '2', null],
        },
      },
    };
    expect(replaceSendMessageHandlebars(template, payload)).toEqual(
      'Your application name is Logto, foo, , 2'
    );
  });

  it('should not replace handlebars if root property does not exist in payload', () => {
    const template = 'Your {{ application.name }} sign in verification code is {{ code }}';
    const payload = {
      code: '123456',
    };

    expect(replaceSendMessageHandlebars(template, payload)).toEqual(
      'Your {{ application.name }} sign in verification code is 123456'
    );
  });
});

describe('getValue', () => {
  it('should return value from object', () => {
    const object = { foo: { bar: { baz: 'qux' } } };
    expect(getValue(object, 'foo')).toEqual(object.foo);
    expect(getValue(object, 'foo.bar')).toEqual(object.foo.bar);
    expect(getValue(object, 'foo.bar.baz')).toEqual('qux');
  });

  it('should return value from array', () => {
    const object = {
      list: [
        { name: 'name1', age: 1 },
        { name: 'name2', age: 2 },
      ],
    };
    expect(getValue(object, 'list')).toEqual(object.list);
    expect(getValue(object, 'list.0')).toEqual(object.list[0]);
    expect(getValue(object, 'list.0.name')).toEqual('name1');
  });

  it('should return undefined if path is not found', () => {
    const object = { foo: { bar: { baz: 'qux' } } };
    expect(getValue(object, 'foo.baz')).toEqual(undefined);
    expect(getValue(object, 'foo.bar.baz.qux')).toEqual(undefined);
  });

  it('should return undefined if path is not an object', () => {
    const object = {
      foo: 'foo',
      bar: 1,
      baz: true,
      qux: [1, '2', null],
      quux: null,
    };

    for (const key of Object.keys(object)) {
      expect(getValue(object, `${key}.foo`)).toEqual(undefined);
    }
  });
});

describe('getAccessTokenByRefreshToken', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  const tokenEndpoint = 'https://example.com/oauth/token';
  const mockedConfig = {
    tokenEndpoint,
    clientId: 'client_id',
    clientSecret: 'client_secret',
  };
  const mockTokenResponse = {
    access_token: 'new_access_token',
    token_type: 'Bearer',
    expires_in: 3600,
  };
  const mockRefreshToken = 'refresh_token';

  it('should get an access token by exchanging with refresh token', async () => {
    nock(tokenEndpoint)
      .matchHeader('authorization', (value) => {
        expect(value).toEqual(
          `Basic ${Buffer.from(`${mockedConfig.clientId}:${mockedConfig.clientSecret}`).toString('base64')}`
        );
        return true;
      })
      .post('', (body) => {
        expect(body).toEqual({
          grant_type: 'refresh_token',
          refresh_token: mockRefreshToken,
        });
        return true;
      })
      .reply(200, mockTokenResponse);
    const { access_token } = await getAccessTokenByRefreshToken(mockedConfig, mockRefreshToken);
    expect(access_token).toEqual(mockTokenResponse.access_token);
  });
});
