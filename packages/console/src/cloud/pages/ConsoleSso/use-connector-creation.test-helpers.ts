import { SsoProviderName } from '@logto/schemas';
import { renderHook } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { SWRConfig } from 'swr';

import { useConnectorCreation } from './use-connector-creation';

jest.mock(
  '@withtyped/client',
  () => ({
    __esModule: true,
    default: class {
      readonly get = mockApi.get;
      readonly post = mockApi.post;
      readonly delete = mockApi.delete;
      constructor(readonly config: unknown) {}
    },
  }),
  { virtual: true }
);
jest.mock('@/cloud/hooks/use-cloud-api', () => ({
  useCloudApi: () => mockApi,
  toastResponseError: jest.fn(),
}));
jest.mock('@/hooks/use-current-user', () => ({
  __esModule: true,
  default: () => ({ user: { id: 'alice' } }),
}));

export const mockApi = {
  config: { baseUrl: new URL('https://cloud.example.com') },
  get: jest.fn(),
  post: jest.fn(),
  delete: jest.fn(),
};
export const onCreated = jest.fn();
export const operation = {
  key: 'creation-one',
  funding: 'personal' as const,
  providerName: SsoProviderName.OIDC,
  sessionId: 'session-one',
};
export const paidSession = {
  status: 'payment_received',
  sessionId: 'session-one',
  providerName: SsoProviderName.OIDC,
  subscriptionId: 'paid-sub',
  redirectUri: null,
};
export const paidConnectors = [
  {
    id: 'webhook-connector',
    stripeUserSubscriptionId: 'paid-sub',
    providerName: SsoProviderName.OIDC,
  },
];
export const renderCreation = (cache = new Map()) =>
  renderHook(() => useConnectorCreation('alice', onCreated), {
    wrapper: ({ children }: { children: ReactNode }) =>
      createElement(
        SWRConfig,
        { value: { provider: () => cache, dedupingInterval: 0, shouldRetryOnError: false } },
        children
      ),
  });

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
  mockApi.get.mockImplementation(async (path: string) => {
    if (path === '/api/me/logto-enterprises') {
      return { logtoEnterprises: [] };
    }
    if (path === '/api/me/console-sso/checkout-session/:sessionId') {
      return paidSession;
    }
    if (path === '/api/me/console-sso/connectors') {
      return paidConnectors;
    }
    return [];
  });
  mockApi.post.mockResolvedValue({ id: 'connector-one' });
  mockApi.delete.mockResolvedValue({});
  // eslint-disable-next-line @silverhand/fp/no-mutating-methods -- Supply the browser UUID API in jsdom.
  Object.defineProperty(crypto, 'randomUUID', {
    configurable: true,
    value: jest.fn(() => 'new-creation'),
  });
});
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

export { toastResponseError } from '@/cloud/hooks/use-cloud-api';
