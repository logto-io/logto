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

  it('Should set session storage and redirect', async () => {
    const callbackLink = 'logto:logto.android.com';
    const redirectUri = 'http://www.github.com';

    /* eslint-disable @silverhand/fp/no-mutating-methods */
    Object.defineProperty(window, 'location', {
      value: {
        origin,
        href: `/social/landing?`,
        search: queryStringify({
          [SearchParameters.RedirectTo]: redirectUri,
          [SearchParameters.NativeCallbackLink]: callbackLink,
        }),
        replace,
      },
    });
    /* eslint-enable @silverhand/fp/no-mutating-methods */

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
