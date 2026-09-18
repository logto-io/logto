import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { SWRConfig } from 'swr';

import useCurrentUser from '@/hooks/use-current-user';

import {
  useConsoleSsoContext,
  useConsoleSsoConnector,
  useConsoleSsoConnectors,
} from './use-console-sso';

const mockGet = jest.fn();
jest.mock('@/cloud/hooks/use-cloud-api', () => ({ useCloudApi: () => ({ get: mockGet }) }));
jest.mock('@/hooks/use-current-user', () => ({ __esModule: true, default: jest.fn() }));
const currentUser = jest.mocked(useCurrentUser);
const user = (id: string) =>
  currentUser.mockReturnValue({ user: { id } } as ReturnType<typeof useCurrentUser>);
const wrapper = ({ children }: { readonly children: ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0, shouldRetryOnError: false }}>
    {children}
  </SWRConfig>
);

beforeEach(() => {
  jest.clearAllMocks();
  user('alice');
});

it('scopes list cache to the user and refreshed default customer without a tenant', async () => {
  mockGet.mockImplementation(async (path: string) =>
    path.endsWith('/context')
      ? { userId: 'alice', stripeCustomerId: 'customer-a' }
      : [{ id: 'first', stripeCustomerId: 'customer-a' }]
  );
  const { result } = renderHook(
    () => ({ context: useConsoleSsoContext(), list: useConsoleSsoConnectors() }),
    { wrapper }
  );
  await waitFor(() => {
    expect(result.current.list.data).toEqual([{ id: 'first', stripeCustomerId: 'customer-a' }]);
  });
  mockGet.mockImplementation(async (path: string) =>
    path.endsWith('/context')
      ? { userId: 'alice', stripeCustomerId: 'customer-b' }
      : [{ id: 'second', stripeCustomerId: 'customer-b' }]
  );
  await act(async () => {
    await result.current.context.mutate();
  });
  await waitFor(() => {
    expect(result.current.list.data).toEqual([{ id: 'second', stripeCustomerId: 'customer-b' }]);
  });
  expect(
    mockGet.mock.calls.filter(([path]: [string]) => path.endsWith('/connectors'))
  ).toHaveLength(2);
  expect(mockGet.mock.calls.some((args) => JSON.stringify(args).includes('tenant'))).toBe(false);
});

it('does not render the previous user data after switching accounts', async () => {
  mockGet.mockImplementation(async (path: string) =>
    path.endsWith('/context')
      ? { userId: 'alice', stripeCustomerId: 'customer-a' }
      : [{ id: 'private', stripeCustomerId: 'customer-a' }]
  );
  const { result, rerender } = renderHook(() => useConsoleSsoConnectors(), { wrapper });
  await waitFor(() => {
    expect(result.current.data).toEqual([{ id: 'private', stripeCustomerId: 'customer-a' }]);
  });
  user('bob');
  mockGet.mockImplementation(async (path: string) =>
    path.endsWith('/context') ? { userId: 'bob', stripeCustomerId: null } : []
  );
  rerender();
  expect(result.current.data).toBeUndefined();
  await waitFor(() => {
    expect(result.current.data).toEqual([]);
  });
});

it('reads a deep link with its Cloud ID even without a current default customer', async () => {
  mockGet.mockImplementation(async (path: string) =>
    path.endsWith('/context')
      ? { userId: 'alice', stripeCustomerId: null }
      : { id: 'cloud-relation', stripeCustomerId: 'old-owned-customer' }
  );
  const { result } = renderHook(() => useConsoleSsoConnector('cloud-relation'), { wrapper });
  await waitFor(() => {
    expect(result.current.data?.id).toBe('cloud-relation');
  });
  expect(mockGet).toHaveBeenCalledWith('/api/me/console-sso/connectors/:connectorId', {
    params: { connectorId: 'cloud-relation' },
  });
});

it('does not cache a raced collection response under the previous customer', async () => {
  mockGet.mockImplementation(async (path: string) =>
    path.endsWith('/context')
      ? { userId: 'alice', stripeCustomerId: 'customer-a' }
      : [{ id: 'wrong-scope', stripeCustomerId: 'customer-b' }]
  );
  const { result } = renderHook(() => useConsoleSsoConnectors(), { wrapper });
  await waitFor(() => {
    expect(result.current.error).toBeTruthy();
  });
  expect(result.current.data).toBeUndefined();
});
