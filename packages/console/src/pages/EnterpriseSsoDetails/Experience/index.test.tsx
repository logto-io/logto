import resources from '@logto/phrases';
import { SsoProviderType } from '@logto/schemas';
import { render, screen, within } from '@testing-library/react';
import i18next from 'i18next';
import { MemoryRouter } from 'react-router-dom';

import Experience from '.';

jest.mock('@/components/FeatureTag', () => ({
  __esModule: true,
  default: () => null,
  BetaTag: () => null,
  CombinedAddOnAndFeatureTag: () => null,
}));
jest.mock('@/consts/env', () => ({
  isCloud: false,
  isDevFeaturesEnabled: false,
}));
jest.mock('@/components/LearnMore', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/UnsavedChangesAlertModal', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/consts', () => ({
  retrieveTokenStorage: 'retrieve-token-storage',
  spInitiatedSsoFlow: 'sp-initiated-sso',
}));
jest.mock('@/scss/modal.module.scss', () => ({}));
// The Cloud client is ESM-only; the page only needs the error class at module scope.
jest.mock('@withtyped/client', () => ({ ResponseError: class extends Error {} }), {
  virtual: true,
});
jest.mock('@/hooks/use-api', () => ({
  __esModule: true,
  default: () => ({ patch: jest.fn() }),
}));
jest.mock('@/hooks/use-current-tenant-scopes', () => ({
  __esModule: true,
  default: () => ({ access: { isReadOnly: false } }),
}));
jest.mock('@/hooks/use-user-assets-service', () => ({
  __esModule: true,
  default: () => ({ isReady: false }),
}));
jest.mock('@/hooks/use-tenant-pathname', () => ({
  __esModule: true,
  default: () => ({
    match: () => false,
    getPathname: (pathname: string) => pathname,
    getTo: (to: unknown) => to,
    navigate: jest.fn(),
    getUrl: (pathname: string) => new URL(pathname, 'http://localhost'),
  }),
}));

const warningText =
  resources.en.translation.admin_console.enterprise_sso_details.custom_branding_visibility_notice;

const data = {
  id: 'sso-connector-id',
  name: 'SAML',
  connectorName: 'Acme SSO',
  providerType: SsoProviderType.SAML,
  domains: ['example.com'],
  branding: {},
  syncProfile: true,
  enableTokenStorage: false,
};

describe('Enterprise SSO experience details', () => {
  beforeAll(() => {
    i18next.addResourceBundle('en', 'translation', resources.en.translation, true);
  });

  it('shows the public visibility warning inside the display card', () => {
    render(
      <MemoryRouter>
        <Experience data={data} isDeleted={false} isDarkModeEnabled={false} onUpdated={jest.fn()} />
      </MemoryRouter>
    );

    const warning = screen.getByText(warningText);
    const displayCard = screen.getByText('Display').closest('.card');

    expect(displayCard).not.toBeNull();
    expect(within(displayCard as HTMLElement).getByText(warningText)).toBe(warning);
    expect(warning.closest('.alert')).not.toBeNull();
  });
});
