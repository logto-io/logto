import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { SWRConfig } from 'swr';

import * as env from '@/consts/env';
import useCurrentUser from '@/hooks/use-current-user';

import { useCloudApi } from './use-cloud-api';
import {
  useEnterpriseInvoices,
  useSubscriptionEntry,
  useUserSubscriptionInvoices,
  useUserSubscriptions,
} from './use-user-subscriptions';

jest.mock('./use-cloud-api', () => ({ useCloudApi: jest.fn() }));
jest.mock('@/consts/env', () => ({
  __esModule: true,
  get isDevFeaturesEnabled() {
    return true;
  },
}));
jest.mock('@/hooks/use-current-user', () => ({ __esModule: true, default: jest.fn() }));

const get = jest.fn();
class BillingError extends Error {
  constructor(readonly status: number) {
    super('Billing unavailable');
  }
}
const renderBilling = <T>(hook: () => T) =>
  renderHook(hook, {
    wrapper: ({ children }: { children: ReactNode }) =>
      createElement(
        SWRConfig,
        {
          value: { provider: () => new Map(), dedupingInterval: 0, shouldRetryOnError: false },
        },
        children
      ),
  });
const setUser = (id: string, error?: Error) => {
  jest
    .mocked(useCurrentUser)
    .mockReturnValue({ user: { id }, error, isLoading: false } as ReturnType<
      typeof useCurrentUser
    >);
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useCloudApi).mockReturnValue({ get } as unknown as ReturnType<typeof useCloudApi>);
  setUser('alice');
  get.mockImplementation(async (path: string) => {
    if (path === '/api/me/logto-enterprises') {
      return { logtoEnterprises: [] };
    }
    if (path === '/api/me/subscriptions/summary') {
      return { hasSubscriptions: true };
    }
    return { subscriptions: [] };
  });
});
afterEach(() => {
  jest.restoreAllMocks();
});

it.each([
  [[], true],
  [[{ id: 'enterprise' }], false],
  [[{ id: 'enterprise' }], true],
  [[], false],
])(
  'reads global entry eligibility for enterprises=%j and personal=%s without billing details',
  async (logtoEnterprises, hasSubscriptions) => {
    get.mockImplementation(async (path: string) =>
      path === '/api/me/logto-enterprises' ? { logtoEnterprises } : { hasSubscriptions }
    );
    const { result } = renderBilling(useSubscriptionEntry);
    await waitFor(() => {
      expect(result.current.enterprises.data).toEqual(logtoEnterprises);
    });
    expect(result.current.hasSubscriptions).toBe(hasSubscriptions);
    expect(get).toHaveBeenCalledWith('/api/me/subscriptions/summary');
    expect(get).not.toHaveBeenCalledWith('/api/me/subscriptions');
  }
);

it('keeps Enterprise access when the personal summary fails', async () => {
  get.mockImplementation(async (path: string) => {
    if (path === '/api/me/subscriptions/summary') {
      throw new Error('Unavailable');
    }
    return { logtoEnterprises: [{ id: 'enterprise' }] };
  });
  const { result } = renderBilling(useSubscriptionEntry);
  await waitFor(() => {
    expect(result.current.enterprises.data).toHaveLength(1);
  });
  expect(result.current.hasSubscriptions).toBe(false);
});

it('does not call the new summary when dev features are disabled', async () => {
  jest.spyOn(env, 'isDevFeaturesEnabled', 'get').mockReturnValue(false);
  const { result } = renderBilling(useSubscriptionEntry);
  await waitFor(() => {
    expect(result.current.enterprises.data).toEqual([]);
  });
  expect(get).toHaveBeenCalledTimes(1);
  expect(result.current.hasSubscriptions).toBe(false);
});

it('preserves mixed-product and canceled history as returned by the API', async () => {
  const subscriptions = [
    { id: 'current', product: 'console-sso', status: 'active', items: [{ quantity: 1 }] },
    { id: 'ended', product: 'console-sso', status: 'canceled', items: [{ quantity: 2 }] },
    { id: 'license', product: 'self-hosted-license', status: 'active', items: [] },
    { id: 'unknown', product: null, status: 'past_due', items: [] },
  ];
  get.mockResolvedValue({ subscriptions });
  const { result } = renderBilling(useUserSubscriptions);
  await waitFor(() => {
    expect(result.current.data).toEqual(subscriptions);
  });
});

