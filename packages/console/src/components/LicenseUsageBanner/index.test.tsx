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
  usageWarnings: [{ metric: LicenseUsageMetric.Mau, limit: 50_000, value: 60_000 }],
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

const warningIntro = 'This deployment is above the usage limits of its self-hosted plan:';
const warningAction = 'Contact us within 30 days to upgrade your plan or reduce your usage.';
const mauWarning = 'Monthly active users: 60,000 (limit 50,000)';

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

  it('names the exceeded metric with its value and limit', () => {
    render(<Preview installedLicense={license} />);

    expect(screen.getByText(warningIntro)).not.toBeNull();
    expect(screen.getByText(mauWarning)).not.toBeNull();
    expect(screen.getByText(warningAction)).not.toBeNull();

    const contact = screen.getByRole('link', { name: 'Contact us' });
    expect(contact.getAttribute('href')).toContain('https://logto.io/contact');
    expect(contact.getAttribute('href')).toContain('src=self-hosted-license-usage');
    expect(contact.getAttribute('target')).toBe('_blank');
  });

  it.each([
    {
      metric: LicenseUsageMetric.ProductionDeployments,
      limit: 1,
      value: 2,
      message: 'Production deployments: 2 (limit 1)',
    },
    {
      metric: LicenseUsageMetric.MonthlyAccessTokens,
      limit: 50_000,
      value: 60_000,
      message: 'Monthly access tokens: 60,000 (limit 50,000)',
    },
  ])('names the $metric metric', ({ metric, limit, value, message }) => {
    render(
      <Preview installedLicense={{ ...license, usageWarnings: [{ metric, limit, value }] }} />
    );
    expect(screen.getByText(message)).not.toBeNull();
  });

  it('lists every exceeded metric', () => {
    render(
      <Preview
        installedLicense={{
          ...license,
          usageWarnings: [
            { metric: LicenseUsageMetric.Mau, limit: 50_000, value: 60_000 },
            { metric: LicenseUsageMetric.ProductionDeployments, limit: 1, value: 2 },
          ],
        }}
      />
    );

    expect(screen.getByText(mauWarning)).not.toBeNull();
    expect(screen.getByText('Production deployments: 2 (limit 1)')).not.toBeNull();
  });

  it('falls back to the raw metric name for an unknown warning', () => {
    render(
      <Preview
        installedLicense={{
          ...license,
          usageWarnings: [{ metric: 'futureMetric', limit: 1, value: 2 }],
        }}
      />
    );
    expect(screen.getByText('futureMetric: 2 (limit 1)')).not.toBeNull();
  });

  it('dismisses the banner for 7 days', () => {
    const { container } = render(<Preview installedLicense={license} />);
    expect(screen.getByText(mauWarning)).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(screen.queryByText(mauWarning)).toBeNull();
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
    expect(Boolean(screen.queryByText(mauWarning))).toBe(offset < 0);
  });

  it('does not warn on Cloud', () => {
    mockEnv({ isCloud: true });
    const { container } = render(<Preview installedLicense={license} />);
    expect(container.textContent).toBe('');
  });

  it('still warns on the License page, which has no usage UI of its own', () => {
    render(<Preview installedLicense={license} path="/console/tenant-settings/license" />);
    expect(screen.getByText('License page')).not.toBeNull();
    expect(screen.getByText(mauWarning)).not.toBeNull();
  });

  it('clears the warning when the usage recovers', () => {
    const { rerender } = render(<Preview installedLicense={license} />);
    expect(screen.getByText(mauWarning)).not.toBeNull();

    act(() => {
      rerender(<Preview installedLicense={{ ...license, usageWarnings: [] }} />);
    });
    expect(screen.queryByText(mauWarning)).toBeNull();
  });
});
