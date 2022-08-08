import { fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { socialConnectors, mockSignInExperienceSettings } from '@/__mocks__/logto';
import * as socialSignInApi from '@/apis/social';

import SecondarySocialSignIn, { defaultSize } from '.';

describe('SecondarySocialSignIn', () => {
  const mockOrigin = 'https://logto.dev';

  const invokeSocialSignInSpy = jest
    .spyOn(socialSignInApi, 'invokeSocialSignIn')
    .mockResolvedValue({ redirectTo: `${mockOrigin}/callback` });

  beforeEach(() => {
    /* eslint-disable @silverhand/fp/no-mutation */
    // @ts-expect-error mock global object
    globalThis.logtoNativeSdk = {
      platform: 'web',
      getPostMessage: jest.fn(() => jest.fn()),
      callbackLink: '/logto:',
      supportedConnector: {
        universal: true,
        nativeTargets: socialConnectors.map(({ target }) => target),
      },
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
      act(() => {
        fireEvent.click(socialButton);
      });

      void waitFor(() => {
        expect(invokeSocialSignInSpy).toBeCalled();
        expect(logtoNativeSdk?.getPostMessage).toBeCalled();
      });
    }
  });
});
