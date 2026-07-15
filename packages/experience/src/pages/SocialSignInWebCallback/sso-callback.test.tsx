import { VerificationType, experience } from '@logto/schemas';
import { renderHook, waitFor } from '@testing-library/react';
import { HTTPError } from 'ky';
import { Route, Routes, useSearchParams } from 'react-router-dom';

import ToastProvider from '@/Providers/ToastProvider';
import UserInteractionContextProvider from '@/Providers/UserInteractionContextProvider';
import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { mockSignInExperienceSettings, mockSsoConnectors } from '@/__mocks__/logto';
import { signInWithSso } from '@/apis/experience';
import useSessionStorage, { StorageKeys } from '@/hooks/use-session-storages';
import { type SignInExperienceResponse } from '@/types';
import { generateState, storeState } from '@/utils/social-connectors';
import { storeRedirectContext } from '@/utils/social-redirect-fallback-context';

import SocialCallback from '.';

jest.mock('i18next', () => ({
  ...jest.requireActual('i18next'),
  language: 'en',
}));

jest.mock('@/apis/experience', () => ({
  verifySocialVerification: jest.fn().mockResolvedValue({ verificationId: 'foo' }),
  identifyAndSubmitInteraction: jest.fn().mockResolvedValue({ redirectTo: `/sign-in` }),
  signInWithSso: jest.fn().mockResolvedValue({ redirectTo: `/sign-in` }),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useSearchParams: jest.fn(),
  Navigate: jest.fn(() => null),
}));

const mockUseSearchParameters = useSearchParams as jest.Mock;
const mockedNavigate = jest.fn();

jest.mock('@/hooks/use-navigate-with-preserved-search-params', () => ({
  __esModule: true,
  default: () => mockedNavigate,
  usePreserveSearchParams: () => ({
    getTo: (to: unknown) => to,
  }),
}));

const verificationIdsMap = {
  [VerificationType.Social]: 'foo',
  [VerificationType.EnterpriseSso]: 'bar',
};

const sieSettings: SignInExperienceResponse = {
  ...mockSignInExperienceSettings,
  ssoConnectors: mockSsoConnectors,
};

const createRequestError = (code: string, message: string) => {
  const response = {
    status: 401,
    statusText: 'Unauthorized',
    json: async () => ({ code, message }),
  } as unknown as Response;

  return new HTTPError(response, {} as Request, {} as never);
};

describe('SocialCallbackPage — single sign-on', () => {
  const { result } = renderHook(() => useSessionStorage());
  const { set } = result.current;

  beforeEach(() => {
    set(StorageKeys.verificationIds, verificationIdsMap);
    (signInWithSso as jest.Mock).mockClear();
    (signInWithSso as jest.Mock).mockResolvedValue({ redirectTo: `/sign-in` });
    mockedNavigate.mockClear();
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

    it('should navigate to sign-in with persistent error state when user is suspended', async () => {
      const suspendedMessage = 'This account is suspended.';
      const suspendedState = generateState();
      storeState(suspendedState, connectorId);

      (signInWithSso as jest.Mock).mockRejectedValueOnce(
        createRequestError('user.suspended', suspendedMessage)
      );

      mockUseSearchParameters.mockReturnValue([
        new URLSearchParams(`state=${suspendedState}&code=foo`),
        jest.fn(),
      ]);

      const { queryByText } = renderWithPageContext(
        <SettingsProvider settings={sieSettings}>
          <ToastProvider>
            <UserInteractionContextProvider>
              <Routes>
                <Route path="/callback/social/:connectorId" element={<SocialCallback />} />
              </Routes>
            </UserInteractionContextProvider>
          </ToastProvider>
        </SettingsProvider>,
        { initialEntries: [`/callback/social/${connectorId}`] }
      );

      await waitFor(() => {
        expect(signInWithSso).toBeCalled();
      });

      await waitFor(() => {
        expect(mockedNavigate).toHaveBeenCalledWith('/' + experience.routes.signIn, {
          state: { errorMessage: suspendedMessage },
        });
      });

      await waitFor(() => {
        expect(document.querySelector('[role="toast"]')).not.toBeNull();
        expect(queryByText(suspendedMessage)).not.toBeNull();
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
