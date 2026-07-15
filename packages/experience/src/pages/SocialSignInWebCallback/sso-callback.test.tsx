import { SignInIdentifier, VerificationType, experience } from '@logto/schemas';
import { act, renderHook, waitFor } from '@testing-library/react';
import { HTTPError } from 'ky';
import { Route, Routes, useSearchParams } from 'react-router-dom';

import ConfirmModalProvider from '@/Providers/ConfirmModalProvider';
import SingleSignOnFormModeContextProvider from '@/Providers/SingleSignOnFormModeContextProvider';
import ToastProvider from '@/Providers/ToastProvider';
import UserInteractionContextProvider from '@/Providers/UserInteractionContextProvider';
import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { mockSignInExperienceSettings, mockSsoConnectors } from '@/__mocks__/logto';
import { signInWithSso } from '@/apis/experience';
import PasswordSignInForm from '@/components/PasswordSignInForm';
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
const mockRedirectTo = jest.fn();

function mockUseGlobalRedirectTo() {
  return mockRedirectTo;
}

jest.mock('@/hooks/use-global-redirect-to', () => mockUseGlobalRedirectTo);

const verificationIdsMap = {
  [VerificationType.Social]: 'foo',
  [VerificationType.EnterpriseSso]: 'bar',
};

const sieSettings: SignInExperienceResponse = {
  ...mockSignInExperienceSettings,
  ssoConnectors: mockSsoConnectors,
};

describe('SocialCallbackPage — single sign-on', () => {
  const { result } = renderHook(() => useSessionStorage());
  const { set, remove } = result.current;

  beforeEach(() => {
    set(StorageKeys.verificationIds, verificationIdsMap);
    (signInWithSso as jest.Mock).mockClear();
    (signInWithSso as jest.Mock).mockResolvedValue({ redirectTo: `/sign-in` });
    mockRedirectTo.mockClear();
  });

  afterEach(() => {
    remove(StorageKeys.IdentifierInputValue);
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

      expect(signInWithSso).toHaveBeenCalledWith(connectorId, {
        verificationId: verificationIdsMap[VerificationType.EnterpriseSso],
        connectorData: {
          code: 'foo',
          redirectUri: `${window.location.origin}/callback/${connectorId}`,
        },
      });
      await waitFor(() => {
        expect(mockRedirectTo).toHaveBeenCalledWith('/sign-in');
      });
    });

    it('keeps the suspended user error and email in the sign-in form without a toast', async () => {
      const errorMessage = 'This account is suspended.';
      const email = 'suspended@suspended.example.com';
      const suspendedState = generateState();
      storeState(suspendedState, connectorId);
      set(StorageKeys.IdentifierInputValue, {
        type: SignInIdentifier.Email,
        value: email,
      });
      (signInWithSso as jest.Mock).mockRejectedValueOnce(
        new HTTPError(
          {
            json: async () => ({
              code: 'user.suspended',
              message: errorMessage,
            }),
          } as Response,
          {} as Request,
          {} as never
        )
      );
      mockUseSearchParameters.mockReturnValue([
        new URLSearchParams(`state=${suspendedState}&code=foo`),
        jest.fn(),
      ]);

      const { getByText, queryByRole, container } = renderWithPageContext(
        <SettingsProvider settings={sieSettings}>
          <UserInteractionContextProvider>
            <ToastProvider>
              <Routes>
                <Route path="/callback/social/:connectorId" element={<SocialCallback />} />
                <Route
                  path={`/${experience.routes.signIn}`}
                  element={
                    <ConfirmModalProvider>
                      <SingleSignOnFormModeContextProvider>
                        <PasswordSignInForm signInMethods={[SignInIdentifier.Email]} />
                      </SingleSignOnFormModeContextProvider>
                    </ConfirmModalProvider>
                  }
                />
              </Routes>
            </ToastProvider>
          </UserInteractionContextProvider>
        </SettingsProvider>,
        { initialEntries: [`/callback/social/${connectorId}`] }
      );

      await waitFor(() => {
        expect(getByText(errorMessage)).not.toBeNull();
      });

      expect(container.querySelector<HTMLInputElement>('input[name="identifier"]')?.value).toBe(
        email
      );
      expect(queryByRole('toast')).toBeNull();
      expect(mockRedirectTo).not.toHaveBeenCalled();

      jest.useFakeTimers();
      try {
        act(() => {
          jest.advanceTimersByTime(3000);
        });

        expect(getByText(errorMessage)).not.toBeNull();
        expect(container.querySelector<HTMLInputElement>('input[name="identifier"]')?.value).toBe(
          email
        );
        expect(queryByRole('toast')).toBeNull();
      } finally {
        jest.useRealTimers();
      }
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
