import { fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { socialConnectors, mockSignInExperienceSettings } from '@/__mocks__/logto';
import * as socialSignInApi from '@/apis/social';
import { generateState, storeState } from '@/hooks/utils';

import SecondarySocialSignIn, { defaultSize } from './SecondarySocialSignIn';

describe('SecondarySocialSignIn', () => {
  const mockOrigin = 'https://logto.dev';

  const invokeSocialSignInSpy = jest
    .spyOn(socialSignInApi, 'invokeSocialSignIn')
    .mockResolvedValue({ redirectTo: `${mockOrigin}/callback` });

  const signInWithSocialSpy = jest
    .spyOn(socialSignInApi, 'signInWithSocial')
    .mockResolvedValue({ redirectTo: `${mockOrigin}/callback` });

  beforeEach(() => {
    /* eslint-disable @silverhand/fp/no-mutation */
    // @ts-expect-error mock global object
    globalThis.logtoNativeSdk = {
      platform: 'web',
      getPostMessage: jest.fn(() => jest.fn()),
      callbackLink: '/logto:',
      supportedSocialConnectorTargets: socialConnectors.map(({ id }) => id),
    };
    /* eslint-enable @silverhand/fp/no-mutation */
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('less than four connectors', () => {
    const { container } = renderWithPageContext(
      <SettingsProvider
        settings={{
          ...mockSignInExperienceSettings,
          socialConnectors: socialConnectors.slice(0, defaultSize - 1),
        }}
      >
        <MemoryRouter>
          <SecondarySocialSignIn />
        </MemoryRouter>
      </SettingsProvider>
    );
    expect(container.querySelectorAll('button')).toHaveLength(defaultSize - 1);
  });

  it('more than four connectors', () => {
    const { container } = renderWithPageContext(
      <SettingsProvider>
        <MemoryRouter>
          <SecondarySocialSignIn />
        </MemoryRouter>
      </SettingsProvider>
    );
    expect(container.querySelectorAll('button')).toHaveLength(defaultSize); // Plus Expand button
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('invoke web social signIn', async () => {
    const connectors = socialConnectors.slice(0, 1);

    const { container } = renderWithPageContext(
      <SettingsProvider
        settings={{
          ...mockSignInExperienceSettings,
          termsOfUse: { enabled: false },
          socialConnectors: connectors,
        }}
      >
        <MemoryRouter>
          <SecondarySocialSignIn />
        </MemoryRouter>
      </SettingsProvider>
    );
    const socialButton = container.querySelector('button');

    if (socialButton) {
      await waitFor(() => {
        fireEvent.click(socialButton);
      });

      expect(invokeSocialSignInSpy).toBeCalled();
    }
  });

  it('invoke native social signIn', async () => {
    /* eslint-disable @silverhand/fp/no-mutation */
    // @ts-expect-error mock global object
    logtoNativeSdk.platform = 'ios';
    /* eslint-enable @silverhand/fp/no-mutation */

    const connectors = socialConnectors.slice(0, 1);
    const { container } = renderWithPageContext(
      <SettingsProvider
        settings={{
          ...mockSignInExperienceSettings,
          termsOfUse: { enabled: false },
          socialConnectors: connectors,
        }}
      >
        <MemoryRouter>
          <SecondarySocialSignIn />
        </MemoryRouter>
      </SettingsProvider>
    );
    const socialButton = container.querySelector('button');

    if (socialButton) {
      await waitFor(() => {
        fireEvent.click(socialButton);
      });

      expect(invokeSocialSignInSpy).toBeCalled();
      expect(logtoNativeSdk?.getPostMessage).toBeCalled();
    }
  });

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
            <Route path="/sign-in/callback/:connector" element={<SecondarySocialSignIn />} />
          </Routes>
        </MemoryRouter>
      </SettingsProvider>
    );

    await waitFor(() => {
      expect(signInWithSocialSpy).toBeCalled();
    });
  });
});
