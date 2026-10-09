import resources from '@logto/phrases';
import { render, screen } from '@testing-library/react';
import i18next from 'i18next';
import type * as React from 'react';
import { MemoryRouter } from 'react-router-dom';

import { mockEnv, resetMockEnv, type EnvTestUtils } from '@/test-utils/env';

import SamlAppLimitBanner from '.';

jest.mock('@/consts/env', () => jest.requireActual<EnvTestUtils>('@/test-utils/env').mockEnvModule);

jest.mock('@/contexts/TenantsProvider', () => {
  const { createContext } = jest.requireActual<typeof React>('react');

  return { TenantsContext: createContext({ currentTenantId: 'default' }) };
});

describe('SamlAppLimitBanner', () => {
  beforeAll(() => {
    i18next.addResourceBundle('en', 'translation', resources.en.translation, true, true);
  });

  beforeEach(resetMockEnv);

  it.each([
    { variant: 'inline', entry: 'saml_app_applications_limit_notice' },
    { variant: 'footer', entry: 'saml_app_create_modal_limit_banner' },
  ] as const)('embeds the plans link in the $variant quota explanation', ({ variant, entry }) => {
    const { rerender } = render(
      <MemoryRouter>
        <SamlAppLimitBanner variant={variant} limit={7} />
      </MemoryRouter>
    );
    const plansLink = screen.getByRole('link', { name: 'self-hosted plans' });

    expect(plansLink.parentElement?.textContent).toContain('7 SAML applications');
    expect(plansLink.parentElement?.textContent).not.toContain('<selfHostedPlans>');
    expect(plansLink.getAttribute('href')).toBe(
      `https://logto.io/self-hosted-plans?utm_source=logto_oss&utm_medium=console&utm_campaign=self_hosted_plans&utm_content=${entry}`
    );
    expect(plansLink.getAttribute('target')).toBe('_blank');
    expect(plansLink.getAttribute('rel')).toBe('noopener');
    expect(screen.getByRole('link', { name: 'Try Logto Cloud now' }).getAttribute('href')).toBe(
      `https://cloud.logto.io/?utm_source=logto_oss&utm_medium=console&utm_campaign=cloud_upsell&utm_content=${entry}`
    );

    mockEnv({ isDevFeaturesEnabled: true });
    rerender(
      <MemoryRouter>
        <SamlAppLimitBanner variant={variant} limit={11} />
      </MemoryRouter>
    );
    const licenseLink = screen.getByRole('link', { name: 'self-hosted plans' });

    expect(licenseLink.parentElement?.textContent).toContain('11 SAML applications');
    expect(licenseLink.getAttribute('href')).toBe(
      `/console/tenant-settings/license?utm_content=${entry}`
    );
    expect(licenseLink.getAttribute('target')).toBeNull();
  });
});
