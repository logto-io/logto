import { AccountCenterControlValue, ConnectorPlatform, type AccountCenter } from '@logto/schemas';
import { waitFor } from '@testing-library/react';
import { HTTPError, type NormalizedOptions } from 'ky';
import { Route, Routes } from 'react-router-dom';

import type { PageContextType } from '@ac/Providers/PageContextProvider/PageContext';
import renderWithPageContext, {
  mockAccountCenterSettings,
  mockSignInExperienceSettings,
  mockUserInfo,
} from '@ac/__mocks__/RenderWithPageContext';
import {
  linkSocialIdentity,
  replaceSocialIdentity,
  verifySocialVerification,
} from '@ac/apis/social';
import {
  getSocialAddRoute,
  getSocialCallbackRoute,
  getSocialChangeRoute,
  securityRoute,
  socialSuccessRoute,
} from '@ac/constants/routes';
import { accountStorage } from '@ac/utils/session-storage';

import SocialCallback from '.';

const mockGetAccessToken = jest.fn().mockResolvedValue('access-token');

jest.mock('@logto/react', () => ({
  useLogto: () => ({
    getAccessToken: mockGetAccessToken,
  }),
}));

jest.mock('@ac/apis/social', () => ({
  verifySocialVerification: jest.fn(),
  linkSocialIdentity: jest.fn(),
  replaceSocialIdentity: jest.fn(),
}));

const connectorId = 'google-web';
const mockState = 'mock-state-value';

const googleConnector = {
  id: connectorId,
  target: 'google',
  platform: ConnectorPlatform.Web,
  name: { en: 'Google' },
  logo: 'https://example.com/google.svg',
  logoDark: 'https://example.com/google-dark.svg',
};

const createHttpError = (code: string, status: number, message = code) =>
  new HTTPError(
    {
      status,
      json: async () => ({ code, message }),
    } as Response,
    {} as Request,
    {} as NormalizedOptions
  );

type SocialCallbackRenderOptions = {
  readonly pageContext?: Omit<Partial<PageContextType>, 'accountCenterSettings'> & {
    readonly accountCenterSettings?: Omit<Partial<AccountCenter>, 'fields'> & {
      readonly fields?: Partial<AccountCenter['fields']>;
    };
  };
  readonly searchParams?: string;
};

const renderSocialCallback = ({
  pageContext,
  searchParams = `?state=${mockState}&code=auth-code`,
}: SocialCallbackRenderOptions = {}) =>
  renderWithPageContext(
    <Routes>
      <Route path={getSocialCallbackRoute(':connectorId')} element={<SocialCallback />} />
      <Route path={securityRoute} element={<div>Security page</div>} />
      <Route path={socialSuccessRoute} element={<div>Social success page</div>} />
      <Route path={getSocialAddRoute(':connectorId')} element={<div>Social add page</div>} />
      <Route
        path={`${getSocialChangeRoute(':connectorId')}`}
        element={<div>Social change page</div>}
      />
    </Routes>,
    {
      initialEntries: [`${getSocialCallbackRoute(connectorId)}${searchParams}`],
      future: {
        v7_relativeSplatPath: true,
        v7_startTransition: true,
      },
    },
    {
      pageContext: {
        ...pageContext,
        accountCenterSettings: {
          ...mockAccountCenterSettings,
          ...pageContext?.accountCenterSettings,
          fields: {
            ...mockAccountCenterSettings.fields,
            ...pageContext?.accountCenterSettings?.fields,
          },
        },
        experienceSettings: {
          ...mockSignInExperienceSettings,
          socialConnectors: [googleConnector],
          ...pageContext?.experienceSettings,
        },
        userInfo: {
          ...mockUserInfo,
          identities: {},
          ...pageContext?.userInfo,
        },
        verificationId:
          pageContext && 'verificationId' in pageContext
            ? pageContext.verificationId
            : 'identity-verification-record-id',
      },
    }
  );