it.each([401, 403, 503])(
  'preserves an API %s failure instead of fabricating empty history, and allows retry',
  async (status) => {
    const error = new BillingError(status);
    get.mockRejectedValue(error);
    const { result } = renderBilling(useUserSubscriptions);
    await waitFor(() => {
      expect(result.current.error).toBe(error);
    });
    expect(result.current.data).toBeUndefined();
    get.mockResolvedValue({ subscriptions: [] });
    await act(async () => {
      await result.current.mutate();
    });
    expect(result.current.error).toBeUndefined();
    expect(result.current.data).toEqual([]);
  }
);

it('clears the previous user’s billing and entry eligibility immediately on account switch', async () => {
  get.mockImplementation(async (path: string) => {
    if (path === '/api/me/subscriptions/summary') {
      return { hasSubscriptions: true };
    }
    if (path === '/api/me/logto-enterprises') {
      return { logtoEnterprises: [{ id: 'alice-enterprise' }] };
    }
    return { subscriptions: [{ id: 'alice-subscription' }] };
  });
  const { result, rerender } = renderBilling(() => ({
    entry: useSubscriptionEntry(),
    history: useUserSubscriptions(),
  }));
  await waitFor(() => {
    expect(result.current.entry.hasSubscriptions).toBe(true);
  });
  await act(async () => {
    await result.current.history.mutate();
  });
  expect(result.current.history.data).toEqual([{ id: 'alice-subscription' }]);
  setUser('bob');
  get.mockImplementation(async () => new Promise(jest.fn()));
  rerender();
  expect(result.current.history.data).toBeUndefined();
  expect(result.current.entry.enterprises.data).toBeUndefined();
  expect(result.current.entry.hasSubscriptions).toBe(false);
});

it('hides cached data and skips requests when the current user is unauthorized', async () => {
  const { result, rerender } = renderBilling(() => ({
    entry: useSubscriptionEntry(),
    history: useUserSubscriptions(),
  }));
  await waitFor(() => {
    expect(result.current.entry.hasSubscriptions).toBe(true);
  });
  const calls = get.mock.calls.length;
  setUser('alice', new Error('Unauthorized'));
  rerender();
  expect(result.current.entry.enterprises.data).toBeUndefined();
  expect(result.current.entry.hasSubscriptions).toBe(false);
  expect(result.current.history.data).toBeUndefined();
  expect(result.current.history.error?.message).toBe('Unauthorized');
  expect(get).toHaveBeenCalledTimes(calls);
});

it('reads the requested invoice page with a user-scoped key', async () => {
  const page = { invoices: [{ id: 'in_sso', product: 'console-sso' }], totalCount: 21 };
  get.mockResolvedValue(page);
  const { result, rerender } = renderBilling(() => useUserSubscriptionInvoices(3, 10));
  await waitFor(() => {
    expect(result.current.data).toEqual(page);
  });
  expect(get).toHaveBeenCalledWith('/api/me/subscriptions/invoices', {
    search: { page: '3', page_size: '10' },
  });
  setUser('bob');
  get.mockImplementation(async () => new Promise(jest.fn()));
  rerender();
  expect(result.current.data).toBeUndefined();
});

it.each([401, 403, 503])(
  'preserves an invoice API %s failure instead of fabricating empty history',
  async (status) => {
    const error = new BillingError(status);
    get.mockRejectedValue(error);
    const { result } = renderBilling(() => useUserSubscriptionInvoices(1, 10));
    await waitFor(() => {
      expect(result.current.error).toBe(error);
    });
    expect(result.current.data).toBeUndefined();
  }
);

it('reads only the given Enterprise invoices and hides drafts', async () => {
  get.mockResolvedValue({
    invoices: [
      { id: 'in_paid', status: 'paid' },
      { id: 'in_draft', status: 'draft' },
      { id: 'in_void', status: 'void' },
    ],
  });
  const { result } = renderBilling(() => useEnterpriseInvoices('contract'));
  await waitFor(() => {
    expect(result.current.data).toEqual([
      { id: 'in_paid', status: 'paid' },
      { id: 'in_void', status: 'void' },
    ]);
  });
  expect(get).toHaveBeenCalledWith('/api/me/logto-enterprises/:id/invoices', {
    params: { id: 'contract' },
  });
});

it('skips Enterprise invoices without an Enterprise or an authorized user', async () => {
  const { result, rerender } = renderBilling(() => useEnterpriseInvoices());
  expect(result.current.data).toBeUndefined();
  setUser('alice', new Error('Unauthorized'));
  rerender();
  expect(result.current.error?.message).toBe('Unauthorized');
  expect(get).not.toHaveBeenCalledWith('/api/me/logto-enterprises/:id/invoices', expect.anything());
});
