import { AgreeToTermsPolicy, type RequestErrorBody, VerificationType } from '@logto/schemas';
import { fireEvent, renderHook, waitFor } from '@testing-library/react';
import { HTTPError } from 'ky';
import { Route, Routes, useSearchParams } from 'react-router-dom';

import ConfirmModalProvider from '@/Providers/ConfirmModalProvider';
import UserInteractionContextProvider from '@/Providers/UserInteractionContextProvider';
import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { mockSignInExperienceSettings, mockSsoConnectors } from '@/__mocks__/logto';
import { registerWithVerifiedIdentifier, signInWithSso } from '@/apis/experience';
import useSessionStorage, { StorageKeys } from '@/hooks/use-session-storages';
import { type SignInExperienceResponse } from '@/types';
import { generateState, storeState } from '@/utils/social-connectors';
import { storeRedirectContext } from '@/utils/social-redirect-fallback-context';

import SocialCallback from '.';

const mockRedirectTo = jest.fn();

function mockUseGlobalRedirectTo() {
  return mockRedirectTo;
}

jest.mock('i18next', () => ({
  ...jest.requireActual('i18next'),
  language: 'en',
}));

jest.mock('@/apis/experience', () => ({
  verifySocialVerification: jest.fn().mockResolvedValue({ verificationId: 'foo' }),
  identifyAndSubmitInteraction: jest.fn().mockResolvedValue({ redirectTo: `/sign-in` }),
  registerWithVerifiedIdentifier: jest.fn().mockResolvedValue({ redirectTo: `/sign-in` }),
  signInWithSso: jest.fn().mockResolvedValue({ redirectTo: `/sign-in` }),
}));

jest.mock('@/hooks/use-global-redirect-to', () => ({
  __esModule: true,
  default: mockUseGlobalRedirectTo,
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useSearchParams: jest.fn(),
  Navigate: jest.fn(() => null),
}));

const mockUseSearchParameters = useSearchParams as jest.Mock;
const mockedRegisterWithVerifiedIdentifier = registerWithVerifiedIdentifier as jest.MockedFunction<
  typeof registerWithVerifiedIdentifier
>;
const mockedSignInWithSso = signInWithSso as jest.MockedFunction<typeof signInWithSso>;

const verificationIdsMap = {
  [VerificationType.Social]: 'foo',
  [VerificationType.EnterpriseSso]: 'bar',
};

const sieSettings: SignInExperienceResponse = {
  ...mockSignInExperienceSettings,
  ssoConnectors: mockSsoConnectors,
};

const createRequestError = (body: RequestErrorBody) => {
  const response = {
    status: 400,
    statusText: 'Bad Request',
    json: async () => body,
  } as unknown as Response;

  return new HTTPError(response, {} as Request, {} as never);
};

