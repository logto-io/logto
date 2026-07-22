import { AgreeToTermsPolicy, type RequestErrorBody, VerificationType } from '@logto/schemas';
import { fireEvent, renderHook, waitFor } from '@testing-library/react';
import { HTTPError } from 'ky';
import { Navigate, Route, Routes, useSearchParams } from 'react-router-dom';

import ConfirmModalProvider from '@/Providers/ConfirmModalProvider';
import UserInteractionContextProvider from '@/Providers/UserInteractionContextProvider';
import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { mockSignInExperienceSettings } from '@/__mocks__/logto';
import { socialConnectors } from '@/__mocks__/social-connectors';
import {
  identifyAndSubmitInteraction,
  registerWithVerifiedIdentifier,
  verifySocialVerification,
} from '@/apis/experience';
import useSessionStorage, { StorageKeys } from '@/hooks/use-session-storages';
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
const mockNavigate = Navigate as jest.Mock;
const mockedVerifySocialVerification = verifySocialVerification as jest.MockedFunction<
  typeof verifySocialVerification
>;
const mockedIdentifyAndSubmitInteraction = identifyAndSubmitInteraction as jest.MockedFunction<
  typeof identifyAndSubmitInteraction
>;
const mockedRegisterWithVerifiedIdentifier = registerWithVerifiedIdentifier as jest.MockedFunction<
  typeof registerWithVerifiedIdentifier
>;

const verificationIdsMap = {
  [VerificationType.Social]: 'foo',
  [VerificationType.EnterpriseSso]: 'bar',
};

const createRequestError = (body: RequestErrorBody) => {
  const response = {
    status: 400,
    statusText: 'Bad Request',
    json: async () => body,
  } as unknown as Response;

  return new HTTPError(response, {} as Request, {} as never);
};

