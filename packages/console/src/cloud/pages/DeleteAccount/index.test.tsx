import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ResponseError } from '@withtyped/client';
import type * as React from 'react';
import { useContext, useMemo } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { toastResponseError } from '@/cloud/hooks/use-cloud-api';
import { type TenantResponse } from '@/cloud/types/router';
import { defaultTenantResponse } from '@/consts';
import { TenantsContext } from '@/contexts/TenantsProvider';

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
const mockConnectors = jest.fn();
jest.mock('@/consts/env', () => ({ isDevFeaturesEnabled: true }));
jest.mock('@/cloud/hooks/use-cloud-api', () => ({
  useCloudApi: () => ({ delete: mockDelete, get: mockGet }),
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
  return { TenantsContext: createContext({ tenants: [] }) };
});
jest.mock('@/components/Region', () => ({ defaultRegionName: 'westus' }));
jest.mock('@/components/AppLoading', () => ({
  __esModule: true,
  default: () => <div>Loading</div>,
}));
jest.mock('@/components/PageMeta', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/Topbar', () => ({ __esModule: true, default: () => null }));
jest.mock('@/ds-components/CardTitle', () => ({ __esModule: true, default: () => null }));
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

function TestPage({ tenants = [] }: { readonly tenants?: readonly TenantResponse[] }) {
  const context = useContext(TenantsContext);
  const value = useMemo(() => ({ ...context, tenants }), [context, tenants]);
  return (
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <TenantsContext.Provider value={value}>
        <DeleteAccount />
      </TenantsContext.Provider>
    </MemoryRouter>
  );
}

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

it('requires tenants to be deleted or left separately through their settings', async () => {
  render(
    <TestPage
      tenants={[
        { ...defaultTenantResponse, id: 'owned', name: 'Owned tenant' },
        { ...defaultTenantResponse, id: 'joined', name: 'Joined tenant' },
      ]}
    />
  );
  expect(
    await screen.findByText('admin_console.profile.delete_account.issues.tenants')
  ).not.toBeNull();
  expect(screen.getByRole('link', { name: 'Owned tenant (owned)' }).getAttribute('href')).toBe(
    '/owned/tenant-settings/settings'
  );
  expect(screen.getByRole('link', { name: 'Joined tenant (joined)' }).getAttribute('href')).toBe(
    '/joined/tenant-settings/settings'
  );
  expect(screen.queryByText('general.delete')).toBeNull();
  expect(mockDelete).not.toHaveBeenCalled();
});

it('returns to the blockers if a tenant appears during final confirmation', async () => {
  const { rerender } = render(<TestPage />);
  fireEvent.click(await screen.findByText('general.delete'));
  expect(screen.getByText('profile.delete_account.permanently_delete')).not.toBeNull();
  rerender(<TestPage tenants={[defaultTenantResponse]} />);
  expect(
    await screen.findByText('admin_console.profile.delete_account.issues.tenants')
  ).not.toBeNull();
  expect(screen.queryByText('profile.delete_account.permanently_delete')).toBeNull();
  expect(mockDelete).not.toHaveBeenCalled();
});

it('allows account deletion after the last tenant has been removed separately', async () => {
  const { rerender } = render(<TestPage tenants={[defaultTenantResponse]} />);
  expect(screen.queryByText('general.delete')).toBeNull();
  rerender(<TestPage />);
  await confirmDeletion();
  await waitFor(() => {
    expect(mockSignOut).toHaveBeenCalledWith('/');
  });
  expect(mockDelete).toHaveBeenCalledTimes(1);
  expect(mockDelete).toHaveBeenCalledWith('/api/me');
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
  expect(mockGet).not.toHaveBeenCalled();
  expect(mockDelete).toHaveBeenCalledTimes(1);
  expect(mockDelete).toHaveBeenCalledWith('/api/me');
});

it('shows the same reason if the server refuses deletion for new connectors', async () => {
  mockGet.mockImplementation(async () => createConnectorElsewhere());
  mockDelete.mockRejectedValue(unprocessableError());
  render(<DeleteAccount />);
  await confirmDeletion();
  expect(
    await screen.findByText('admin_console.profile.delete_account.issues.console_sso')
  ).not.toBeNull();
  expect(toastResponseError).not.toHaveBeenCalled();
  expect(mockSignOut).not.toHaveBeenCalled();
  expect(mockDelete).toHaveBeenCalledTimes(1);
  expect(mockDelete).toHaveBeenCalledWith('/api/me');
  expect(mockGet).toHaveBeenCalledWith('/api/me/console-sso/connectors');
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
  expect(mockGet).toHaveBeenCalledTimes(1);
  expect(mockDelete).toHaveBeenCalledTimes(1);
  expect(mockDelete).toHaveBeenCalledWith('/api/me');
  expect(mockSignOut).not.toHaveBeenCalled();
  logError.mockRestore();
});

it('preserves the deletion error if refreshing connectors after a refusal fails', async () => {
  const failure = unprocessableError();
  mockDelete.mockRejectedValue(failure);
  mockGet.mockRejectedValue(new Error('Connector check failed'));
  const logError = jest.spyOn(console, 'error').mockImplementation(jest.fn());
  render(<DeleteAccount />);
  await confirmDeletion();
  expect(await screen.findByText(failure.message)).not.toBeNull();
  expect(toastResponseError).toHaveBeenCalledWith(failure);
  expect(mockDelete).toHaveBeenCalledTimes(1);
  expect(mockDelete).toHaveBeenCalledWith('/api/me');
  expect(mockSignOut).not.toHaveBeenCalled();
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
  expect(mockGet).not.toHaveBeenCalled();
  expect(mockSignOut).not.toHaveBeenCalled();
  logError.mockRestore();
});
