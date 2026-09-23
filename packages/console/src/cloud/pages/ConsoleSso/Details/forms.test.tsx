import { SsoProviderName, SsoProviderType } from '@logto/schemas';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { useFormContext } from 'react-hook-form';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type ConsoleSsoConnector } from '@/cloud/types/router';
import { type OidcConnectorConfig } from '@/pages/EnterpriseSsoDetails/types/oidc';
import { type SamlConnectorConfig } from '@/pages/EnterpriseSsoDetails/types/saml';

import Connection from './Connection';
import Experience from './Experience';

jest.mock('@/cloud/hooks/use-cloud-api', () => ({
  useCloudApi: jest.fn(),
  toastResponseError: jest.fn(),
}));
jest.mock('@/components/DetailsForm', () => ({
  __esModule: true,
  default: ({
    children,
    onSubmit,
  }: {
    readonly children: ReactNode;
    readonly onSubmit: () => Promise<void>;
  }) => (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit();
      }}
    >
      {children}
      <button type="submit">Save</button>
    </form>
  ),
}));
jest.mock('@/components/FormCard', () => ({
  __esModule: true,
  default: ({ children }: { readonly children: ReactNode }) => <section>{children}</section>,
}));
jest.mock('@/components/UnsavedChangesAlertModal', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/ds-components/FormField', () => ({
  __esModule: true,
  default: ({ title, children }: { readonly title: string; readonly children: ReactNode }) => (
    <label>
      {title}
      {children}
    </label>
  ),
}));
jest.mock('@/ds-components/CopyToClipboard', () => ({
  __esModule: true,
  default: ({ value }: { readonly value: string }) => <output>{value}</output>,
}));
jest.mock('@/ds-components/InlineNotification', () => ({
  __esModule: true,
  default: ({ children }: { readonly children: ReactNode }) => <div>{children}</div>,
}));
jest.mock('@/pages/EnterpriseSsoDetails/Connection/OidcMetadataForm', () => {
  function MockOidcMetadataForm() {
    const { register } = useFormContext<OidcConnectorConfig>();
    return <input aria-label="OIDC client ID" {...register('clientId')} />;
  }
  return { __esModule: true, default: MockOidcMetadataForm };
});
jest.mock('@/pages/EnterpriseSsoDetails/Connection/SamlMetadataForm', () => {
  function MockSamlMetadataForm() {
    const { register } = useFormContext<SamlConnectorConfig>();
    return <input aria-label="SAML metadata URL" {...register('metadataUrl')} />;
  }
  return { __esModule: true, default: MockSamlMetadataForm };
});
jest.mock('@/pages/EnterpriseSsoDetails/Connection/SamlAttributeMapping', () => ({
  __esModule: true,
  default: () => <div>attribute mapping</div>,
}));

const oidcConnector = {
  id: 'cloud-relation-id',
  createdAt: '2026-09-23T00:00:00.000Z',
  connectorName: 'server-generated-name',
  name: 'OIDC',
  providerName: SsoProviderName.OIDC,
  providerType: SsoProviderType.OIDC,
  providerLogo: 'https://example.com/logo.svg',
  providerLogoDark: 'https://example.com/dark-logo.svg',
  config: { clientId: 'old-client-id' },
  providerConfig: {},
  branding: { displayName: 'Current display name' },
  syncProfile: false,
  enableTokenStorage: false,
  redirectUri: 'https://admin.example.com/callback/core-id',
  boundDomains: [],
  domainVerifications: [],
} satisfies ConsoleSsoConnector;
const samlConnector = {
  ...oidcConnector,
  providerName: SsoProviderName.SAML,
  providerType: SsoProviderType.SAML,
  config: { metadataUrl: 'https://idp.example.com/metadata' },
  providerConfig: {
    defaultAttributeMapping: {},
    serviceProvider: {
      entityId: 'https://admin.example.com/saml/entity',
      assertionConsumerServiceUrl: 'https://admin.example.com/saml/acs',
    },
  },
} satisfies ConsoleSsoConnector;
const mockPatch = jest.fn();
const mockApi = { patch: mockPatch };
const onUpdated = jest.fn().mockResolvedValue(undefined);

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useCloudApi).mockReturnValue(mockApi as unknown as ReturnType<typeof useCloudApi>);
});

it('reuses the OIDC form and displays the authoritative admin-tenant redirect URI', async () => {
  mockPatch.mockResolvedValue({ ...oidcConnector, config: { clientId: 'new-client-id' } });
  render(<Connection data={oidcConnector} isDeleted={false} onUpdated={onUpdated} />);
  expect(screen.getByText('https://admin.example.com/callback/core-id')).toBeTruthy();
  fireEvent.change(screen.getByLabelText('OIDC client ID'), {
    target: { value: 'new-client-id' },
  });
  fireEvent.click(screen.getByText('Save'));

  await waitFor(() => {
    expect(mockPatch).toHaveBeenCalledWith('/api/me/console-sso/connectors/:connectorId', {
      params: { connectorId: 'cloud-relation-id' },
      body: { config: { clientId: 'new-client-id' } },
    });
  });
});

it('reuses the SAML form and displays service-provider metadata from Cloud', async () => {
  mockPatch.mockResolvedValue(samlConnector);
  render(<Connection data={samlConnector} isDeleted={false} onUpdated={onUpdated} />);
  expect(screen.getByText('https://admin.example.com/saml/acs')).toBeTruthy();
  expect(screen.getByText('https://admin.example.com/saml/entity')).toBeTruthy();
  fireEvent.change(screen.getByLabelText('SAML metadata URL'), {
    target: { value: 'https://idp.example.com/new-metadata' },
  });
  fireEvent.click(screen.getByText('Save'));

  await waitFor(() => {
    expect(mockPatch).toHaveBeenCalledWith('/api/me/console-sso/connectors/:connectorId', {
      params: { connectorId: 'cloud-relation-id' },
      body: { config: { metadataUrl: 'https://idp.example.com/new-metadata' } },
    });
  });
});

it('keeps the internal name and domains read-only while editing display name', async () => {
  mockPatch.mockResolvedValue({
    ...oidcConnector,
    branding: { ...oidcConnector.branding, displayName: 'New display name' },
  });
  render(<Experience data={oidcConnector} isDeleted={false} onUpdated={onUpdated} />);
  expect(screen.getByText('server-generated-name')).toBeTruthy();
  expect(screen.getByText('admin_console.cloud.console_sso.domain_placeholder')).toBeTruthy();
  expect(screen.queryByDisplayValue('server-generated-name')).toBeNull();
  fireEvent.change(screen.getByLabelText('enterprise_sso_details.display_name_field_name'), {
    target: { value: 'New display name' },
  });
  fireEvent.click(screen.getByText('Save'));

  await waitFor(() => {
    expect(mockPatch).toHaveBeenCalledWith('/api/me/console-sso/connectors/:connectorId', {
      params: { connectorId: 'cloud-relation-id' },
      body: {
        branding: { displayName: 'New display name', logo: '', darkLogo: '' },
        syncProfile: false,
        enableTokenStorage: false,
      },
    });
  });
  expect(JSON.stringify(mockPatch.mock.calls)).not.toContain('domains');
  expect(JSON.stringify(mockPatch.mock.calls)).not.toContain('connectorName');
});
