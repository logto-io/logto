import resource from '@logto/phrases-experience';
import { ssrPlaceholder, type SsrData } from '@logto/schemas';

import { mockSignInExperience, mockSignInExperienceSettings } from '@/__mocks__/logto';
import { getSignInExperience } from '@/apis/settings';
import { searchKeys } from '@/shared/utils/search-parameters';

import { getSignInExperienceSettings } from './sign-in-experience';

jest.mock('@/apis/settings', () => ({
  getSignInExperience: jest.fn(),
}));

const getSignInExperienceMock = getSignInExperience as jest.Mock;

const setLogtoSsr = (value: typeof logtoSsr) => {
  // eslint-disable-next-line @silverhand/fp/no-mutation -- tests stage the SSR global
  window.logtoSsr = value;
};

describe('getSignInExperienceSettings', () => {
  it('should return the sign in experience settings', async () => {
    getSignInExperienceMock.mockResolvedValueOnce(mockSignInExperience);
    const settings = await getSignInExperienceSettings();

    expect(settings.branding).toEqual(mockSignInExperience.branding);
    expect(settings.languageInfo).toEqual(mockSignInExperience.languageInfo);
    expect(settings.termsOfUseUrl).toEqual(mockSignInExperience.termsOfUseUrl);
    expect(settings.signUp.identifiers).toContain('username');
    expect(settings.signIn.methods).toHaveLength(3);
  });
});

describe('getSignInExperienceSettings SSR context matching', () => {
  const cimdClientId = 'https://client.example.com/client-metadata.json';
  const registeredAppId = 'registered_app_id';
  /** Marks the returned settings as coming from the SSR payload rather than the API mock. */
  const ssrTermsOfUseUrl = 'https://ssr.example.com/terms';

  const buildSsrData = (appId?: string): Readonly<SsrData> => ({
    signInExperience: {
      ...(appId === undefined ? {} : { appId }),
      data: {
        ...mockSignInExperienceSettings,
        socialSignInConnectorTargets: [],
        termsOfUseUrl: ssrTermsOfUseUrl,
      },
    },
    phrases: { lng: 'en', data: resource.en },
  });

  /** Clear up front — earlier describe blocks in this file leave calls on the shared API mock. */
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    setLogtoSsr(ssrPlaceholder);
    sessionStorage.clear();
  });

  it('should keep the SSR settings when the SSR appId matches the stored app_id', async () => {
    sessionStorage.setItem(searchKeys.appId, registeredAppId);
    setLogtoSsr(buildSsrData(registeredAppId));

    const settings = await getSignInExperienceSettings();

    expect(settings.termsOfUseUrl).toBe(ssrTermsOfUseUrl);
    expect(getSignInExperienceMock).not.toHaveBeenCalled();
  });

  it('should keep the SSR settings when the omitted appId pairs with a stored CIMD identifier', async () => {
    sessionStorage.setItem(searchKeys.appId, cimdClientId);
    setLogtoSsr(buildSsrData());

    const settings = await getSignInExperienceSettings();

    expect(settings.termsOfUseUrl).toBe(ssrTermsOfUseUrl);
    expect(getSignInExperienceMock).not.toHaveBeenCalled();
  });

  it('should refetch when the omitted appId pairs with a stored registered application id', async () => {
    sessionStorage.setItem(searchKeys.appId, registeredAppId);
    setLogtoSsr(buildSsrData());
    getSignInExperienceMock.mockResolvedValueOnce(mockSignInExperience);

    const settings = await getSignInExperienceSettings();

    expect(getSignInExperienceMock).toHaveBeenCalledTimes(1);
    expect(settings.termsOfUseUrl).toBe(mockSignInExperience.termsOfUseUrl);
  });
});
