/* eslint-disable max-lines */
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
  createSocialVerification,
  deleteSocialIdentity,
  linkSocialIdentity,
  replaceSocialIdentity,
} from '@ac/apis/social';
import {
  getSocialAddRoute,
  getSocialChangeRoute,
  getSocialRemoveRoute,
  securityRoute,
  socialSuccessRoute,
} from '@ac/constants/routes';
import { accountStorage } from '@ac/utils/session-storage';

import SocialFlow from '.';

const mockGetAccessToken = jest.fn().mockResolvedValue('access-token');

jest.mock('@logto/react', () => ({
  useLogto: () => ({
    getAccessToken: mockGetAccessToken,
  }),
}));

jest.mock('@ac/apis/social', () => ({
  createSocialVerification: jest.fn(),
  deleteSocialIdentity: jest.fn(),
  linkSocialIdentity: jest.fn(),
  replaceSocialIdentity: jest.fn(),
}));

jest.mock('@ac/components/VerificationMethodList', () => () => <div>Verification methods</div>);

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

const createHttpError = (code: string, status: number, message = code) =>
  new HTTPError(
    {
      status,
      json: async () => ({ code, message }),
    } as Response,
    {} as Request,
    {} as NormalizedOptions
  );

const mockCreateSocialVerificationResult = {
  verificationRecordId: 'social-verification-record-id',
  authorizationUri: 'https://accounts.google.com/o/oauth2/auth?...',
  expiresAt: new Date(Date.now() + 600_000).toISOString(),
};

type SocialFlowRenderOptions = {
  readonly mode: 'add' | 'remove' | 'change';
  readonly pageContext?: Omit<Partial<PageContextType>, 'accountCenterSettings'> & {
    readonly accountCenterSettings?: Omit<Partial<AccountCenter>, 'fields'> & {
      readonly fields?: Partial<AccountCenter['fields']>;
    };
  };
  readonly initialEntries?: string[];
};

