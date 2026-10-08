import { LicenseEnv, ReservedPlanId, ossDefaultQuota } from '@logto/schemas';
import { type Nullable } from '@silverhand/essentials';
import { act, renderHook } from '@testing-library/react';
import useSWR from 'swr';

import { type License } from '@/types/license';

import useLicense from './use-license';

jest.mock('@/consts/env', () => ({ isCloud: false, isDevFeaturesEnabled: true }));
jest.mock('@/utils/request', () => ({ shouldRetryOnError: jest.fn() }));
jest.mock('./use-api', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('swr', () => jest.fn());

const license: License = {
  plan: ReservedPlanId.SelfHostedPro,
  env: LicenseEnv.Production,
  quota: { ...ossDefaultQuota, consoleCollaboration: true, samlApplicationsLimit: null },
  expiresAt: '2027-01-01T00:00:00.000Z',
  installedAt: '2026-01-01T00:00:00.000Z',
  lastRefreshedAt: '2026-01-01T00:00:00.000Z',
  graceEndsAt: '2026-01-31T00:00:00.000Z',
};

const mockLicense = (data: Nullable<License>) => {
  jest.mocked(useSWR).mockReturnValue({
    data,
    error: undefined,
    isLoading: false,
    isValidating: false,
    mutate: jest.fn(),
  });
};

describe('useLicense', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(Date.parse(license.graceEndsAt) - 1000);
    mockLicense(license);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('expires entitlements without a reload and preserves the installed license', () => {
    const { result } = renderHook(useLicense);
    expect(result.current.licenseQuota.consoleCollaboration).toBe(true);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.licenseQuota).toEqual(ossDefaultQuota);
    expect(result.current.license).toBe(license);
  });

  it('restores entitlements when a refreshed license arrives', () => {
    jest.setSystemTime(Date.parse(license.graceEndsAt));
    const { result, rerender } = renderHook(useLicense);
    expect(result.current.licenseQuota).toEqual(ossDefaultQuota);

    mockLicense({ ...license, graceEndsAt: '2026-03-02T00:00:00.000Z' });
    rerender();
    expect(result.current.licenseQuota.consoleCollaboration).toBe(true);
  });

  it('handles a full grace period longer than the browser timeout limit', () => {
    jest.setSystemTime(Date.parse(license.lastRefreshedAt));
    const { result } = renderHook(useLicense);

    act(() => {
      jest.advanceTimersByTime(2_147_483_647);
    });
    expect(result.current.licenseQuota.consoleCollaboration).toBe(true);

    act(() => {
      jest.advanceTimersByTime(Date.parse(license.graceEndsAt) - Date.now());
    });
    expect(result.current.licenseQuota).toEqual(ossDefaultQuota);
  });

  it('uses OSS defaults without a license', () => {
    mockLicense(null);
    const { result } = renderHook(useLicense);
    expect(result.current.licenseQuota).toEqual(ossDefaultQuota);
    expect(result.current.license).toBeUndefined();
  });
});
