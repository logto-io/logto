import { SsoProviderName, SsoProviderType } from '@logto/schemas';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Client from '@withtyped/client';
import { type ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SWRConfig } from 'swr';

import { type ConsoleSsoConnector } from '@/cloud/types/router';
import useCurrentUser from '@/hooks/use-current-user';

import ConsoleSso from '.';
import CreationModal from './CreationModal';
import DomainTags from './DomainTags';
import { readCreation } from './creation';

jest.mock('@/ds-components/DynamicT', () => ({
  __esModule: true,
  default: ({ forKey }: { readonly forKey: string }) => <span>{forKey}</span>,
}));

const mockGet = jest.fn();
const mockPost = jest.fn();
const mockClose = jest.fn();
jest.mock('@/cloud/hooks/use-cloud-api', () => ({
  useCloudApi: () => ({
    get: mockGet,
    config: { baseUrl: 'https://cloud.example.com', headers: { Authorization: 'Bearer test' } },
  }),
  toastResponseError: jest.fn(),
}));
jest.mock('@withtyped/client', () => ({ __esModule: true, default: jest.fn() }), { virtual: true });
jest.mock('@/hooks/use-current-user', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/components/FeatureTag', () => ({ CombinedAddOnAndFeatureTag: () => null }));
jest.mock('@/hooks/use-theme', () => ({ __esModule: true, default: () => 'light' }));
jest.mock('@/consts/env', () => ({ isCloud: true, isDevFeaturesEnabled: true }));
jest.mock('@/hooks/use-tenant-pathname', () => ({
  __esModule: true,
  default: () => ({ getTo: (path: string) => path, match: () => false }),
}));
jest.mock('@/hooks/use-user-preferences', () => ({
  __esModule: true,
  default: () => ({ data: {} }),
}));
jest.mock('@/ds-components/OverlayScrollbar', () => ({
  __esModule: true,
  default: ({ children }: { readonly children: ReactNode }) => <div>{children}</div>,
}));
jest.mock('@/ds-components/ModalLayout', () => ({
  __esModule: true,
  default: ({ children, footer }: { readonly children: ReactNode; readonly footer: ReactNode }) => (
    <div>
      {children}
      {footer}
    </div>
  ),
}));

const connector: ConsoleSsoConnector = {
  id: 'cloud-relation',
  stripeCustomerId: 'customer-a',
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
const providers = [
  {
    providerName: SsoProviderName.OIDC,
    providerType: SsoProviderType.OIDC,
    name: 'OIDC',
    logo: '',
    logoDark: '',
    description: 'OpenID Connect',
    isStandard: true,
  },
];
const context = { userId: 'alice', stripeCustomerId: 'customer-a' };
const wrapper = ({ children }: { readonly children: ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0, shouldRetryOnError: false }}>
    <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      {children}
    </MemoryRouter>
  </SWRConfig>
);

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  // eslint-disable-next-line @silverhand/fp/no-mutating-methods -- Provide the browser UUID API in jsdom.
  Object.defineProperty(crypto, 'randomUUID', { configurable: true, value: () => 'creation-key' });
  jest
    .mocked(useCurrentUser)
    .mockReturnValue({ user: { id: 'alice' } } as ReturnType<typeof useCurrentUser>);
  mockGet.mockImplementation(async (path: string) => {
    if (path.endsWith('/context')) {
      return context;
    }
    if (path.endsWith('/providers')) {
      return providers;
    }
    return [];
  });
  jest
    .mocked(Client)
    .mockImplementation(() => ({ post: mockPost }) as unknown as InstanceType<typeof Client>);
});

it('renders a non-paid empty list with both Add connector actions and opens provider selection directly', async () => {
  render(<ConsoleSso />, { wrapper });
  await waitFor(() => {
    expect(screen.getAllByRole('button', { name: 'enterprise_sso.create' })).toHaveLength(2);
  });
  fireEvent.click(screen.getAllByRole('button', { name: 'enterprise_sso.create' })[0]!);
  await screen.findByText('enterprise_sso.create_modal.create_button_text');
  expect(mockGet).toHaveBeenCalledWith('/api/me/console-sso/providers');
  expect(mockGet.mock.calls.some(([path]: [string]) => /checkout|tenants/.test(path))).toBe(false);
});

it('opens the connector detail from a row and only shows connector and domain columns', async () => {
  mockGet.mockImplementation(async (path: string) =>
    path.endsWith('/context') ? context : [connector]
  );
  render(
    <Routes>
      <Route path="/" element={<ConsoleSso />} />
      <Route
        path="/subscriptions/console-sso/cloud-relation/connection"
        element={<div>Connection detail</div>}
      />
    </Routes>,
    { wrapper }
  );
  await screen.findByText('Acme');
  expect(screen.getAllByRole('columnheader')).toHaveLength(2);
  fireEvent.click(screen.getByText('Acme'));
  expect(screen.getByText('Connection detail')).toBeTruthy();
});

