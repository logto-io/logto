import { getOssOnboardingRedirectPath } from './utils';

describe('OSS onboarding guard utils', () => {
  test('redirects unfinished OSS users to the onboarding route', () => {
    expect(
      getOssOnboardingRedirectPath({
        isCloud: false,
        isDevFeaturesEnabled: true,
        isProduction: true,
        hasError: false,
        isLoading: false,
        isOnboardingDone: false,
        tenantId: 'console',
        pathname: '/console/get-started',
      })
    ).toBe('/console/onboarding');
  });

  test('does not redirect when onboarding is already complete or when already on onboarding', () => {
    expect(
      getOssOnboardingRedirectPath({
        isCloud: false,
        isDevFeaturesEnabled: true,
        isProduction: true,
        hasError: false,
        isLoading: false,
        isOnboardingDone: true,
        tenantId: 'console',
        pathname: '/console/get-started',
      })
    ).toBeUndefined();

    expect(
      getOssOnboardingRedirectPath({
        isCloud: false,
        isDevFeaturesEnabled: true,
        isProduction: true,
        hasError: false,
        isLoading: false,
        isOnboardingDone: false,
        tenantId: 'console',
        pathname: '/console/onboarding',
      })
    ).toBeUndefined();
  });

  test('never redirects cloud routes', () => {
    expect(
      getOssOnboardingRedirectPath({
        isCloud: true,
        isDevFeaturesEnabled: true,
        isProduction: true,
        hasError: false,
        isLoading: false,
        isOnboardingDone: false,
        tenantId: 'console',
        pathname: '/console/get-started',
      })
    ).toBeUndefined();
  });

  test('does not redirect in non-production environments', () => {
    expect(
      getOssOnboardingRedirectPath({
        isCloud: false,
        isDevFeaturesEnabled: true,
        isProduction: false,
        hasError: false,
        isLoading: false,
        isOnboardingDone: false,
        tenantId: 'console',
        pathname: '/console/get-started',
      })
    ).toBeUndefined();
  });

  test('does not redirect when dev features are disabled', () => {
    expect(
      getOssOnboardingRedirectPath({
        isCloud: false,
        isDevFeaturesEnabled: false,
        isProduction: true,
        hasError: false,
        isLoading: false,
        isOnboardingDone: false,
        tenantId: 'console',
        pathname: '/console/get-started',
      })
    ).toBeUndefined();
  });

  test('does not redirect when onboarding state failed to load', () => {
    expect(
      getOssOnboardingRedirectPath({
        isCloud: false,
        isDevFeaturesEnabled: true,
        isProduction: true,
        hasError: true,
        isLoading: false,
        isOnboardingDone: false,
        tenantId: 'console',
        pathname: '/console/get-started',
      })
    ).toBeUndefined();
  });
});
