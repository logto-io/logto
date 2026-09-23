import { renderHook } from '@testing-library/react';
import useSWR from 'swr';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import useCurrentUser from '@/hooks/use-current-user';

import { useConsoleSsoConnector } from './use-console-sso';

jest.mock('swr', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/cloud/hooks/use-cloud-api', () => ({ useCloudApi: jest.fn() }));
jest.mock('@/hooks/use-current-user', () => ({ __esModule: true, default: jest.fn() }));

const mockGet = jest.fn().mockResolvedValue({ id: 'relation-id' });
const mockApi = { get: mockGet };

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useCloudApi).mockReturnValue(mockApi as unknown as ReturnType<typeof useCloudApi>);
  jest.mocked(useSWR).mockReturnValue({} as ReturnType<typeof useSWR>);
  jest
    .mocked(useCurrentUser)
    .mockReturnValue({ user: { id: 'alice' } } as ReturnType<typeof useCurrentUser>);
});

it('fetches details with the Cloud user token and relation ID, without a tenant context', async () => {
  renderHook(() => useConsoleSsoConnector('relation-id'));
  const [key, fetcher] = jest.mocked(useSWR).mock.calls[0] ?? [];
  expect(key).toEqual(['/api/me/console-sso/connectors/:connectorId', 'alice', 'relation-id']);
  await (fetcher as () => Promise<unknown>)();
  expect(mockGet).toHaveBeenCalledWith('/api/me/console-sso/connectors/:connectorId', {
    params: { connectorId: 'relation-id' },
  });
  expect(useCloudApi).toHaveBeenCalledWith({ hideErrorToast: true });
});