it('keeps bound status after proof cleanup and labels pending challenges accessibly', () => {
  render(
    <DomainTags
      data={{
        boundDomains: ['bound.example.com'],
        domainVerifications: [
          {
            domain: 'pending.example.com',
            verificationToken: 'proof',
            verifiedAt: null,
            lastCheckedAt: null,
            dnsRecords: [],
          },
        ],
      }}
    />
  );
  expect(screen.getByLabelText(/bound.example.com:.*domain_bound/)).toBeTruthy();
  expect(screen.getByLabelText(/pending.example.com:.*domain_pending/)).toBeTruthy();
});

it('reuses the persisted operation after an ambiguous response and reload, then opens the created connector', async () => {
  mockPost.mockRejectedValueOnce(new Error('Lost response')).mockResolvedValueOnce(connector);
  const first = render(
    <CreationModal userId="alice" customerId="customer-a" onClose={mockClose} />,
    { wrapper }
  );
  fireEvent.click(await screen.findByText('OIDC'));
  fireEvent.click(
    screen.getByRole('button', { name: 'enterprise_sso.create_modal.create_button_text' })
  );
  await waitFor(() => {
    expect(mockPost).toHaveBeenCalledTimes(1);
  });
  await waitFor(() => {
    expect(
      screen
        .getByRole('button', { name: 'enterprise_sso.create_modal.create_button_text' })
        .getAttribute('disabled')
    ).toBeNull();
  });
  expect(readCreation('alice', 'customer-a')?.key).toBe('creation-key');
  first.unmount();
  render(<CreationModal userId="alice" customerId="customer-a" onClose={mockClose} />, { wrapper });
  await screen.findByText('OIDC');
  fireEvent.click(
    screen.getByRole('button', { name: 'enterprise_sso.create_modal.create_button_text' })
  );
  await waitFor(() => {
    expect(mockClose).toHaveBeenCalledWith('cloud-relation');
  });
  expect(mockPost.mock.calls).toEqual([
    ['/api/me/console-sso/connectors', { body: { providerName: SsoProviderName.OIDC } }],
    ['/api/me/console-sso/connectors', { body: { providerName: SsoProviderName.OIDC } }],
  ]);
  const configs = jest.mocked(Client).mock.calls;
  expect(configs).toHaveLength(2);
  await Promise.all(
    configs.map(async ([config]) => {
      if (
        typeof config === 'object' &&
        'headers' in config &&
        typeof config.headers === 'function'
      ) {
        expect(await config.headers(new URL('https://cloud.example.com'), 'post')).toEqual({
          Authorization: 'Bearer test',
          'Idempotency-Key': 'creation-key',
          'X-Logto-Expected-Customer': 'customer-a',
        });
      }
    })
  );
  expect(readCreation('alice', 'customer-a')).toBeUndefined();
});

it('keeps the entry available without a default customer and explains the current API boundary', async () => {
  mockGet.mockImplementation(async (path: string) =>
    path.endsWith('/context') ? { userId: 'alice', stripeCustomerId: null } : []
  );
  render(<ConsoleSso />, { wrapper });
  await waitFor(() => {
    expect(screen.getAllByRole('button', { name: 'enterprise_sso.create' })).toHaveLength(2);
  });
  fireEvent.click(screen.getAllByRole('button', { name: 'enterprise_sso.create' })[0]!);
  expect(screen.getByText('console_sso.no_customer')).toBeTruthy();
  expect(mockPost).not.toHaveBeenCalled();
});

it('does not create under a changed default customer after selecting a provider', async () => {
  render(<CreationModal userId="alice" customerId="customer-a" onClose={mockClose} />, { wrapper });
  fireEvent.click(await screen.findByText('OIDC'));
  mockGet.mockImplementation(async (path: string) =>
    path.endsWith('/context') ? { userId: 'alice', stripeCustomerId: 'customer-b' } : []
  );
  fireEvent.click(
    screen.getByRole('button', { name: 'enterprise_sso.create_modal.create_button_text' })
  );
  await waitFor(() => {
    expect(
      screen
        .getByRole('button', { name: 'enterprise_sso.create_modal.create_button_text' })
        .getAttribute('disabled')
    ).toBeNull();
  });
  expect(mockPost).not.toHaveBeenCalled();
  expect(readCreation('alice', 'customer-a')).toBeUndefined();
});
