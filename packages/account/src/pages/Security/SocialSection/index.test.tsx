import { AccountCenterControlValue, ConnectorPlatform } from '@logto/schemas';
import { fireEvent, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import renderWithPageContext, {
  mockAccountCenterSettings,
  mockSignInExperienceSettings,
  mockUserInfo,
} from '@ac/__mocks__/RenderWithPageContext';
import { deleteSocialIdentity } from '@ac/apis/social';
import { securityRoute } from '@ac/constants/routes';
import { accountStorage } from '@ac/utils/session-storage';

import SocialSection from '.';

const mockGetAccessToken = jest.fn().mockResolvedValue('access-token');
const mockGetIdTokenClaims = jest.fn();
const mockSignIn = jest.fn();

jest.mock('@logto/react', () => ({
  useLogto: () => ({
    getAccessToken: mockGetAccessToken,
    getIdTokenClaims: mockGetIdTokenClaims,
    signIn: mockSignIn,
  }),
}));

const createIdTokenClaims = (authTime = Math.floor(Date.now() / 1000) - 60) => ({
  acr: 'urn:logto:acr:1fa',
  auth_time: authTime,
});

jest.mock('@ac/apis/social', () => ({
  deleteSocialIdentity: jest.fn(),
}));

const mockDeleteSocialIdentity = deleteSocialIdentity as jest.MockedFunction<
  typeof deleteSocialIdentity
>;

const googleWebConnector = {
  id: 'google-web',
  target: 'google',
  platform: ConnectorPlatform.Web,
  name: { en: 'Google' },
  logo: 'https://example.com/google.svg',
  logoDark: 'https://example.com/google-dark.svg',
};

const linkedUserInfo = {
  ...mockUserInfo,
  identities: {
    google: {
      userId: 'google-user-id',
      details: { name: 'Test User' },
    },
  },
};

describe('SocialSection remove', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    mockGetIdTokenClaims.mockResolvedValue(createIdTokenClaims());
    mockDeleteSocialIdentity.mockReset();
    mockDeleteSocialIdentity.mockResolvedValue(undefined);
  });

  it('removes social identity in-page when verification is already available', async () => {
    const setToast = jest.fn();
    const refreshUserInfo = jest.fn().mockResolvedValue(undefined);

    const { getAllByText, getByText, queryByText } = renderWithPageContext(
      <Routes>
        <Route path={securityRoute} element={<SocialSection />} />
      </Routes>,
      { initialEntries: [securityRoute] },
      {
        pageContext: {
          accountCenterSettings: {
            ...mockAccountCenterSettings,
            fields: {
              ...mockAccountCenterSettings.fields,
              social: AccountCenterControlValue.Edit,
            },
          },
          experienceSettings: {
            ...mockSignInExperienceSettings,
            socialConnectors: [googleWebConnector],
          },
          userInfo: linkedUserInfo,
          setToast,
          refreshUserInfo,
        },
      }
    );

    fireEvent.click(getByText('account_center.security.remove'));
    const confirmRemoveButton = getAllByText('action.remove').at(-1);
    expect(confirmRemoveButton).toBeDefined();
    fireEvent.click(confirmRemoveButton!);

    await waitFor(() => {
      expect(mockDeleteSocialIdentity).toHaveBeenCalledWith('access-token', 'google');
    });
    expect(refreshUserInfo).toHaveBeenCalled();
    expect(setToast).toHaveBeenCalled();
    expect(queryByText('verified action page')).toBeNull();
  });

  it('starts a step-up when the authentication context is stale', async () => {
    mockGetIdTokenClaims.mockResolvedValue(
      createIdTokenClaims(Math.floor(Date.now() / 1000) - 600)
    );

    const { getAllByText, getByText } = renderWithPageContext(
      <Routes>
        <Route path={securityRoute} element={<SocialSection />} />
      </Routes>,
      { initialEntries: [securityRoute] },
      {
        pageContext: {
          accountCenterSettings: {
            ...mockAccountCenterSettings,
            fields: {
              ...mockAccountCenterSettings.fields,
              social: AccountCenterControlValue.Edit,
            },
          },
          experienceSettings: {
            ...mockSignInExperienceSettings,
            socialConnectors: [googleWebConnector],
          },
          userInfo: linkedUserInfo,
        },
      }
    );

    fireEvent.click(getByText('account_center.security.remove'));
    const confirmRemoveButton = getAllByText('action.remove').at(-1);
    expect(confirmRemoveButton).toBeDefined();
    fireEvent.click(confirmRemoveButton!);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
    });
    expect(mockSignIn).toHaveBeenCalledWith({
      redirectUri: 'http://localhost/account',
      clearTokens: false,
      extraParams: { acr_values: 'urn:logto:acr:1fa', max_age: '540' },
    });
    expect(accountStorage.pendingStepUp.get()).toMatchObject({
      action: { type: 'remove-social', connectorId: 'google-web' },
      phase: 'authorizing',
    });
    expect(mockDeleteSocialIdentity).not.toHaveBeenCalled();
  });
});
