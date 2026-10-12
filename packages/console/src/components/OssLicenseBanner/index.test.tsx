import resources from '@logto/phrases';
import { LicenseEnv, ReservedPlanId, ossDefaultQuota } from '@logto/schemas';
import { fireEvent, render, screen } from '@testing-library/react';
import i18next from 'i18next';
import { useContext, useMemo } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { mockEnv, resetMockEnv, type EnvTestUtils } from '@/test-utils/env';
import { type License } from '@/types/license';

import OssLicenseBanner from '.';

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
        <OssLicenseBanner />
        <Routes>
          <Route path="/console/tenant-settings/license" element={<div>License page</div>} />
          <Route path="*" element={null} />
        </Routes>
      </MemoryRouter>
    </SubscriptionDataContext.Provider>
  );
}

describe('OssLicenseBanner', () => {
  beforeAll(() => {
    i18next.addResourceBundle('en', 'translation', resources.en.translation, true);
  });

  beforeEach(() => {
    resetMockEnv();
    jest.useFakeTimers().setSystemTime(new Date('2026-10-09T00:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it.each([
    { name: 'healthy license', installedLicense: license },
    { name: 'no license', installedLicense: undefined },
  ])('does not warn for $name', ({ installedLicense }) => {
    const { container } = render(<Preview installedLicense={installedLicense} />);
    expect(container.textContent).toBe('');
  });

  it.each([
    {
      overrides: { refusalReason: 'unpaid' },
      message: /The license refresh was refused because the license is unpaid\./,
    },
    {
      overrides: { expiresAt: '2026-10-09T00:00:00.000Z' },
      message: /The license key expired on Oct 9, 2026\./,
    },
    {
      overrides: { graceEndsAt: '2026-10-09T00:00:00.000Z', refusalReason: 'unpaid' },
      message: /The license grace period ended on Oct 9, 2026\./,
    },
  ])('shows $message and links internally to License', ({ overrides, message }) => {
    render(<Preview installedLicense={{ ...license, ...overrides }} />);
    expect(screen.getByText(message)).not.toBeNull();

    const link = screen.getByRole('link', { name: 'License' });
    expect(link.getAttribute('href')).toBe('/console/tenant-settings/license');
    expect(link.getAttribute('target')).toBeNull();
    fireEvent.click(link);

    expect(screen.getByText('License page')).not.toBeNull();
    expect(screen.queryByText(message)).toBeNull();
  });

  it('does not warn on Cloud', () => {
    mockEnv({ isCloud: true });
    const { container } = render(
      <Preview installedLicense={{ ...license, refusalReason: 'revoked' }} />
    );
    expect(container.textContent).toBe('');
  });

  it('does not duplicate the detail-page warning on direct navigation with a query and trailing slash', () => {
    render(
      <Preview
        installedLicense={{ ...license, refusalReason: 'canceled' }}
        path="/console/tenant-settings/license/?from=notification"
      />
    );
    expect(screen.getByText('License page')).not.toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('clears the warning when the shared license data recovers', () => {
    const { rerender } = render(
      <Preview installedLicense={{ ...license, refusalReason: 'expired' }} />
    );
    expect(screen.getByText(/The license refresh was refused/)).not.toBeNull();

    rerender(<Preview installedLicense={license} />);
    expect(screen.queryByRole('link')).toBeNull();
  });
});
