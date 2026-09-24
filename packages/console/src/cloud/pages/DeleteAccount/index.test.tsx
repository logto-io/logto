import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ResponseError } from '@withtyped/client';
import type * as React from 'react';

import { tryReadResponseErrorBody, toastResponseError } from '@/cloud/hooks/use-cloud-api';

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
const mockSignOut = jest.fn();
const mockRefresh = jest.fn();
const mockGetClaims = jest.fn().mockResolvedValue({ sub: 'owner', organization_roles: [] });
const mockStatus = jest.fn();
jest.mock('@logto/react', () => ({ useLogto: () => ({ getIdTokenClaims: mockGetClaims }) }));
jest.mock('@/consts/env', () => ({ isDevFeaturesEnabled: true }));
jest.mock('@/cloud/hooks/use-cloud-api', () => ({
  useCloudApi: () => ({ delete: mockDelete }),
  createTenantApi: () => ({ delete: mockDelete }),
  tryReadResponseErrorBody: jest.fn(),
  toastResponseError: jest.fn(),
}));
jest.mock('./use-account-deletion-status', () => ({
  __esModule: true,
  default: () => ({ ...mockStatus(), mutate: mockRefresh }),
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

const confirmDeletion = async () => {
  fireEvent.click(await screen.findByText('general.delete'));
  fireEvent.click(screen.getByText('profile.delete_account.permanently_delete'));
};

beforeEach(() => {
  jest.clearAllMocks();
  mockStatus.mockReturnValue({ data: { hasConsoleSsoConnectors: false } });
  mockRefresh.mockResolvedValue({ hasConsoleSsoConnectors: false });
  mockDelete.mockResolvedValue(undefined);
});

it('explains the Console SSO account-deletion blocker even with no tenants', async () => {
  mockStatus.mockReturnValue({ data: { hasConsoleSsoConnectors: true } });
  render(<DeleteAccount />);
  expect(
    await screen.findByText('admin_console.profile.delete_account.issues.console_sso')
  ).not.toBeNull();
  expect(screen.queryByText('general.delete')).toBeNull();
  expect(mockDelete).not.toHaveBeenCalled();
});

it('does not allow deletion while the status is loading or failed', async () => {
  mockStatus.mockReturnValue({});
  const { rerender } = render(<DeleteAccount />);
  expect(screen.getByText('Loading')).not.toBeNull();
  mockStatus.mockReturnValue({ error: new Error('Status unavailable') });
  rerender(<DeleteAccount />);
  expect(await screen.findByText('Status unavailable')).not.toBeNull();
  expect(screen.queryByText('general.delete')).toBeNull();
  expect(mockDelete).not.toHaveBeenCalled();
});

it('preserves account deletion and sign-out once no blockers remain', async () => {
  render(<DeleteAccount />);
  await confirmDeletion();
  await waitFor(() => {
    expect(mockSignOut).toHaveBeenCalledWith('/');
  });
  expect(mockRefresh).toHaveBeenCalledTimes(1);
  expect(mockDelete).toHaveBeenCalledTimes(1);
  expect(mockDelete).toHaveBeenCalledWith('/api/me');
});

it('rechecks the status before performing deletion', async () => {
  mockRefresh.mockImplementation(async () => {
    mockStatus.mockReturnValue({ data: { hasConsoleSsoConnectors: true } });
    return { hasConsoleSsoConnectors: true };
  });
  render(<DeleteAccount />);
  await confirmDeletion();
  expect(
    await screen.findByText('admin_console.profile.delete_account.issues.console_sso')
  ).not.toBeNull();
  expect(mockDelete).not.toHaveBeenCalled();
});

it('shows the same reason if the final deletion guard detects new connectors', async () => {
  mockDelete.mockRejectedValue(
    new ResponseError({ headers: { get: () => null } } as unknown as Response)
  );
  jest.mocked(tryReadResponseErrorBody).mockResolvedValue({
    message: 'Remove SSO',
    error: { code: 'console_sso.configuration_exists' },
  });
  render(<DeleteAccount />);
  await confirmDeletion();
  expect(
    await screen.findByText('admin_console.profile.delete_account.issues.console_sso')
  ).not.toBeNull();
  expect(mockSignOut).not.toHaveBeenCalled();
});

it('stops deletion if the final status refresh fails', async () => {
  const failure = new Error('Status refresh failed');
  mockRefresh.mockRejectedValue(failure);
  const logError = jest.spyOn(console, 'error').mockImplementation(jest.fn());
  render(<DeleteAccount />);
  await confirmDeletion();
  expect(await screen.findByText('Status refresh failed')).not.toBeNull();
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
  expect(mockSignOut).not.toHaveBeenCalled();
  logError.mockRestore();
});
