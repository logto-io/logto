import { SsoProviderName, SsoProviderType } from '@logto/schemas';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SWRConfig } from 'swr';

import { type ConsoleSsoConnector } from '@/cloud/types/router';
import useCurrentUser from '@/hooks/use-current-user';

import Details from './Details';

jest.mock('@withtyped/client', () => ({ ResponseError: class extends Error {} }), {
  virtual: true,
});

const mockGet = jest.fn();
const mockPatch = jest.fn();
const mockDelete = jest.fn();
const mockTenantPatch = jest.fn();
const mockToastError = jest.fn();
jest.mock('@/cloud/hooks/use-cloud-api', () => ({
  useCloudApi: () => ({ get: mockGet, patch: mockPatch, delete: mockDelete }),
  toastResponseError: (...args: unknown[]) => mockToastError(...args),
}));
jest.mock('@/hooks/use-current-user', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/hooks/use-api', () => ({
  __esModule: true,
  default: () => ({ patch: mockTenantPatch }),
}));
jest.mock('@/hooks/use-user-assets-service', () => ({
  __esModule: true,
  default: () => ({ isReady: false }),
}));
jest.mock('@/hooks/use-documentation-url', () => ({
  __esModule: true,
  default: () => ({ getDocumentationUrl: (path: string) => path }),
}));
jest.mock('@/hooks/use-domain-selection', () => ({
  __esModule: true,
  default: () => ['selected-tenant.example.com', jest.fn()],
}));
jest.mock('@/hooks/use-theme', () => ({ __esModule: true, default: () => 'light' }));
jest.mock('@/hooks/use-tenant-pathname', () => ({
  __esModule: true,
  default: () => ({ getTo: (path: string) => path, match: () => false }),
}));
jest.mock('@/consts/env', () => ({ isCloud: true, isDevFeaturesEnabled: true }));
jest.mock('@/consts', () => ({ spInitiatedSsoFlow: '/sso', retrieveTokenStorage: '/tokens' }));
jest.mock('@/ds-components/DynamicT', () => ({
  __esModule: true,
  default: ({ forKey }: { readonly forKey: string }) => <span>{forKey}</span>,
}));
jest.mock('@/components/DomainSelector', () => ({
  __esModule: true,
  default: () => <span>Tenant domain selector</span>,
}));
jest.mock('@/components/FeatureTag', () => ({ CombinedAddOnAndFeatureTag: () => null }));
jest.mock('@/components/LearnMore', () => ({ __esModule: true, default: () => null }));
jest.mock('@/pages/EnterpriseSsoDetails/SsoGuide', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/pages/EnterpriseSsoDetails/Experience/LogosUploader', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock(
  '@/pages/EnterpriseSsoDetails/Connection/ServiceProviderInfo/OidcConnectorSpInfo',
  () => ({ __esModule: true, default: () => <span>Wrong tenant callback</span> })
);
jest.mock('@/pages/EnterpriseSsoDetails/Connection/SamlSigningKeySection', () => ({
  __esModule: true,
  default: () => <span>Tenant signing keys</span>,
}));
jest.mock('@/components/UnsavedChangesAlertModal', () => ({
  __esModule: true,
  default: ({ hasUnsavedChanges }: { readonly hasUnsavedChanges: boolean }) => (
    <span>{hasUnsavedChanges ? 'Unsaved changes' : 'Saved'}</span>
  ),
}));
jest.mock('@/components/DetailsForm', () => ({
  __esModule: true,
  default: ({
    children,
    onSubmit,
    isDirty,
    isSubmitting,
  }: {
    readonly children: ReactNode;
    readonly onSubmit: () => void;
    readonly isDirty: boolean;
    readonly isSubmitting: boolean;
  }) => (
    <div>
      {children}
      <button type="button" disabled={!isDirty || isSubmitting} onClick={onSubmit}>
        Save changes
      </button>
    </div>
  ),
}));
jest.mock('@/components/DetailsPage/DetailsPageHeader', () => ({
  __esModule: true,
  default: ({
    title,
    actionMenuItems,
  }: {
    readonly title: ReactNode;
    readonly actionMenuItems: Array<{ onClick: () => void }>;
  }) => (
    <div>
      {title}
      <button type="button" onClick={actionMenuItems[0]?.onClick}>
        Delete connector
      </button>
    </div>
  ),
}));
jest.mock('@/components/Drawer', () => ({ __esModule: true, default: () => null }));
jest.mock('@/ds-components/ConfirmModal', () => ({
  __esModule: true,
  default: ({ isOpen, onConfirm }: { readonly isOpen: boolean; readonly onConfirm: () => void }) =>
    isOpen && (
      <button type="button" onClick={onConfirm}>
        Confirm deletion
      </button>
    ),
}));

const connector: ConsoleSsoConnector = {
  id: 'cloud-relation',
  stripeCustomerId: 'original-customer',
  createdAt: '2026-09-18T00:00:00.000Z',
  name: 'OIDC',
  connectorName: 'internal-name',
  providerName: SsoProviderName.OIDC,
  providerType: SsoProviderType.OIDC,
  providerLogo: '',
  providerLogoDark: '',
  branding: { displayName: 'Acme' },
  config: {},
  syncProfile: false,
  enableTokenStorage: false,
  boundDomains: ['bound.example.com'],
  domainVerifications: [],
  redirectUri: 'https://admin.example.com/callback/core-id',
};
const wrapper = ({ children }: { readonly children: ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0, shouldRetryOnError: false }}>
    {children}
  </SWRConfig>
);
const openDetails = (tab = 'experience') =>
  render(
    <MemoryRouter
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
      initialEntries={[`/subscriptions/console-sso/cloud-relation/${tab}`]}
    >
      <Routes>
        <Route path="/subscriptions/console-sso/:connectorId/:tab" element={<Details />} />
        <Route path="/subscriptions/console-sso" element={<div>Connector list</div>} />
      </Routes>
    </MemoryRouter>,
    { wrapper }
  );

