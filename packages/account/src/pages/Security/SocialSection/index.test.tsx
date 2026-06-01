import { AccountCenterControlValue, ConnectorPlatform } from '@logto/schemas';
import { fireEvent, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import renderWithPageContext, {
  mockAccountCenterSettings,
  mockSignInExperienceSettings,
  mockUserInfo,
} from '@ac/__mocks__/RenderWithPageContext';
import { deleteSocialIdentity } from '@ac/apis/social';
import { securityRoute, verifiedActionRoute } from '@ac/constants/routes';
import { sessionStorage } from '@ac/utils/session-storage';

import SocialSection from '.';

const mockGetAccessToken = jest.fn().mockResolvedValue('access-token');

jest.mock('@logto/react', () => ({
  useLogto: () => ({
    getAccessToken: mockGetAccessToken,
  }),
}));

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
          verificationId: 'verification-id',
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
      expect(mockDeleteSocialIdentity).toHaveBeenCalledWith(
        'access-token',
        'verification-id',
        'google'
      );
    });
    expect(refreshUserInfo).toHaveBeenCalled();
    expect(setToast).toHaveBeenCalled();
    expect(queryByText('verified action page')).toBeNull();
  });

  it('navigates to verified action when verification is required', async () => {
    const { getAllByText, getByText } = renderWithPageContext(
      <Routes>
        <Route path={securityRoute} element={<SocialSection />} />
        <Route path={verifiedActionRoute} element={<div>verified action page</div>} />
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
      expect(getByText('verified action page')).not.toBeNull();
    });
    expect(sessionStorage.getPendingVerifiedAction()).toBe('remove-social');
    expect(sessionStorage.getPendingSocialRemoveConnectorId()).toBe('google-web');
    expect(mockDeleteSocialIdentity).not.toHaveBeenCalled();
  });
});
