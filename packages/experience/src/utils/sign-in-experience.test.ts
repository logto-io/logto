import { mockSignInExperience } from '@/__mocks__/logto';
import { getSignInExperience } from '@/apis/settings';

import { getSignInExperienceSettings } from './sign-in-experience';

jest.mock('@/apis/settings', () => ({
  getSignInExperience: jest.fn(),
}));

describe('getSignInExperienceSettings', () => {
  const getSignInExperienceMock = getSignInExperience as jest.Mock;

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
