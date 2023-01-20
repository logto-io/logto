import { waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

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
          [SearchParameters.redirectTo]: redirectUri,
          [SearchParameters.nativeCallbackLink]: callbackLink,
        }),
        replace,
      },
    });
    /* eslint-enable @silverhand/fp/no-mutating-methods */

    renderWithPageContext(
      <SettingsProvider>
        <MemoryRouter initialEntries={['/social/landing/github']}>
          <Routes>
            <Route path="/social/landing/:connectorId" element={<SocialLanding />} />
          </Routes>
        </MemoryRouter>
      </SettingsProvider>
    );

    await waitFor(() => {
      expect(replace).toBeCalledWith(new URL(redirectUri));
    });

    expect(getCallbackLinkFromStorage('github')).toBe(callbackLink);
  });
});
