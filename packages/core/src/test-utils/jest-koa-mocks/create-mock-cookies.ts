/* eslint-disable unicorn/no-abusive-eslint-disable */
/* eslint-disable */
import type { Context } from 'koa';

const { jest } = import.meta;


export type Cookies = Context['cookies'];

export type Dictionary<T> = Record<string, T>;

export type MockCookies = {
  requestStore: Map<string, string>;
  responseStore: Map<string, string>;
} & Cookies;

export default function createMockCookies(
  cookies: Record<string, unknown> = {},
  secure = true
): MockCookies {
  const cookieEntries = Object.keys(cookies).map((key) => [key, cookies[key]] as [string, string]);

  const requestStore = new Map<string, string>(cookieEntries);
  const responseStore = new Map<string, string>(cookieEntries);

  return {
    set: jest.fn((key, value) => {
      return responseStore.set(key, value);
    }),
    get: jest.fn((key) => {
      return requestStore.get(key);
    }),
    requestStore,
    responseStore,
    secure,
  } as any;
}
/* eslint-enable */
