import { AccountCenterControlValue, ConnectorPlatform, type AccountCenter } from '@logto/schemas';
import { waitFor } from '@testing-library/react';
import { HTTPError, type NormalizedOptions } from 'ky';
import { Route, Routes } from 'react-router-dom';

import renderWithPageContext, {
  mockAccountCenterSettings,
  mockSignInExperienceSettings,
  mockUserInfo,
} from '@ac/__mocks__/RenderWithPageContext';
import { deleteSocialIdentity } from '@ac/apis/social';
import { getSocialRemoveRoute, securityRoute } from '@ac/constants/routes';

import SocialFlow from '.';

const mockGetAccessToken = jest.fn().mockResolvedValue('access-token');
const mockRequestStepUp = jest.fn();
const mockRefreshUserInfo = jest.fn();
const mockSetToast = jest.fn();

jest.mock('@ac/constants/env', () => ({
  __esModule: true,
  isDevFeaturesEnabled: true,
}));

jest.mock('@logto/react', () => ({
  __esModule: true,
  useLogto: () => ({
    getAccessToken: mockGetAccessToken,
  }),
}));

jest.mock('@ac/hooks/use-step-up', () => ({
  __esModule: true,
  default: () => ({ requestStepUp: mockRequestStepUp, startStepUp: jest.fn() }),
  useStepUpEntry: () => ({
    isReady: true,
    isChecking: false,
    hasFailed: false,
    isResumed: true,
    verificationId: undefined,
  }),
}));

jest.mock('@ac/apis/social', () => ({
  createSocialVerification: jest.fn(),
  deleteSocialIdentity: jest.fn(),
  linkSocialIdentity: jest.fn(),
  replaceSocialIdentity: jest.fn(),
}));

jest.mock('@ac/components/GlobalLoading', () => () => <div>Global loading</div>);

const connectorId = 'google-web';

const googleConnector = {
  id: connectorId,
  target: 'google',
  platform: ConnectorPlatform.Web,
  name: { en: 'Google' },
  logo: 'https://example.com/google.svg',
  logoDark: 'https://example.com/google-dark.svg',
};

const accountCenterSettings: AccountCenter = {
  ...mockAccountCenterSettings,
  fields: {
    ...mockAccountCenterSettings.fields,
    social: AccountCenterControlValue.Edit,
  },
};

const createPermissionDeniedError = () =>
  new HTTPError(
    {
      status: 401,
      json: async () => ({
        code: 'verification_record.permission_denied',
        message: 'Permission denied, please re-authenticate.',
      }),
    } as Response,
    {} as Request,
    {} as NormalizedOptions
  );

const renderSocialFlow = () =>
  renderWithPageContext(
    <Routes>
      <Route path={getSocialRemoveRoute(':connectorId')} element={<SocialFlow mode="remove" />} />
      <Route path={securityRoute} element={<div>Security page</div>} />
    </Routes>,
    {
      initialEntries: [getSocialRemoveRoute(connectorId)],
      future: {
        v7_relativeSplatPath: true,
        v7_startTransition: true,
      },
    },
    {
      pageContext: {
        accountCenterSettings,
        experienceSettings: {
          ...mockSignInExperienceSettings,
          socialConnectors: [googleConnector],
        },
        userInfo: {
          ...mockUserInfo,
          identities: {},
        },
        refreshUserInfo: mockRefreshUserInfo,
        setToast: mockSetToast,
      },
    }
  );

describe('<SocialFlow /> OIDC step-up', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockGetAccessToken.mockResolvedValue('access-token');
    mockRequestStepUp.mockResolvedValue(false);
    mockRefreshUserInfo.mockResolvedValue(undefined);
    window.sessionStorage.clear();
    jest.mocked(deleteSocialIdentity).mockRejectedValue(createPermissionDeniedError());
  });

  it('ends the flow when a resumed request is denied again instead of resetting and retrying', async () => {
    const { getByText } = renderSocialFlow();

    await waitFor(() => {
      expect(getByText('Security page')).toBeTruthy();
    });

    expect(mockRequestStepUp).toHaveBeenCalledWith(
      expect.anything(),
      { type: 'enter-subpage' },
      { isResumed: true }
    );
    expect(deleteSocialIdentity).toHaveBeenCalledTimes(1);
    expect(mockRefreshUserInfo).not.toHaveBeenCalled();
    expect(mockSetToast).toHaveBeenCalledWith('Permission denied, please re-authenticate.');
  });
});
