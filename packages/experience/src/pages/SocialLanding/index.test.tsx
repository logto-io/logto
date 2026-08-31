import { waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { SearchParameters } from '@/types';
import { queryStringify } from '@/utils';
import { getCallbackLinkFromStorage } from '@/utils/social-connectors';

import SocialLanding from '.';

const setToast = jest.fn();

jest.mock('@/hooks/use-toast', () => ({
  __esModule: true,
  default: () => ({ setToast }),
}));

describe(`SocialLanding Page`, () => {
  const replace = jest.fn();
  const callbackLink = 'logto:logto.android.com';
  const redirectUri = 'http://www.github.com';
  const originalLocation = window.location;

  const mockLocation = (search: Record<string, string>) => {
    /* eslint-disable @silverhand/fp/no-mutating-methods */
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        origin: 'http://localhost',
        href: `/social/landing?`,
        search: queryStringify(search),
        replace,
      },
    });
    /* eslint-enable @silverhand/fp/no-mutating-methods */
  };

  const renderPage = () =>
    renderWithPageContext(
      <SettingsProvider>
        <Routes>
          <Route path="/social/landing/:connectorId" element={<SocialLanding />} />
        </Routes>
      </SettingsProvider>,
      { initialEntries: ['/social/landing/github'] }
    );

  beforeEach(() => {
    replace.mockClear();
    setToast.mockClear();
    sessionStorage.clear();
  });

  afterAll(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    Object.defineProperty(window, 'location', {
      value: originalLocation,
    });
  });

  it('Should set session storage and redirect', async () => {
    mockLocation({
      [SearchParameters.RedirectTo]: redirectUri,
      [SearchParameters.NativeCallbackLink]: callbackLink,
    });

    renderPage();

    await waitFor(() => {
      expect(replace).toBeCalledWith(new URL(redirectUri));
    });

    expect(getCallbackLinkFromStorage('github')).toBe(callbackLink);
  });

  it('does not store a web-scheme callback link but still redirects', async () => {
    mockLocation({
      [SearchParameters.RedirectTo]: redirectUri,
      [SearchParameters.NativeCallbackLink]: 'https://attacker.example',
    });

    renderPage();

    await waitFor(() => {
      expect(replace).toBeCalledWith(new URL(redirectUri));
    });

    expect(getCallbackLinkFromStorage('github')).toBeNull();
  });

  it('does not redirect to a script-capable scheme', async () => {
    mockLocation({
      // eslint-disable-next-line no-script-url -- payload under test
      [SearchParameters.RedirectTo]: 'javascript:alert(1)',
      [SearchParameters.NativeCallbackLink]: callbackLink,
    });

    renderPage();

    await waitFor(() => {
      expect(setToast).toBeCalledWith('error.invalid_connector_request');
    });

    expect(replace).not.toBeCalled();
    expect(getCallbackLinkFromStorage('github')).toBeNull();
  });
});