describe('SocialCallbackPage — social sign-in', () => {
  const { result } = renderHook(() => useSessionStorage());
  const { set } = result.current;

  beforeAll(() => {
    set(StorageKeys.verificationIds, verificationIdsMap);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockedVerifySocialVerification.mockResolvedValue({ verificationId: 'foo' });
    mockedIdentifyAndSubmitInteraction.mockResolvedValue({ redirectTo: `/sign-in` });
    mockedRegisterWithVerifiedIdentifier.mockResolvedValue({ redirectTo: `/sign-in` });
  });

  describe('fallback', () => {
    it('should redirect to /sign-in if connectorId is not found', async () => {
      mockUseSearchParameters.mockReturnValue([new URLSearchParams('code=foo'), jest.fn()]);

      renderWithPageContext(
        <SettingsProvider>
          <Routes>
            <Route path="/callback/social/:connectorId" element={<SocialCallback />} />
          </Routes>
        </SettingsProvider>,
        { initialEntries: ['/callback/social/invalid'] }
      );

      await waitFor(() => {
        expect(verifySocialVerification).not.toBeCalled();
        expect(mockNavigate.mock.calls[0][0].to).toBe('/sign-in');
      });
    });
  });

  describe('normal path', () => {
    const connectorId = socialConnectors[0]!.id;
    const state = generateState();
    storeState(state, connectorId);

    it('callback validation and signIn with social', async () => {
      mockUseSearchParameters.mockReturnValue([
        new URLSearchParams(`state=${state}&code=foo`),
        jest.fn(),
      ]);

      renderWithPageContext(
        <SettingsProvider>
          <UserInteractionContextProvider>
            <Routes>
              <Route path="/callback/social/:connectorId" element={<SocialCallback />} />
            </Routes>
          </UserInteractionContextProvider>
        </SettingsProvider>,
        { initialEntries: [`/callback/social/${connectorId}`] }
      );

      await waitFor(() => {
        expect(verifySocialVerification).toBeCalled();
      });
    });

    it('callback with invalid state should not call signInWithSocial', async () => {
      mockUseSearchParameters.mockReturnValue([
        new URLSearchParams(`state=bar&code=foo`),
        jest.fn(),
      ]);

      renderWithPageContext(
        <SettingsProvider>
          <UserInteractionContextProvider>
            <Routes>
              <Route path="/callback/social/:connectorId" element={<SocialCallback />} />
            </Routes>
          </UserInteractionContextProvider>
        </SettingsProvider>,
        { initialEntries: [`/callback/social/${connectorId}`] }
      );

      await waitFor(() => {
        expect(verifySocialVerification).not.toBeCalled();
      });
    });

    it('should redirect to the Logto sign-in page after blocked social registration', async () => {
      const state = generateState();
      storeState(state, connectorId);

      mockUseSearchParameters.mockReturnValue([
        new URLSearchParams(`state=${state}&code=foo`),
        jest.fn(),
      ]);
      mockedIdentifyAndSubmitInteraction.mockRejectedValueOnce(
        createRequestError({
          code: 'user.identity_not_exist',
          message: 'User does not exist.',
          data: {},
        })
      );
      mockedRegisterWithVerifiedIdentifier.mockRejectedValueOnce(
        createRequestError({
          code: 'session.email_blocklist.email_not_allowed',
          message: 'Email is blocked.',
          data: undefined,
        })
      );

      const { getByText, findByText } = renderWithPageContext(
        <SettingsProvider
          settings={{
            ...mockSignInExperienceSettings,
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
    const connectorId = socialConnectors[0]!.id;

    afterEach(() => {
      localStorage.clear();
    });

    it('should recover from localStorage fallback when sessionStorage is lost', async () => {
      const state = generateState();

      storeRedirectContext({
        state,
        flow: 'social',
        connectorId,
        verificationId: 'fallback-verification-id',
      });

      mockUseSearchParameters.mockReturnValue([
        new URLSearchParams(`state=${state}&code=foo`),
        jest.fn(),
      ]);

      renderWithPageContext(
        <SettingsProvider>
          <UserInteractionContextProvider>
            <Routes>
              <Route path="/callback/social/:connectorId" element={<SocialCallback />} />
            </Routes>
          </UserInteractionContextProvider>
        </SettingsProvider>,
        { initialEntries: [`/callback/social/${connectorId}`] }
      );

      await waitFor(() => {
        expect(verifySocialVerification).toBeCalled();
      });
    });

    it('should show error when session lost and no fallback exists', async () => {
      const state = generateState();

      mockUseSearchParameters.mockReturnValue([
        new URLSearchParams(`state=${state}&code=foo`),
        jest.fn(),
      ]);

      renderWithPageContext(
        <SettingsProvider>
          <UserInteractionContextProvider>
            <Routes>
              <Route path="/callback/social/:connectorId" element={<SocialCallback />} />
            </Routes>
          </UserInteractionContextProvider>
        </SettingsProvider>,
        { initialEntries: [`/callback/social/${connectorId}`] }
      );

      await waitFor(() => {
        expect(verifySocialVerification).not.toBeCalled();
      });
    });

    it('should not consult fallback on state mismatch', async () => {
      const state = generateState();
      const differentState = generateState();

      storeState(differentState, connectorId);

      storeRedirectContext({
        state,
        flow: 'social',
        connectorId,
        verificationId: 'fallback-verification-id',
      });

      mockUseSearchParameters.mockReturnValue([
        new URLSearchParams(`state=${state}&code=foo`),
        jest.fn(),
      ]);

      renderWithPageContext(
        <SettingsProvider>
          <UserInteractionContextProvider>
            <Routes>
              <Route path="/callback/social/:connectorId" element={<SocialCallback />} />
            </Routes>
          </UserInteractionContextProvider>
        </SettingsProvider>,
        { initialEntries: [`/callback/social/${connectorId}`] }
      );

      await waitFor(() => {
        expect(verifySocialVerification).not.toBeCalled();
      });
    });
  });
});
