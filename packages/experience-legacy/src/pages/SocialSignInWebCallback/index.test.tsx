import { waitFor } from '@testing-library/react';
import { Navigate, Route, Routes, useSearchParams } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { mockSsoConnectors, mockSignInExperienceSettings } from '@/__mocks__/logto';
import { socialConnectors } from '@/__mocks__/social-connectors';
import { signInWithSocial } from '@/apis/interaction';
import { singleSignOnAuthorization } from '@/apis/single-sign-on';
import { type SignInExperienceResponse } from '@/types';
import { generateState, storeState } from '@/utils/social-connectors';

import SocialCallback from '.';

jest.mock('i18next', () => ({
  ...jest.requireActual('i18next'),
  language: 'en',
}));

jest.mock('@/apis/interaction', () => ({
  signInWithSocial: jest.fn().mockResolvedValue({ redirectTo: `/sign-in` }),
}));

jest.mock('@/apis/single-sign-on', () => ({
  singleSignOnAuthorization: jest.fn().mockResolvedValue({ redirectTo: `/sign-in` }),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useSearchParams: jest.fn(),
  Navigate: jest.fn(() => null),
}));

const mockUseSearchParameters = useSearchParams as jest.Mock;
const mockNavigate = Navigate as jest.Mock;

describe('SocialCallbackPage with code', () => {
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
        expect(signInWithSocial).not.toBeCalled();
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
          <Routes>
            <Route path="/callback/social/:connectorId" element={<SocialCallback />} />
          </Routes>
        </SettingsProvider>,
        { initialEntries: [`/callback/social/${connectorId}`] }
      );

      await waitFor(() => {
        expect(signInWithSocial).toBeCalled();
      });
    });

    it('callback with invalid state should not call signInWithSocial', async () => {
      (signInWithSocial as jest.Mock).mockClear();

      mockUseSearchParameters.mockReturnValue([
        new URLSearchParams(`state=bar&code=foo`),
        jest.fn(),
      ]);

      renderWithPageContext(
        <SettingsProvider>
          <Routes>
            <Route path="/callback/social/:connectorId" element={<SocialCallback />} />
          </Routes>
        </SettingsProvider>,
        { initialEntries: [`/callback/social/${connectorId}`] }
      );

      await waitFor(() => {
        expect(signInWithSocial).not.toBeCalled();
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
          <Routes>
            <Route path="/callback/social/:connectorId" element={<SocialCallback />} />
          </Routes>
        </SettingsProvider>,
        { initialEntries: [`/callback/social/${connectorId}`] }
      );

      await waitFor(() => {
        expect(singleSignOnAuthorization).toBeCalled();
      });
    });

    it('callback with invalid state should not call singleSignOnAuthorization', async () => {
      (singleSignOnAuthorization as jest.Mock).mockClear();

      mockUseSearchParameters.mockReturnValue([
        new URLSearchParams(`state=bar&code=foo`),
        jest.fn(),
      ]);

      renderWithPageContext(
        <SettingsProvider settings={sieSettings}>
          <Routes>
            <Route path="/callback/social/:connectorId" element={<SocialCallback />} />
          </Routes>
        </SettingsProvider>,
        { initialEntries: [`/callback/social/${connectorId}`] }
      );

      await waitFor(() => {
        expect(singleSignOnAuthorization).not.toBeCalled();
      });
    });
  });
});
