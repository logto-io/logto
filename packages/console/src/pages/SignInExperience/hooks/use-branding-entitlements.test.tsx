import { LicenseEnv, ReservedPlanId, type LicenseQuota, ossDefaultQuota } from '@logto/schemas';
import { renderHook } from '@testing-library/react';
import { type ReactNode, useContext, useMemo } from 'react';

import { defaultSubscriptionQuota } from '@/consts/tenants';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { type FullContext } from '@/contexts/SubscriptionDataProvider/types';
import { mockEnv, resetMockEnv, type EnvTestUtils } from '@/test-utils/env';

import useBrandingEntitlements from './use-branding-entitlements';

jest.mock('@/consts/env', () => jest.requireActual<EnvTestUtils>('@/test-utils/env').mockEnvModule);

// The tenant defaults pull in the region flags, which jest cannot resolve as `?react` SVG imports.
jest.mock('@/components/Region', () => ({ defaultRegionName: 'US' }));

const renderWithContext = (context: Partial<FullContext>) => {
  function Wrapper({ children }: { readonly children: ReactNode }) {
    // Outside a provider, the context answers with its defaults: no license, the default quota.
    const defaults = useContext(SubscriptionDataContext);
    const value = useMemo(() => ({ ...defaults, ...context }), [defaults]);

    return (
      <SubscriptionDataContext.Provider value={value}>{children}</SubscriptionDataContext.Provider>
    );
  }

  return renderHook(() => useBrandingEntitlements(), { wrapper: Wrapper }).result.current;
};

const withLicense = (quota: Partial<LicenseQuota>): Partial<FullContext> => ({
  licenseQuota: { ...ossDefaultQuota, ...quota },
  license: {
    plan: ReservedPlanId.SelfHostedPro,
    env: LicenseEnv.Production,
    quota: { ...ossDefaultQuota, ...quota },
    expiresAt: '2027-01-01T00:00:00.000Z',
    installedAt: '2026-01-01T00:00:00.000Z',
    lastRefreshedAt: '2026-01-01T00:00:00.000Z',
    graceEndsAt: '2026-01-31T00:00:00.000Z',
  },
});

describe('useBrandingEntitlements', () => {
  beforeEach(resetMockEnv);

  describe('outside Cloud', () => {
    it('keeps hiding the branding available without a license, and the Custom UI CSP unlocked (activated in this fork)', () => {
      expect(renderWithContext({})).toStrictEqual({
        isHideLogtoBrandingAvailable: true,
        isHideLogtoBrandingEnabled: true,
        isCustomUiCspEnabled: true,
      });
    });

    it('unlocks the Custom UI CSP with a license that grants Bring your UI', () => {
      expect(renderWithContext(withLicense({ bringYourUi: true }))).toStrictEqual({
        isHideLogtoBrandingAvailable: true,
        isHideLogtoBrandingEnabled: true,
        isCustomUiCspEnabled: true,
      });
    });

    it('unlocks the Custom UI CSP from a license that only grants hiding the branding', () => {
      expect(renderWithContext(withLicense({ hideLogtoBranding: true }))).toStrictEqual({
        isHideLogtoBrandingAvailable: true,
        isHideLogtoBrandingEnabled: true,
        isCustomUiCspEnabled: true,
      });
    });

    it('ignores the Cloud subscription quota', () => {
      expect(
        renderWithContext({
          currentSubscriptionQuota: { ...defaultSubscriptionQuota, bringYourUiEnabled: true },
        })
      ).toMatchObject({ isHideLogtoBrandingEnabled: true, isCustomUiCspEnabled: true });
    });
  });

  describe('on Cloud', () => {
    beforeEach(() => {
      mockEnv({ isCloud: true });
    });

    it.each([true, false])(
      'follows the Bring your UI subscription quota (%s)',
      (bringYourUiEnabled) => {
        expect(
          renderWithContext({
            currentSubscriptionQuota: { ...defaultSubscriptionQuota, bringYourUiEnabled },
          })
        ).toStrictEqual({
          isHideLogtoBrandingAvailable: true,
          isHideLogtoBrandingEnabled: bringYourUiEnabled,
          isCustomUiCspEnabled: bringYourUiEnabled,
        });
      }
    );

    it('ignores a license', () => {
      expect(
        renderWithContext({
          ...withLicense({ hideLogtoBranding: true, bringYourUi: true }),
          currentSubscriptionQuota: { ...defaultSubscriptionQuota, bringYourUiEnabled: false },
        })
      ).toMatchObject({ isHideLogtoBrandingEnabled: false, isCustomUiCspEnabled: false });
    });
  });
});
