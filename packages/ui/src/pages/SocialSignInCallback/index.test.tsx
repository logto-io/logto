import { waitFor, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import * as socialSignInApi from '@/apis/social';
import { generateState, storeState } from '@/utils/social-connectors';

import SocialCallback from '.';

const origin = 'http://localhost:3000';

describe('SocialCallbackPage with code', () => {
  const signInWithSocialSpy = jest
    .spyOn(socialSignInApi, 'signInWithSocial')
    .mockResolvedValue({ redirectTo: `/sign-in` });

  it('callback validation and signIn with social', async () => {
    const state = generateState();
    storeState(state, 'github');

    /* eslint-disable @silverhand/fp/no-mutating-methods */
    Object.defineProperty(window, 'location', {
      value: {
        origin,
        href: `/sign-in/social/github?state=${state}&code=foo`,
        search: `?state=${state}&code=foo`,
        pathname: '/sign-in/social',
        replace: jest.fn(),
      },
    });
    /* eslint-enable @silverhand/fp/no-mutating-methods */

    renderWithPageContext(
      <SettingsProvider>
        <MemoryRouter initialEntries={['/sign-in/social/github']}>
          <Routes>
            <Route path="/sign-in/social/:connector" element={<SocialCallback />} />
          </Routes>
        </MemoryRouter>
      </SettingsProvider>
    );

    await act(async () => {
      await waitFor(() => {
        expect(signInWithSocialSpy).toBeCalled();
      });
    });
  });
});
