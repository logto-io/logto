import { getOssOnboardingRedirectPath } from './utils';

describe('OSS onboarding guard utils', () => {
  test('redirects unfinished OSS users to the onboarding route', () => {
    expect(
      getOssOnboardingRedirectPath({
        isCloud: false,
        isDevFeaturesEnabled: true,
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
        isLoading: false,
        isOnboardingDone: false,
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
        isLoading: false,
        isOnboardingDone: false,
        tenantId: 'console',
        pathname: '/console/get-started',
      })
    ).toBeUndefined();
  });
});