const renderSocialFlow = ({ mode, pageContext, initialEntries }: SocialFlowRenderOptions) => {
  const routeMap = {
    add: getSocialAddRoute(':connectorId'),
    change: `${getSocialChangeRoute(':connectorId')}`,
    remove: `${getSocialRemoveRoute(':connectorId')}`,
  };
  const entryMap = {
    add: getSocialAddRoute(connectorId),
    change: getSocialChangeRoute(connectorId),
    remove: getSocialRemoveRoute(connectorId),
  };

  return renderWithPageContext(
    <Routes>
      <Route path={routeMap[mode]} element={<SocialFlow mode={mode} />} />
      <Route path={securityRoute} element={<div>Security page</div>} />
      <Route path={socialSuccessRoute} element={<div>Social success page</div>} />
    </Routes>,
    {
      initialEntries: initialEntries ?? [entryMap[mode]],
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
};

const mockLocationAssign = jest.fn();

beforeAll(() => {
  // eslint-disable-next-line @silverhand/fp/no-mutating-methods
  Object.defineProperty(window, 'location', {
    value: { ...window.location, assign: mockLocationAssign },
    writable: true,
  });

  // eslint-disable-next-line @silverhand/fp/no-mutating-methods
  Object.defineProperty(globalThis, 'crypto', {
    value: {
      ...globalThis.crypto,
      randomUUID: () => '00000000-0000-0000-0000-000000000000',
    },
    writable: true,
  });
});

describe('<SocialFlow />', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockGetAccessToken.mockResolvedValue('access-token');
    jest.mocked(createSocialVerification).mockResolvedValue(mockCreateSocialVerificationResult);
    jest.mocked(deleteSocialIdentity).mockResolvedValue(undefined);
    jest.mocked(linkSocialIdentity).mockResolvedValue(undefined);
    jest.mocked(replaceSocialIdentity).mockResolvedValue(undefined);
    window.sessionStorage.clear();
    mockLocationAssign.mockClear();
  });

  describe('error states', () => {
    it('shows an error page when social editing is disabled', () => {
      const { getByText } = renderSocialFlow({
        mode: 'add',
        pageContext: {
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
      const { getByText } = renderSocialFlow({
        mode: 'add',
        pageContext: {
          accountCenterSettings: {
            enabled: false,
          },
        },
      });

      expect(getByText('error.feature_not_enabled')).toBeTruthy();
    });

    it('shows an error page when the connector is not found', () => {
      const { getByText } = renderSocialFlow({
        mode: 'add',
        pageContext: {
          experienceSettings: {
            ...mockSignInExperienceSettings,
            socialConnectors: [],
          },
        },
      });

      expect(getByText('account_center.social.not_enabled')).toBeTruthy();
    });

    it('shows verification methods when identity is not verified', () => {
      const { getByText } = renderSocialFlow({
        mode: 'add',
        pageContext: {
          verificationId: undefined,
          userInfo: {
            hasSecurityVerificationMethod: true,
          },
        },
      });

      expect(getByText('Verification methods')).toBeTruthy();
    });

    it('shows loading while userInfo is loading', () => {
      const { getByText } = renderSocialFlow({
        mode: 'add',
        pageContext: {
          verificationId: undefined,
          userInfo: undefined,
          isLoadingUserInfo: true,
        },
      });

      expect(getByText('Global loading')).toBeTruthy();
    });

    it('skips verification methods when user has no security verification method', async () => {
      jest.mocked(createSocialVerification).mockResolvedValue(mockCreateSocialVerificationResult);

      renderSocialFlow({
        mode: 'add',
        pageContext: {
          verificationId: undefined,
          userInfo: {
            hasPassword: false,
            primaryEmail: undefined,
            primaryPhone: undefined,
            hasSecurityVerificationMethod: false,
          },
        },
      });

      await waitFor(() => {
        expect(createSocialVerification).toHaveBeenCalled();
      });
    });
  });

  describe('add mode', () => {
    it('shows duplicate binding error when the connector is already linked', () => {
      const { getByText } = renderSocialFlow({
        mode: 'add',
        pageContext: {
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

      expect(getByText('You have already associated this social account.')).toBeTruthy();
    });

    it('creates social verification and redirects to authorization URI', async () => {
      renderSocialFlow({ mode: 'add' });

      await waitFor(() => {
        expect(createSocialVerification).toHaveBeenCalledWith(
          'access-token',

          expect.objectContaining({
            connectorId,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            state: expect.any(String),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            redirectUri: expect.stringContaining('/callback/social/google-web'),
          })
        );
        expect(mockLocationAssign).toHaveBeenCalledWith(
          mockCreateSocialVerificationResult.authorizationUri
        );
      });
    });

    it('stores pending social flow record in session storage after starting add flow', async () => {
      renderSocialFlow({ mode: 'add' });

      await waitFor(() => {
        expect(mockLocationAssign).toHaveBeenCalled();
      });

      const storedFlow = accountStorage.socialFlow.get(connectorId);
      expect(storedFlow).toMatchObject({
        status: 'pending',
        verificationRecordId: mockCreateSocialVerificationResult.verificationRecordId,
        mode: 'add',
      });
    });

    it('links social identity directly when storedSocialFlow is verified', async () => {
      const refreshUserInfo = jest.fn().mockResolvedValue(undefined);

      accountStorage.socialFlow.setVerified(connectorId, {
        verificationRecordId: 'social-verification-record-id',
        expiresAt: new Date(Date.now() + 600_000).toISOString(),
        mode: 'add',
      });

      const { getByText } = renderSocialFlow({
        mode: 'add',
        pageContext: {
          refreshUserInfo,
        },
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

    it('handles createSocialVerification API error with toast and navigates to security', async () => {
      const setToast = jest.fn();
      jest
        .mocked(createSocialVerification)
        .mockRejectedValue(createHttpError('session.not_found', 401, 'Session expired'));

      const { getByText } = renderSocialFlow({
        mode: 'add',
        pageContext: { setToast },
      });

      await waitFor(() => {
        expect(setToast).toHaveBeenCalledWith('Session expired');
        expect(getByText('Security page')).toBeTruthy();
      });
    });

    it('handles link error user.social_account_exists_in_profile', async () => {
      const setToast = jest.fn();

      accountStorage.socialFlow.setVerified(connectorId, {
        verificationRecordId: 'social-verification-record-id',
        expiresAt: new Date(Date.now() + 600_000).toISOString(),
        mode: 'add',
      });

      jest
        .mocked(linkSocialIdentity)
        .mockRejectedValue(
          createHttpError(
            'user.social_account_exists_in_profile',
            422,
            'Social account already exists'
          )
        );

      const { getByText } = renderSocialFlow({
        mode: 'add',
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

      accountStorage.socialFlow.setVerified(connectorId, {
        verificationRecordId: 'social-verification-record-id',
        expiresAt: new Date(Date.now() + 600_000).toISOString(),
        mode: 'add',
      });

      jest
        .mocked(linkSocialIdentity)
        .mockRejectedValue(createHttpError('verification_record.permission_denied', 401));

      renderSocialFlow({
        mode: 'add',
        pageContext: { refreshUserInfo, setVerificationId, setToast },
      });

      await waitFor(() => {
        expect(refreshUserInfo).toHaveBeenCalled();
        expect(setVerificationId).toHaveBeenCalledWith(undefined);
        expect(setToast).toHaveBeenCalledWith('account_center.verification.verification_required');
      });
    });
  });

  describe('remove mode', () => {
    it('removes linked social identity and navigates to success page', async () => {
      const refreshUserInfo = jest.fn().mockResolvedValue(undefined);

      const { getByText } = renderSocialFlow({
        mode: 'remove',
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
        expect(deleteSocialIdentity).toHaveBeenCalledWith(
          'access-token',
          'identity-verification-record-id',
          'google'
        );
      });

      await waitFor(() => {
        expect(refreshUserInfo).toHaveBeenCalled();
        expect(getByText('Social success page')).toBeTruthy();
      });
    });

    it('handles remove error with toast and navigates to security', async () => {
      const setToast = jest.fn();
      jest
        .mocked(deleteSocialIdentity)
        .mockRejectedValue(createHttpError('session.not_found', 401, 'Session expired'));

      const { getByText } = renderSocialFlow({
        mode: 'remove',
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

    it('resets verification when permission denied on remove', async () => {
      const refreshUserInfo = jest.fn().mockResolvedValue(undefined);
      const setVerificationId = jest.fn();
      const setToast = jest.fn();

      jest
        .mocked(deleteSocialIdentity)
        .mockRejectedValue(createHttpError('verification_record.permission_denied', 401));

      renderSocialFlow({
        mode: 'remove',
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
  });

  describe('change mode', () => {
    it('creates social verification and redirects to authorization URI for change', async () => {
      renderSocialFlow({
        mode: 'change',
        pageContext: {
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
        expect(createSocialVerification).toHaveBeenCalledWith(
          'access-token',

          expect.objectContaining({
            connectorId,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            state: expect.any(String),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            redirectUri: expect.stringContaining('/callback/social/google-web'),
          })
        );
        expect(mockLocationAssign).toHaveBeenCalledWith(
          mockCreateSocialVerificationResult.authorizationUri
        );
      });
    });

    it('stores pending social flow with change mode', async () => {
      renderSocialFlow({
        mode: 'change',
        pageContext: {
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
        expect(mockLocationAssign).toHaveBeenCalled();
      });

      const storedFlow = accountStorage.socialFlow.get(connectorId);
      expect(storedFlow).toMatchObject({
        status: 'pending',
        verificationRecordId: mockCreateSocialVerificationResult.verificationRecordId,
        mode: 'change',
      });
    });

    it('replaces social identity directly when storedSocialFlow is verified', async () => {
      const refreshUserInfo = jest.fn().mockResolvedValue(undefined);

      accountStorage.socialFlow.setVerified(connectorId, {
        verificationRecordId: 'social-verification-record-id',
        expiresAt: new Date(Date.now() + 600_000).toISOString(),
        mode: 'change',
      });

      const { getByText } = renderSocialFlow({
        mode: 'change',
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

    it('handles replace error with toast and navigates to security', async () => {
      const setToast = jest.fn();

      accountStorage.socialFlow.setVerified(connectorId, {
        verificationRecordId: 'social-verification-record-id',
        expiresAt: new Date(Date.now() + 600_000).toISOString(),
        mode: 'change',
      });

      jest
        .mocked(replaceSocialIdentity)
        .mockRejectedValue(createHttpError('session.not_found', 401, 'Session expired'));

      const { getByText } = renderSocialFlow({
        mode: 'change',
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
/* eslint-enable max-lines */
