import { waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { SearchParameters } from '@/types';
import { queryStringify } from '@/utils';
import { getCallbackLinkFromStorage } from '@/utils/social-connectors';

import SocialLanding from '.';

describe(`SocialLanding Page`, () => {
  const replace = jest.fn();
  const callbackLink = 'logto:logto.android.com';
  const redirectUri = 'http://www.github.com';
  const originalLocation = window.location;

  beforeAll(() => {
    /* eslint-disable @silverhand/fp/no-mutating-methods */
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'http://localhost',
        href: `/social/landing?`,
        search: queryStringify({
          [SearchParameters.RedirectTo]: redirectUri,
          [SearchParameters.NativeCallbackLink]: callbackLink,
        }),
        replace,
      },
    });
    /* eslint-enable @silverhand/fp/no-mutating-methods */
  });

  afterAll(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    Object.defineProperty(window, 'location', {
      value: originalLocation,
    });
  });

  it('Should set session storage and redirect', async () => {
    renderWithPageContext(
      <SettingsProvider>
        <Routes>
          <Route path="/social/landing/:connectorId" element={<SocialLanding />} />
        </Routes>
      </SettingsProvider>,
      { initialEntries: ['/social/landing/github'] }
    );

    await waitFor(() => {
      expect(replace).toBeCalledWith(new URL(redirectUri));
    });

    expect(getCallbackLinkFromStorage('github')).toBe(callbackLink);
  });
});