beforeEach(() => {
  jest.clearAllMocks();
  jest
    .mocked(useCurrentUser)
    .mockReturnValue({ user: { id: 'alice' } } as ReturnType<typeof useCurrentUser>);
  mockGet.mockImplementation(async (path: string) =>
    path.endsWith('/context')
      ? { userId: 'alice', stripeCustomerId: 'new-default' }
      : path.endsWith('/:connectorId')
        ? connector
        : []
  );
  mockPatch.mockResolvedValue({ ...connector, branding: { displayName: 'Updated' } });
  mockDelete.mockResolvedValue(undefined);
});

it('edits branding using only supported fields and the persisted Cloud ID', async () => {
  openDetails();
  const displayName = await screen.findByDisplayValue('Acme');
  expect(screen.queryByDisplayValue('internal-name')).toBeNull();
  fireEvent.change(displayName, { target: { value: 'Updated' } });
  expect(screen.getByText('Unsaved changes')).toBeTruthy();
  fireEvent.click(screen.getByText('Save changes'));
  await waitFor(() => {
    expect(mockPatch).toHaveBeenCalledWith('/api/me/console-sso/connectors/:connectorId', {
      params: { connectorId: 'cloud-relation' },
      body: { branding: { displayName: 'Updated' }, syncProfile: false, enableTokenStorage: false },
    });
  });
  expect(mockTenantPatch).not.toHaveBeenCalled();
});

it('uses the authoritative admin callback instead of selected-tenant metadata', async () => {
  openDetails('connection');
  await screen.findByText('https://admin.example.com/callback/core-id');
  expect(screen.queryByText('Wrong tenant callback')).toBeNull();
});

it('requires confirmation before deleting, then refreshes and returns to the list', async () => {
  openDetails();
  fireEvent.click(await screen.findByText('Delete connector'));
  expect(mockDelete).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText('Confirm deletion'));
  await screen.findByText('Connector list');
  expect(mockDelete).toHaveBeenCalledWith('/api/me/console-sso/connectors/:connectorId', {
    params: { connectorId: 'cloud-relation' },
  });
});

it('reloads authoritative state after a failed edit and permits another save', async () => {
  mockPatch
    .mockRejectedValueOnce(new Error('Ambiguous update'))
    .mockResolvedValueOnce({ ...connector, branding: { displayName: 'Retried' } });
  openDetails();
  fireEvent.change(await screen.findByDisplayValue('Acme'), { target: { value: 'Updated' } });
  fireEvent.click(screen.getByText('Save changes'));
  await waitFor(() => {
    expect(mockToastError).toHaveBeenCalled();
  });
  expect(
    mockGet.mock.calls.filter(([path]: [string]) => path.endsWith('/:connectorId')).length
  ).toBeGreaterThan(1);
  fireEvent.change(screen.getByDisplayValue('Updated'), { target: { value: 'Retried' } });
  fireEvent.click(screen.getByText('Save changes'));
  await waitFor(() => {
    expect(mockPatch).toHaveBeenCalledTimes(2);
  });
});

it('keeps SAML SP metadata unchanged even when tenant-domain selection has a value', async () => {
  const saml = {
    ...connector,
    providerType: SsoProviderType.SAML,
    providerName: SsoProviderName.SAML,
    providerConfig: {
      defaultAttributeMapping: {},
      serviceProvider: {
        entityId: 'https://admin.example.com/entity',
        assertionConsumerServiceUrl: 'https://admin.example.com/acs',
      },
    },
  };
  mockGet.mockImplementation(async (path: string) =>
    path.endsWith('/context')
      ? { userId: 'alice', stripeCustomerId: 'new-default' }
      : path.endsWith('/:connectorId')
        ? saml
        : []
  );
  openDetails('connection');
  await screen.findByText('https://admin.example.com/acs');
  expect(screen.getByText('https://admin.example.com/entity')).toBeTruthy();
  expect(screen.queryByText('Tenant domain selector')).toBeNull();
  expect(screen.queryByText('Tenant signing keys')).toBeNull();
});

it('refreshes after a failed deletion before allowing a retry', async () => {
  mockDelete
    .mockRejectedValueOnce(new Error('Lost deletion response'))
    .mockResolvedValueOnce(undefined);
  openDetails();
  fireEvent.click(await screen.findByText('Delete connector'));
  fireEvent.click(screen.getByText('Confirm deletion'));
  await waitFor(() => {
    expect(mockToastError).toHaveBeenCalled();
  });
  expect(
    mockGet.mock.calls.filter(([path]: [string]) => path.endsWith('/:connectorId')).length
  ).toBeGreaterThan(1);
  fireEvent.click(screen.getByText('Confirm deletion'));
  await screen.findByText('Connector list');
  expect(mockDelete).toHaveBeenCalledTimes(2);
});