describe('<SocialCallback />', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockGetAccessToken.mockResolvedValue('access-token');
    jest.mocked(verifySocialVerification).mockResolvedValue({
      verificationRecordId: 'verified-social-record-id',
    });
    jest.mocked(linkSocialIdentity).mockResolvedValue(undefined);
    jest.mocked(replaceSocialIdentity).mockResolvedValue(undefined);
    window.sessionStorage.clear();
  });

  describe('error states', () => {
    it('shows an error page when social editing is disabled', () => {
      const { getByText } = renderSocialCallback({
        pageContext: {
          verificationId: undefined,
          accountCenterSettings: {
            fields: {
              social: AccountCenterControlValue.ReadOnly,
            },
          },
        },
      });

      expect(getByText('error.feature_not_enabled')).toBeTruthy();
    });

    it('shows an error page when account center is disabled', () => {
      const { getByText } = renderSocialCallback({
        pageContext: {
          verificationId: undefined,
          accountCenterSettings: {
            enabled: false,
          },
        },
      });

      expect(getByText('error.feature_not_enabled')).toBeTruthy();
    });

    it('shows an error page when the connector is not found', () => {
      const { getByText } = renderSocialCallback({
        pageContext: {
          experienceSettings: {
            ...mockSignInExperienceSettings,
            socialConnectors: [],
          },
        },
      });

      expect(getByText('account_center.social.not_enabled')).toBeTruthy();
    });

    it('shows error toast when no pending social flow record exists', async () => {
      const setToast = jest.fn();

      const { getByText } = renderSocialCallback({
        pageContext: { setToast },
      });

      await waitFor(() => {
        expect(setToast).toHaveBeenCalledWith('error.invalid_session');
        expect(getByText('Security page')).toBeTruthy();
      });
    });

    it('shows error toast when state does not match', async () => {
      const setToast = jest.fn();

      accountStorage.socialFlow.setPending(connectorId, {
        verificationRecordId: 'social-verification-record-id',
        expiresAt: new Date(Date.now() + 600_000).toISOString(),
        state: 'different-state',
        mode: 'add',
      });

      const { getByText } = renderSocialCallback({
        pageContext: { setToast },
      });

      await waitFor(() => {
        expect(setToast).toHaveBeenCalledWith('error.invalid_connector_auth');
        expect(getByText('Security page')).toBeTruthy();
      });
    });
  });

  describe('add flow callback', () => {
    beforeEach(() => {
      accountStorage.socialFlow.setPending(connectorId, {
        verificationRecordId: 'social-verification-record-id',
        expiresAt: new Date(Date.now() + 600_000).toISOString(),
        state: mockState,
        mode: 'add',
      });
    });

    it('verifies social callback and links identity', async () => {
      const refreshUserInfo = jest.fn().mockResolvedValue(undefined);

      const { getByText } = renderSocialCallback({
        pageContext: { refreshUserInfo },
      });

      await waitFor(() => {
        expect(verifySocialVerification).toHaveBeenCalledWith('access-token', {
          verificationRecordId: 'social-verification-record-id',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          connectorData: expect.objectContaining({
            state: mockState,
            code: 'auth-code',
          }),
        });
      });

      await waitFor(() => {
        expect(linkSocialIdentity).toHaveBeenCalledWith(
          'access-token',
          'identity-verification-record-id',
          'social-verification-record-id'
        );
      });

      await waitFor(() => {
        expect(refreshUserInfo).toHaveBeenCalled();
        expect(getByText('Social success page')).toBeTruthy();
      });
    });

    it('sets social flow to verified status after successful verification', async () => {
      renderSocialCallback();

      await waitFor(() => {
        expect(verifySocialVerification).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(linkSocialIdentity).toHaveBeenCalled();
      });
    });

    it('handles verify error with toast and navigates to security', async () => {
      const setToast = jest.fn();
      jest
        .mocked(verifySocialVerification)
        .mockRejectedValue(createHttpError('session.not_found', 401, 'Session expired'));

      const { getByText } = renderSocialCallback({
        pageContext: { setToast },
      });

      await waitFor(() => {
        expect(setToast).toHaveBeenCalledWith('Session expired');
        expect(getByText('Security page')).toBeTruthy();
      });
    });

    it('handles link error user.social_account_exists_in_profile', async () => {
      const setToast = jest.fn();
      jest
        .mocked(linkSocialIdentity)
        .mockRejectedValue(
          createHttpError(
            'user.social_account_exists_in_profile',
            422,
            'Social account already exists'
          )
        );

      const { getByText } = renderSocialCallback({
        pageContext: { setToast },
      });

      await waitFor(() => {
        expect(setToast).toHaveBeenCalledWith('Social account already exists');
        expect(getByText('Security page')).toBeTruthy();
      });
    });

    it('resets verification when permission denied on link', async () => {
      const refreshUserInfo = jest.fn().mockResolvedValue(undefined);
      const setVerificationId = jest.fn();
      const setToast = jest.fn();

      jest
        .mocked(linkSocialIdentity)
        .mockRejectedValue(createHttpError('verification_record.permission_denied', 401));

      renderSocialCallback({
        pageContext: { refreshUserInfo, setVerificationId, setToast },
      });

      await waitFor(() => {
        expect(refreshUserInfo).toHaveBeenCalled();
        expect(setVerificationId).toHaveBeenCalledWith(undefined);
        expect(setToast).toHaveBeenCalledWith('account_center.verification.verification_required');
      });
    });
  });

  describe('change flow callback', () => {
    beforeEach(() => {
      accountStorage.socialFlow.setPending(connectorId, {
        verificationRecordId: 'social-verification-record-id',
        expiresAt: new Date(Date.now() + 600_000).toISOString(),
        state: mockState,
        mode: 'change',
      });
    });

    it('verifies social callback and replaces identity', async () => {
      const refreshUserInfo = jest.fn().mockResolvedValue(undefined);

      const { getByText } = renderSocialCallback({
        pageContext: {
          refreshUserInfo,
          userInfo: {
            identities: {
              google: {
                userId: 'google-user-id',
                details: {},
              },
            },
          },
        },
      });

      await waitFor(() => {
        expect(verifySocialVerification).toHaveBeenCalledWith('access-token', {
          verificationRecordId: 'social-verification-record-id',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          connectorData: expect.objectContaining({
            state: mockState,
            code: 'auth-code',
          }),
        });
      });

      await waitFor(() => {
        expect(replaceSocialIdentity).toHaveBeenCalledWith(
          'access-token',
          'identity-verification-record-id',
          'social-verification-record-id'
        );
      });

      await waitFor(() => {
        expect(refreshUserInfo).toHaveBeenCalled();
        expect(getByText('Social success page')).toBeTruthy();
      });
    });

    it('resets verification when permission denied during change flow', async () => {
      const refreshUserInfo = jest.fn().mockResolvedValue(undefined);
      const setVerificationId = jest.fn();
      const setToast = jest.fn();

      jest
        .mocked(replaceSocialIdentity)
        .mockRejectedValue(createHttpError('verification_record.permission_denied', 401));

      renderSocialCallback({
        pageContext: {
          refreshUserInfo,
          setVerificationId,
          setToast,
          userInfo: {
            identities: {
              google: {
                userId: 'google-user-id',
                details: {},
              },
            },
          },
        },
      });

      await waitFor(() => {
        expect(refreshUserInfo).toHaveBeenCalled();
        expect(setVerificationId).toHaveBeenCalledWith(undefined);
        expect(setToast).toHaveBeenCalledWith('account_center.verification.verification_required');
      });
    });

    it('handles replace error with toast and navigates to security', async () => {
      const setToast = jest.fn();
      jest
        .mocked(replaceSocialIdentity)
        .mockRejectedValue(createHttpError('session.not_found', 401, 'Session expired'));

      const { getByText } = renderSocialCallback({
        pageContext: {
          setToast,
          userInfo: {
            identities: {
              google: {
                userId: 'google-user-id',
                details: {},
              },
            },
          },
        },
      });

      await waitFor(() => {
        expect(setToast).toHaveBeenCalledWith('Session expired');
        expect(getByText('Security page')).toBeTruthy();
      });
    });
  });
});
