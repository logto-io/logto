import { VerificationType } from '@logto/schemas';
import { renderHook, waitFor } from '@testing-library/react';
import { Navigate, Route, Routes, useSearchParams } from 'react-router-dom';

import UserInteractionContextProvider from '@/Providers/UserInteractionContextProvider';
import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { mockSignInExperienceSettings, mockSsoConnectors } from '@/__mocks__/logto';
import { socialConnectors } from '@/__mocks__/social-connectors';
import { verifySocialVerification, signInWithSso } from '@/apis/experience';
import useSessionStorage, { StorageKeys } from '@/hooks/use-session-storages';
import { type SignInExperienceResponse } from '@/types';
import { generateState, storeState } from '@/utils/social-connectors';

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
const mockNavigate = Navigate as jest.Mock;

const verificationIdsMap = {
  [VerificationType.Social]: 'foo',
  [VerificationType.EnterpriseSso]: 'bar',
};

describe('SocialCallbackPage with code', () => {
  const { result } = renderHook(() => useSessionStorage());
  const { set } = result.current;

  beforeAll(() => {
    set(StorageKeys.verificationIds, verificationIdsMap);
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

  describe('signIn with social', () => {
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
      (verifySocialVerification as jest.Mock).mockClear();

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
  });

  describe('single sign-on', () => {
    const sieSettings: SignInExperienceResponse = {
      ...mockSignInExperienceSettings,
      ssoConnectors: mockSsoConnectors,
    };
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
      (signInWithSso as jest.Mock).mockClear();

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
});