describe('SocialCallbackPage — single sign-on', () => {
  const { result } = renderHook(() => useSessionStorage());
  const { set } = result.current;

  beforeAll(() => {
    set(StorageKeys.verificationIds, verificationIdsMap);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockedRegisterWithVerifiedIdentifier.mockResolvedValue({ redirectTo: `/sign-in` });
    mockedSignInWithSso.mockResolvedValue({ redirectTo: `/sign-in` });
  });

  describe('normal path', () => {
    const connectorId = mockSsoConnectors[0]!.id;
    const state = generateState();
    storeState(state, connectorId);

    it('callback validation and single sign on', async () => {
      mockUseSearchParameters.mockReturnValue([
        new URLSearchParams(`state=${state}&code=foo`),
        jest.fn(),
      ]);

      renderWithPageContext(
        <SettingsProvider settings={sieSettings}>
          <UserInteractionContextProvider>
            <Routes>
              <Route path="/callback/social/:connectorId" element={<SocialCallback />} />
            </Routes>
          </UserInteractionContextProvider>
        </SettingsProvider>,
        { initialEntries: [`/callback/social/${connectorId}`] }
      );

      await waitFor(() => {
        expect(signInWithSso).toBeCalled();
      });
    });

    it('callback with invalid state should not call signInWithSso', async () => {
      mockUseSearchParameters.mockReturnValue([
        new URLSearchParams(`state=bar&code=foo`),
        jest.fn(),
      ]);

      renderWithPageContext(
        <SettingsProvider settings={sieSettings}>
          <UserInteractionContextProvider>
            <Routes>
              <Route path="/callback/social/:connectorId" element={<SocialCallback />} />
            </Routes>
          </UserInteractionContextProvider>
        </SettingsProvider>,
        { initialEntries: [`/callback/social/${connectorId}`] }
      );

      await waitFor(() => {
        expect(signInWithSso).not.toBeCalled();
      });
    });

    it('should redirect to the Logto sign-in page after blocked single sign-on registration', async () => {
      const state = generateState();
      storeState(state, connectorId);

      mockUseSearchParameters.mockReturnValue([
        new URLSearchParams(`state=${state}&code=foo`),
        jest.fn(),
      ]);
      mockedSignInWithSso.mockRejectedValueOnce(
        createRequestError({
          code: 'user.sso_identity_not_exist',
          message: 'SSO identity does not exist.',
          data: undefined,
        })
      );
      mockedRegisterWithVerifiedIdentifier.mockRejectedValueOnce(
        createRequestError({
          code: 'session.email_blocklist.email_not_allowed',
          message: 'Email is blocked.',
          data: undefined,
        })
      );

      const { findByText, getByText } = renderWithPageContext(
        <SettingsProvider
          settings={{
            ...sieSettings,
            agreeToTermsPolicy: AgreeToTermsPolicy.Automatic,
          }}
        >
          <ConfirmModalProvider>
            <UserInteractionContextProvider>
              <Routes>
                <Route path="/callback/social/:connectorId" element={<SocialCallback />} />
                <Route path="/sign-in" element={<div>Sign in page</div>} />
              </Routes>
            </UserInteractionContextProvider>
          </ConfirmModalProvider>
        </SettingsProvider>,
        {
          initialEntries: ['/provider/continue', `/callback/social/${connectorId}`],
          initialIndex: 1,
        }
      );

      expect(await findByText('Email is blocked.')).not.toBeNull();

      fireEvent.click(getByText('action.got_it'));

      await waitFor(() => {
        expect(getByText('Sign in page')).not.toBeNull();
      });
    });
  });

  describe('fallback path', () => {
    const connectorId = mockSsoConnectors[0]!.id;

    afterEach(() => {
      localStorage.clear();
    });

    it('should recover from localStorage fallback when sessionStorage is lost', async () => {
      const state = generateState();

      storeRedirectContext({
        state,
        flow: 'sso',
        connectorId,
        verificationId: 'fallback-sso-verification-id',
      });

      mockUseSearchParameters.mockReturnValue([
        new URLSearchParams(`state=${state}&code=foo`),
        jest.fn(),
      ]);

      renderWithPageContext(
        <SettingsProvider settings={sieSettings}>
          <UserInteractionContextProvider>
            <Routes>
              <Route path="/callback/social/:connectorId" element={<SocialCallback />} />
            </Routes>
          </UserInteractionContextProvider>
        </SettingsProvider>,
        { initialEntries: [`/callback/social/${connectorId}`] }
      );

      await waitFor(() => {
        expect(signInWithSso).toBeCalled();
      });
    });

    it('should show error when session lost and no fallback exists', async () => {
      const state = generateState();

      mockUseSearchParameters.mockReturnValue([
        new URLSearchParams(`state=${state}&code=foo`),
        jest.fn(),
      ]);

      renderWithPageContext(
        <SettingsProvider settings={sieSettings}>
          <UserInteractionContextProvider>
            <Routes>
              <Route path="/callback/social/:connectorId" element={<SocialCallback />} />
            </Routes>
          </UserInteractionContextProvider>
        </SettingsProvider>,
        { initialEntries: [`/callback/social/${connectorId}`] }
      );

      await waitFor(() => {
        expect(signInWithSso).not.toBeCalled();
      });
    });
  });
});
