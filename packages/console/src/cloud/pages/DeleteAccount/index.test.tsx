import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ResponseError } from '@withtyped/client';
import type * as React from 'react';

import { toastResponseError } from '@/cloud/hooks/use-cloud-api';

import DeleteAccount from '.';

jest.mock(
  '@withtyped/client',
  () => ({
    ResponseError: class extends Error {
      constructor(readonly response: Response) {
        super('Request failed');
      }
    },
  }),
  { virtual: true }
);
const mockDelete = jest.fn();
const mockGet = jest.fn();
const mockSignOut = jest.fn();
const mockMutate = jest.fn(async (data: Promise<unknown>) => data);
const mockGetClaims = jest.fn().mockResolvedValue({ sub: 'owner', organization_roles: [] });
const mockConnectors = jest.fn();
jest.mock('@logto/react', () => ({ useLogto: () => ({ getIdTokenClaims: mockGetClaims }) }));
jest.mock('@/consts/env', () => ({ isDevFeaturesEnabled: true }));
jest.mock('@/cloud/hooks/use-cloud-api', () => ({
  useCloudApi: () => ({ delete: mockDelete, get: mockGet }),
  createTenantApi: () => ({ delete: mockDelete }),
  toastResponseError: jest.fn(),
}));
jest.mock('@/cloud/pages/ConsoleSso/use-console-sso', () => ({
  useConsoleSsoConnectors: () => ({ ...mockConnectors(), mutate: mockMutate }),
}));
jest.mock('@/hooks/use-sign-out', () => ({
  __esModule: true,
  default: () => ({ signOut: mockSignOut }),
}));
jest.mock('@/hooks/use-redirect-uri', () => ({
  __esModule: true,
  default: () => ({ href: '/' }),
}));
jest.mock('@/contexts/TenantsProvider', () => {
  const { createContext } = jest.requireActual<typeof React>('react');
  return { TenantsContext: createContext({ tenants: [], removeTenant: jest.fn() }) };
});
jest.mock('@/utils/subscription', () => ({ isPaidPlan: () => false }));
jest.mock('@/components/AppLoading', () => ({
  __esModule: true,
  default: () => <div>Loading</div>,
}));
jest.mock('@/components/PageMeta', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/Topbar', () => ({ __esModule: true, default: () => null }));
jest.mock('@/ds-components/CardTitle', () => ({ __esModule: true, default: () => null }));
jest.mock('./TenantsList', () => ({ __esModule: true, default: () => null }));
jest.mock('@/ds-components/OverlayScrollbar', () => ({
  __esModule: true,
  default: ({ children }: { readonly children: React.ReactNode }) => <div>{children}</div>,
}));
jest.mock('@/ds-components/Button', () => ({
  __esModule: true,
  default: ({
    title,
    onClick,
    disabled,
  }: {
    readonly title: string;
    readonly onClick?: () => void;
    readonly disabled?: boolean;
  }) => (
    <button type="button" disabled={disabled} onClick={onClick}>
      {title}
    </button>
  ),
}));

const connector = { id: 'connector' };

/** Simulate a connector created elsewhere after the page loaded. */
const createConnectorElsewhere = () => {
  mockConnectors.mockReturnValue({ data: [connector] });
  return [connector];
};

const unprocessableError = () =>
  new ResponseError({ status: 422, headers: { get: () => null } } as unknown as Response);

const confirmDeletion = async () => {
  fireEvent.click(await screen.findByText('general.delete'));
  fireEvent.click(screen.getByText('profile.delete_account.permanently_delete'));
};

beforeEach(() => {
  jest.clearAllMocks();
  mockConnectors.mockReturnValue({ data: [] });
  mockGet.mockResolvedValue([]);
  mockDelete.mockResolvedValue(undefined);
});

it('explains the Console SSO account-deletion blocker even with no tenants', async () => {
  mockConnectors.mockReturnValue({ data: [connector] });
  render(<DeleteAccount />);
  expect(
    await screen.findByText('admin_console.profile.delete_account.issues.console_sso')
  ).not.toBeNull();
  expect(screen.queryByText('general.delete')).toBeNull();
  expect(mockDelete).not.toHaveBeenCalled();
});

it('does not allow deletion while connectors are loading or failed to load', async () => {
  mockConnectors.mockReturnValue({});
  const { rerender } = render(<DeleteAccount />);
  expect(screen.getByText('Loading')).not.toBeNull();
  mockConnectors.mockReturnValue({ error: new Error('Connectors unavailable') });
  rerender(<DeleteAccount />);
  expect(await screen.findByText('Connectors unavailable')).not.toBeNull();
  expect(screen.queryByText('general.delete')).toBeNull();
  expect(mockDelete).not.toHaveBeenCalled();
});

it('preserves account deletion and sign-out once no blockers remain', async () => {
  render(<DeleteAccount />);
  await confirmDeletion();
  await waitFor(() => {
    expect(mockSignOut).toHaveBeenCalledWith('/');
  });
  expect(mockGet).toHaveBeenCalledTimes(1);
  expect(mockGet).toHaveBeenCalledWith('/api/me/console-sso/connectors');
  expect(mockDelete).toHaveBeenCalledTimes(1);
  expect(mockDelete).toHaveBeenCalledWith('/api/me');
});

it('rechecks connectors before performing deletion', async () => {
  mockGet.mockImplementation(async () => createConnectorElsewhere());
  render(<DeleteAccount />);
  await confirmDeletion();
  expect(
    await screen.findByText('admin_console.profile.delete_account.issues.console_sso')
  ).not.toBeNull();
  expect(mockDelete).not.toHaveBeenCalled();
});

it('shows the same reason if the server refuses deletion for new connectors', async () => {
  mockGet.mockResolvedValueOnce([]).mockImplementationOnce(async () => createConnectorElsewhere());
  mockDelete.mockRejectedValue(unprocessableError());
  render(<DeleteAccount />);
  await confirmDeletion();
  expect(
    await screen.findByText('admin_console.profile.delete_account.issues.console_sso')
  ).not.toBeNull();
  expect(toastResponseError).not.toHaveBeenCalled();
  expect(mockSignOut).not.toHaveBeenCalled();
});

it('keeps the generic error for a refusal unrelated to connectors', async () => {
  const failure = unprocessableError();
  mockDelete.mockRejectedValue(failure);
  const logError = jest.spyOn(console, 'error').mockImplementation(jest.fn());
  render(<DeleteAccount />);
  await confirmDeletion();
  await waitFor(() => {
    expect(toastResponseError).toHaveBeenCalledWith(failure);
  });
  expect(mockGet).toHaveBeenCalledTimes(2);
  expect(mockSignOut).not.toHaveBeenCalled();
  logError.mockRestore();
});

it('stops deletion if the final connector check fails', async () => {
  mockGet.mockRejectedValue(new Error('Connector check failed'));
  const logError = jest.spyOn(console, 'error').mockImplementation(jest.fn());
  render(<DeleteAccount />);
  await confirmDeletion();
  expect(await screen.findByText('Connector check failed')).not.toBeNull();
  expect(mockDelete).not.toHaveBeenCalled();
  logError.mockRestore();
});

it('retains the generic error flow for unrelated deletion failures', async () => {
  const failure = new Error('Deletion failed');
  mockDelete.mockRejectedValue(failure);
  const logError = jest.spyOn(console, 'error').mockImplementation(jest.fn());
  render(<DeleteAccount />);
  await confirmDeletion();
  expect(await screen.findByText('Deletion failed')).not.toBeNull();
  expect(toastResponseError).toHaveBeenCalledWith(failure);
  expect(mockGet).toHaveBeenCalledTimes(1);
  expect(mockSignOut).not.toHaveBeenCalled();
  logError.mockRestore();
});
