import { readOnlyAccessHeader } from '@logto/schemas';
import type { ParameterizedContext } from 'koa';
import type { RequestMethod } from 'node-mocks-http';

import RequestError from '#src/errors/RequestError/index.js';
import createMockContext from '#src/test-utils/jest-koa-mocks/create-mock-context.js';

import { type WithAuthContext } from './koa-auth/index.js';
import koaReadOnlyAccess, { assertNotReadOnly } from './koa-read-only-access.js';

const { jest } = import.meta;

const readOnlyAccessError = new RequestError({ code: 'auth.read_only_access', status: 403 });
const auth = { type: 'user', id: 'foo', scopes: new Set(['all']) };

const createContext = (method: RequestMethod, headerValue?: string) =>
  createMockContext({
    method,
    headers: headerValue === undefined ? {} : { [readOnlyAccessHeader]: headerValue },
    customProperties: { auth },
  }) as unknown as ParameterizedContext<unknown, WithAuthContext>;

describe('koaReadOnlyAccess()', () => {
  const next = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it.each([undefined, '', 'false'])(
    'leaves a write untouched when the header is %p',
    async (headerValue) => {
      const ctx = createContext('POST', headerValue);

      await koaReadOnlyAccess()(ctx, next);

      expect(ctx.auth).toEqual(auth);
      expect(next).toHaveBeenCalledTimes(1);
    }
  );

  it.each<RequestMethod>(['GET', 'HEAD', 'OPTIONS'])(
    'marks a %s request read-only',
    async (method) => {
      const ctx = createContext(method, 'true');

      await koaReadOnlyAccess()(ctx, next);

      expect(ctx.auth).toEqual({ ...auth, isReadOnly: true });
      expect(next).toHaveBeenCalledTimes(1);
    }
  );

  it.each<RequestMethod>(['POST', 'PUT', 'PATCH', 'DELETE'])(
    'refuses a read-only %s request',
    async (method) => {
      const ctx = createContext(method, 'true');

      await expect(koaReadOnlyAccess()(ctx, next)).rejects.toMatchError(readOnlyAccessError);
      expect(next).not.toHaveBeenCalled();
    }
  );

  it.each(['TRUE', '1', 'false, true', 'true, false'])(
    'treats the header value %p as read-only',
    async (headerValue) => {
      const ctx = createContext('POST', headerValue);

      await expect(koaReadOnlyAccess()(ctx, next)).rejects.toMatchError(readOnlyAccessError);
      expect(next).not.toHaveBeenCalled();
    }
  );
});

describe('assertNotReadOnly()', () => {
  it('refuses a read-only caller', () => {
    expect(() => {
      assertNotReadOnly({ isReadOnly: true });
    }).toMatchError(readOnlyAccessError);
  });

  it('allows any other caller', () => {
    expect(() => {
      assertNotReadOnly({});
    }).not.toThrow();
  });
});
