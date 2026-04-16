import { getOssOnboardingRedirectPath } from './utils';

describe('OSS onboarding guard utils', () => {
  test('redirects users explicitly marked as requiring OSS onboarding to the onboarding route', () => {
    expect(
      getOssOnboardingRedirectPath({
        isCloud: false,
        isDevFeaturesEnabled: true,
        hasError: false,
        isLoading: false,
        isOnboardingRequired: true,
        tenantId: 'console',
        pathname: '/console/get-started',
      })
    ).toBe('/console/onboarding');
  });

  test('does not redirect users without an explicit OSS onboarding requirement', () => {
    expect(
      getOssOnboardingRedirectPath({
        isCloud: false,
        isDevFeaturesEnabled: true,
        hasError: false,
        isLoading: false,
        isOnboardingRequired: false,
        tenantId: 'console',
        pathname: '/console/get-started',
      })
    ).toBeUndefined();
  });

  test('does not redirect when already on onboarding', () => {
    expect(
      getOssOnboardingRedirectPath({
        isCloud: false,
        isDevFeaturesEnabled: true,
        hasError: false,
        isLoading: false,
        isOnboardingRequired: true,
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
        hasError: false,
        isLoading: false,
        isOnboardingRequired: true,
        tenantId: 'console',
        pathname: '/console/get-started',
      })
    ).toBeUndefined();
  });

  test('does not redirect when the OSS onboarding feature is disabled', () => {
    expect(
      getOssOnboardingRedirectPath({
        isCloud: false,
        isDevFeaturesEnabled: false,
        hasError: false,
        isLoading: false,
        isOnboardingRequired: true,
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
        hasError: true,
        isLoading: false,
        isOnboardingRequired: true,
        tenantId: 'console',
        pathname: '/console/get-started',
      })
    ).toBeUndefined();
  });
});
