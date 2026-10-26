import { useLogto } from '@logto/react';
import { render, waitFor } from '@testing-library/react';

import { getAccountCenterSettings } from '@ac/apis/account-center';
import { getSignInExperienceSettings } from '@ac/apis/sign-in-experience';
import { getUserInfo } from '@ac/apis/user';

import PageContextProvider from '.';

const mockGetUserInfoRequest = jest.fn();

jest.mock('@logto/react', () => ({
  __esModule: true,
  useLogto: jest.fn(),
}));

jest.mock('@ac/hooks/use-api', () => ({
  __esModule: true,
  default: (api: unknown) => {
    if (api === getUserInfo) {
      return mockGetUserInfoRequest;
    }

    return jest.fn();
  },
}));

jest.mock('@ac/apis/account-center', () => ({
  __esModule: true,
  getAccountCenterSettings: jest.fn(),
}));

jest.mock('@ac/apis/sign-in-experience', () => ({
  __esModule: true,
  getSignInExperienceSettings: jest.fn(),
}));

jest.mock('@ac/i18n/utils', () => ({
  __esModule: true,
  changeLanguage: jest.fn(),
  getPreferredLanguage: jest.fn(() => 'en'),
}));

const setLocation = (pathname: string, search = '') => {
  // eslint-disable-next-line @silverhand/fp/no-mutating-methods
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: {
      pathname,
      search,
      origin: 'http://localhost',
    },
  });
};

describe('<PageContextProvider />', () => {
  beforeEach(() => {
    (useLogto as jest.Mock).mockReturnValue({ isAuthenticated: true });
    mockGetUserInfoRequest.mockResolvedValue([undefined, { id: 'user-1' }]);
    (getSignInExperienceSettings as jest.Mock).mockResolvedValue({
      color: { isDarkModeEnabled: false },
      languageInfo: { autoDetect: true, fallbackLanguage: 'en' },
    });
    (getAccountCenterSettings as jest.Mock).mockResolvedValue({ enabled: true });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('skips loading user info on the OIDC callback URL even when pre-step-up tokens keep isAuthenticated true', async () => {
    setLocation('/account', '?code=abc123&state=xyz');

    render(
      <PageContextProvider>
        <div>callback</div>
      </PageContextProvider>
    );

    await waitFor(() => {
      expect(getAccountCenterSettings).toHaveBeenCalledTimes(1);
    });
    expect(mockGetUserInfoRequest).not.toHaveBeenCalled();
  });

  it('loads user info on normal authenticated routes', async () => {
    setLocation('/account/security');

    render(
      <PageContextProvider>
        <div>security</div>
      </PageContextProvider>
    );

    await waitFor(() => {
      expect(mockGetUserInfoRequest).toHaveBeenCalledTimes(1);
    });
  });
});
