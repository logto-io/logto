import { VerificationType } from '@logto/schemas';
import { renderHook, waitFor } from '@testing-library/react';
import { Route, Routes, useSearchParams } from 'react-router-dom';

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
  const { set } = result.current;

  beforeAll(() => {
    set(StorageKeys.verificationIds, verificationIdsMap);
  });

  beforeEach(() => {
    (signInWithSso as jest.Mock).mockClear();
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
