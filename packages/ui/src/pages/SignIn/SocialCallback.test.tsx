import { waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import * as socialSignInApi from '@/apis/social';
import { generateState, storeState } from '@/hooks/utils';

import SocialCallback from './SocialCallback';

describe('SocialCallbackPage', () => {
  const signInWithSocialSpy = jest
    .spyOn(socialSignInApi, 'signInWithSocial')
    .mockResolvedValue({ redirectTo: `/sign-in` });

  it('callback validation and signIn with social', async () => {
    const state = generateState();
    storeState(state, 'github');

    /* eslint-disable @silverhand/fp/no-mutating-methods */
    Object.defineProperty(window, 'location', {
      value: {
        href: `/sign-in/callback?state=${state}&code=foo`,
        search: `?state=${state}&code=foo`,
        pathname: '/sign-in/callback',
        assign: jest.fn(),
      },
    });
    /* eslint-enable @silverhand/fp/no-mutating-methods */

    renderWithPageContext(
      <SettingsProvider>
        <MemoryRouter initialEntries={['/sign-in/callback/github']}>
          <Routes>
            <Route path="/sign-in/callback/:connector" element={<SocialCallback />} />
          </Routes>
        </MemoryRouter>
      </SettingsProvider>
    );

    await waitFor(() => {
      expect(signInWithSocialSpy).toBeCalled();
    });
  });
});
