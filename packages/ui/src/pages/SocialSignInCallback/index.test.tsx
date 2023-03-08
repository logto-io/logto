import { waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useSearchParams } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { signInWithSocial } from '@/apis/interaction';
import { generateState, storeState } from '@/utils/social-connectors';

import SocialCallback from '.';

const origin = 'http://localhost:3000';

jest.mock('i18next', () => ({
  ...jest.requireActual('i18next'),
  language: 'en',
}));

jest.mock('@/apis/interaction', () => ({
  signInWithSocial: jest.fn().mockResolvedValue({ redirectTo: `/sign-in` }),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useSearchParams: jest.fn(),
}));

const mockUseSearchParameters = useSearchParams as jest.Mock;

describe('SocialCallbackPage with code', () => {
  it('callback validation and signIn with social', async () => {
    const state = generateState();
    storeState(state, 'github');

    mockUseSearchParameters.mockReturnValue([
      new URLSearchParams(`state=${state}&code=foo`),
      jest.fn(),
    ]);

    renderWithPageContext(
      <SettingsProvider>
        <MemoryRouter initialEntries={['/sign-in/social/github']}>
          <Routes>
            <Route path="/sign-in/social/:connectorId" element={<SocialCallback />} />
          </Routes>
        </MemoryRouter>
      </SettingsProvider>
    );

    await waitFor(() => {
      expect(signInWithSocial).toBeCalled();
    });
  });
});
