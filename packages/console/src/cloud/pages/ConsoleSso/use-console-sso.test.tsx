import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { SWRConfig } from 'swr';

import useCurrentUser from '@/hooks/use-current-user';

import { useConsoleSsoConnector, useConsoleSsoConnectors } from './use-console-sso';

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

it('refreshes the list without querying customer context', async () => {
  mockGet.mockResolvedValue([{ id: 'first' }]);
  const { result } = renderHook(() => useConsoleSsoConnectors(), { wrapper });
  await waitFor(() => {
    expect(result.current.data).toEqual([{ id: 'first' }]);
  });
  mockGet.mockResolvedValue([{ id: 'second' }]);
  await act(async () => {
    await result.current.mutate();
  });
  expect(result.current.data).toEqual([{ id: 'second' }]);
  expect(mockGet.mock.calls).toEqual([
    ['/api/me/console-sso/connectors'],
    ['/api/me/console-sso/connectors'],
  ]);
});

it('does not render the previous user data after switching accounts', async () => {
  mockGet.mockResolvedValue([{ id: 'private', stripeCustomerId: 'customer-a' }]);
  const { result, rerender } = renderHook(() => useConsoleSsoConnectors(), { wrapper });
  await waitFor(() => {
    expect(result.current.data).toEqual([{ id: 'private', stripeCustomerId: 'customer-a' }]);
  });
  user('bob');
  mockGet.mockResolvedValue([]);
  rerender();
  expect(result.current.data).toBeUndefined();
  await waitFor(() => {
    expect(result.current.data).toEqual([]);
  });
});

it('reads a deep link with its Cloud ID even without a current default customer', async () => {
  mockGet.mockResolvedValue({ id: 'cloud-relation', stripeCustomerId: 'old-owned-customer' });
  const { result } = renderHook(() => useConsoleSsoConnector('cloud-relation'), { wrapper });
  await waitFor(() => {
    expect(result.current.data?.id).toBe('cloud-relation');
  });
  expect(mockGet).toHaveBeenCalledWith('/api/me/console-sso/connectors/:connectorId', {
    params: { connectorId: 'cloud-relation' },
  });
});

it('does not load connectors before the current user is available', () => {
  currentUser.mockReturnValue({ user: undefined } as ReturnType<typeof useCurrentUser>);
  const { result } = renderHook(() => useConsoleSsoConnectors(), { wrapper });
  expect(result.current.data).toBeUndefined();
  expect(mockGet).not.toHaveBeenCalled();
});
