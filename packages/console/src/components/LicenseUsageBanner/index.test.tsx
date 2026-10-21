import resources from '@logto/phrases';
import { LicenseEnv, LicenseUsageMetric, ReservedPlanId, ossDefaultQuota } from '@logto/schemas';
import { act, fireEvent, render, screen } from '@testing-library/react';
import i18next from 'i18next';
import { useContext, useMemo } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { storageKeys } from '@/consts';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { mockEnv, resetMockEnv, type EnvTestUtils } from '@/test-utils/env';
import { type License } from '@/types/license';

import LicenseUsageBanner from '.';
import { licenseUsageBannerDismissDuration } from './license-usage-banner';

jest.mock('@/consts/env', () => jest.requireActual<EnvTestUtils>('@/test-utils/env').mockEnvModule);
jest.mock('@/components/Region', () => ({ defaultRegionName: 'US' }));

const license: License = {
  plan: ReservedPlanId.SelfHostedPro,
  env: LicenseEnv.Production,
  quota: { ...ossDefaultQuota, hideLogtoBranding: true, samlApplicationsLimit: null },
  expiresAt: '2027-01-01T00:00:00.000Z',
  installedAt: '2026-09-01T00:00:00.000Z',
  lastRefreshedAt: '2026-10-01T00:00:00.000Z',
  graceEndsAt: '2026-10-31T00:00:00.000Z',
  usageLimits: { mau: 50_000 },
  usage: {
    month: '2026-10',
    mau: { lastMonth: 60_000, monthToDate: 10_000 },
    monthlyAccessTokens: { lastMonth: 1000, monthToDate: 100 },
    tenants: 2,
  },
  usageWarnings: [{ metric: LicenseUsageMetric.Mau, limit: 50_000, value: 60_000 }],
  usageReportingEnabled: true,
};

function Preview({
  installedLicense,
  path = '/console/applications',
}: {
  readonly installedLicense?: License;
  readonly path?: string;
}) {
  const defaults = useContext(SubscriptionDataContext);
  const value = useMemo(
    () => ({ ...defaults, license: installedLicense }),
    [defaults, installedLicense]
  );

  return (
    <SubscriptionDataContext.Provider value={value}>
      <MemoryRouter initialEntries={[path]}>
        <LicenseUsageBanner />
        <Routes>
          <Route path="/console/tenant-settings/license" element={<div>License page</div>} />
          <Route path="*" element={null} />
        </Routes>
      </MemoryRouter>
    </SubscriptionDataContext.Provider>
  );
}

const usageWarningCopy =
  'This deployment is above the usage limits of its self-hosted plan. Contact us within 30 days to upgrade your plan or reduce your usage.';

describe('LicenseUsageBanner', () => {
  beforeAll(() => {
    i18next.addResourceBundle('en', 'translation', resources.en.translation, true);
  });

  beforeEach(() => {
    resetMockEnv();
    localStorage.clear();
    jest.useFakeTimers().setSystemTime(new Date('2026-10-09T00:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('does not warn without usage warnings', () => {
    const { container } = render(
      <Preview installedLicense={{ ...license, usageWarnings: undefined }} />
    );
    expect(container.textContent).toBe('');
  });

  it.each([
    { metric: LicenseUsageMetric.Mau, value: 60_000 },
    { metric: LicenseUsageMetric.ProductionDeployments, value: 2 },
    { metric: LicenseUsageMetric.MonthlyAccessTokens, value: 60_000 },
  ])('warns for the $metric metric with a Contact us action', ({ metric, value }) => {
    render(
      <Preview
        installedLicense={{
          ...license,
          usageWarnings: [{ metric, limit: 1, value }],
        }}
      />
    );

    expect(screen.getByText(usageWarningCopy)).not.toBeNull();

    const contact = screen.getByRole('link', { name: 'Contact us' });
    expect(contact.getAttribute('href')).toContain('https://logto.io/contact');
    expect(contact.getAttribute('href')).toContain('src=self-hosted-license-usage');
    expect(contact.getAttribute('target')).toBe('_blank');
  });

  it('dismisses the banner for 7 days', () => {
    const { container } = render(<Preview installedLicense={license} />);
    expect(screen.getByText(usageWarningCopy)).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(screen.queryByText(usageWarningCopy)).toBeNull();
    expect(localStorage.getItem(storageKeys.licenseUsageBannerDismissedUntil)).toBe(
      String(Date.now() + licenseUsageBannerDismissDuration)
    );
    expect(container.textContent).toBe('');
  });

  it.each([
    { name: 'a dismissal that has not expired', offset: licenseUsageBannerDismissDuration - 1 },
    { name: 'a dismissal that has expired', offset: -1 },
  ])('$name decides whether the banner shows', ({ offset }) => {
    localStorage.setItem(storageKeys.licenseUsageBannerDismissedUntil, String(Date.now() + offset));

    render(<Preview installedLicense={license} />);
    expect(Boolean(screen.queryByText(usageWarningCopy))).toBe(offset < 0);
  });

  it('does not warn on Cloud', () => {
    mockEnv({ isCloud: true });
    const { container } = render(<Preview installedLicense={license} />);
    expect(container.textContent).toBe('');
  });

  it('does not duplicate the usage details on the License page', () => {
    render(<Preview installedLicense={license} path="/console/tenant-settings/license" />);
    expect(screen.getByText('License page')).not.toBeNull();
    expect(screen.queryByText(usageWarningCopy)).toBeNull();
  });

  it('clears the warning when the usage recovers', () => {
    const { rerender } = render(<Preview installedLicense={license} />);
    expect(screen.getByText(usageWarningCopy)).not.toBeNull();

    act(() => {
      rerender(<Preview installedLicense={{ ...license, usageWarnings: [] }} />);
    });
    expect(screen.queryByText(usageWarningCopy)).toBeNull();
  });
});
