import { SsoProviderName } from '@logto/schemas';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { SWRConfig } from 'swr';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import useCurrentUser from '@/hooks/use-current-user';

import {
  readPendingConnectorCreation,
  savePendingConnectorCreation,
} from './connector-creation-idempotency';
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
  useCloudApi: jest.fn(),
  toastResponseError: jest.fn(),
}));
jest.mock('@/hooks/use-current-user', () => ({ __esModule: true, default: jest.fn() }));

const mockApi = {
  config: { baseUrl: new URL('https://cloud.example.com') },
  get: jest.fn(),
  post: jest.fn(),
  delete: jest.fn(),
};
const onCreated = jest.fn();
const operation = {
  key: 'creation-one',
  funding: 'personal' as const,
  providerName: SsoProviderName.OIDC,
  sessionId: 'session-one',
};
const paidSession = {
  status: 'payment_received',
  sessionId: 'session-one',
  providerName: SsoProviderName.OIDC,
  subscriptionId: 'paid-sub',
  redirectUri: null,
};
const renderCreation = () =>
  renderHook(() => useConnectorCreation('alice', onCreated), {
    wrapper: ({ children }: { children: ReactNode }) =>
      createElement(
        SWRConfig,
        { value: { provider: () => new Map(), dedupingInterval: 0, shouldRetryOnError: false } },
        children
      ),
  });

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
  jest.mocked(useCloudApi).mockReturnValue(mockApi as unknown as ReturnType<typeof useCloudApi>);
  jest
    .mocked(useCurrentUser)
    .mockReturnValue({ user: { id: 'alice' } } as ReturnType<typeof useCurrentUser>);
  mockApi.get.mockImplementation(async (path: string) => {
    if (path === '/api/me/console-sso/checkout-preview') {
      return { status: 'checkout_required' };
    }
    if (path === '/api/me/logto-enterprises') {
      return { logtoEnterprises: [] };
    }
    if (path === '/api/me/console-sso/checkout-session/:sessionId') {
      return paidSession;
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
});

it('offers an explicit first purchase only after server billing reads finish', async () => {
  const { result } = renderCreation();
  expect(result.current.billing.isBillingReady).toBe(false);
  await waitFor(() => {
    expect(result.current.billing.isBillingReady).toBe(true);
  });
  expect(result.current.billing.funding).toBe('personal');
  expect(result.current.billing.hasSubscription).toBe(false);
  expect(mockApi.post).not.toHaveBeenCalled();
});

it('recovers a closed-tab payment even when the checkout preview is unavailable', async () => {
  savePendingConnectorCreation('alice', operation);
  mockApi.get.mockImplementation(async (path: string) => {
    if (path === '/api/me/console-sso/checkout-preview') {
      throw new Error('Preview unavailable');
    }
    if (path === '/api/me/logto-enterprises') {
      return { logtoEnterprises: [] };
    }
    if (path === '/api/me/console-sso/checkout-session/:sessionId') {
      return paidSession;
    }
    return [];
  });
  const { result } = renderCreation();
  await waitFor(() => {
    expect(result.current.billing.preview.error).toBeDefined();
  });
  expect(result.current.billing.billingError).toBeUndefined();
  expect(result.current.billing.isBillingReady).toBe(true);
  await act(async () => {
    await result.current.create(SsoProviderName.SAML, { funding: 'personal' });
  });
  expect(mockApi.post).toHaveBeenCalledWith('/api/me/console-sso/connectors', {
    body: { providerName: SsoProviderName.OIDC, stripeUserSubscriptionId: 'paid-sub' },
  });
  expect(onCreated).toHaveBeenCalledWith('connector-one');
  expect(readPendingConnectorCreation('alice')).toBeUndefined();
});

it('polls delayed payments and fulfills only after verified payment', async () => {
  savePendingConnectorCreation('alice', operation);
  const sessionResponses = jest
    .fn()
    .mockResolvedValueOnce({ ...paidSession, status: 'payment_pending' })
    .mockResolvedValue(paidSession);
  mockApi.get.mockImplementation(async (path: string) => {
    if (path === '/api/me/console-sso/checkout-preview') {
      return { status: 'checkout_required' };
    }
    if (path === '/api/me/logto-enterprises') {
      return { logtoEnterprises: [] };
    }
    if (path === '/api/me/console-sso/checkout-session/:sessionId') {
      return sessionResponses();
    }
    return [];
  });
  jest.useFakeTimers();
  const { result } = renderCreation();
  await act(async () => {
    jest.advanceTimersByTime(5000);
  });
  expect(result.current.status).toBe('payment_pending');
  expect(mockApi.post).not.toHaveBeenCalled();
  await act(async () => {
    jest.advanceTimersByTime(5000);
  });
  expect(onCreated).toHaveBeenCalledWith('connector-one');
  expect(mockApi.post).toHaveBeenCalledTimes(1);
});

it('stops payment polling after the creation modal unmounts', async () => {
  savePendingConnectorCreation('alice', operation);
  jest.useFakeTimers();
  const { unmount } = renderCreation();
  unmount();
  await act(async () => {
    jest.advanceTimersByTime(10_000);
  });
  expect(
    mockApi.get.mock.calls.some(
      ([path]) => path === '/api/me/console-sso/checkout-session/:sessionId'
    )
  ).toBe(false);
  expect(mockApi.post).not.toHaveBeenCalled();
});

it('refreshes connector and billing reads after abandoning an old paid intention', async () => {
  savePendingConnectorCreation('alice', {
    ...operation,
    sessionId: undefined,
    subscriptionId: 'canceled-sub',
  });
  const { result } = renderCreation();
  await waitFor(() => {
    expect(result.current.billing.preview.data).toBeDefined();
  });
  mockApi.get.mockClear();
  await act(async () => {
    await result.current.startOver();
  });
  expect(result.current.operation).toBeUndefined();
  expect(mockApi.get).toHaveBeenCalledWith('/api/me/console-sso/connectors');
  expect(mockApi.get).toHaveBeenCalledWith('/api/me/console-sso/checkout-preview');
  expect(mockApi.get).toHaveBeenCalledWith('/api/me/logto-enterprises');
});
