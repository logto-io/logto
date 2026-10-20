import resources from '@logto/phrases';
import { SsoProviderType } from '@logto/schemas';
import { render, screen, within } from '@testing-library/react';
import i18next from 'i18next';
import { MemoryRouter } from 'react-router-dom';

import { type ConsoleSsoConnector } from '@/cloud/types/router';

import Experience from '.';

jest.mock('@/cloud/hooks/use-cloud-api', () => ({
  __esModule: true,
  useCloudApi: () => ({ patch: jest.fn() }),
  toastResponseError: jest.fn(),
}));
jest.mock('@/components/FeatureTag', () => ({
  __esModule: true,
  default: () => null,
  BetaTag: () => null,
  CombinedAddOnAndFeatureTag: () => null,
}));
jest.mock('@/consts/env', () => ({
  isCloud: true,
  isDevFeaturesEnabled: false,
}));
jest.mock('@/components/UnsavedChangesAlertModal', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/hooks/use-current-tenant-scopes', () => ({
  __esModule: true,
  default: () => ({ access: { isReadOnly: false } }),
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
jest.mock('@/scss/modal.module.scss', () => ({}));
jest.mock('./DomainManager', () => ({ __esModule: true, default: () => null }));

const warningText =
  resources.en.translation.admin_console.enterprise_sso_details.custom_branding_visibility_notice;
const switchLabel =
  resources.en.translation.admin_console.enterprise_sso_details.show_before_email_match_field_name;
const switchDescription =
  resources.en.translation.admin_console.enterprise_sso_details.show_before_email_match_description;

const data = {
  id: 'sso-connector-id',
  name: 'SAML',
  connectorName: 'Acme SSO',
  providerType: SsoProviderType.SAML,
  branding: {},
  syncProfile: true,
  enableTokenStorage: false,
} as unknown as ConsoleSsoConnector;

describe('Console SSO experience details', () => {
  beforeAll(() => {
    i18next.addResourceBundle('en', 'translation', resources.en.translation, true);
  });

  it('shows the public visibility warning inside the display card', () => {
    render(
      <MemoryRouter>
        <Experience data={data} isDeleted={false} onUpdated={jest.fn()} />
      </MemoryRouter>
    );

    const warning = screen.getByText(warningText);
    const displayCard = screen.getByText('Display').closest('.card');

    expect(displayCard).not.toBeNull();
    expect(within(displayCard as HTMLElement).getByText(warningText)).toBe(warning);
    expect(warning.closest('.alert')).not.toBeNull();

    const toggle = within(displayCard as HTMLElement).getByRole('checkbox', {
      name: switchLabel,
    });
    expect((toggle as HTMLInputElement).checked).toBe(true);
    expect(within(displayCard as HTMLElement).getByText(switchDescription)).toBeTruthy();
  });
});
