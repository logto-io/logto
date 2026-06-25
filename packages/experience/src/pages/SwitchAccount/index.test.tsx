import { experience, type ConsentInfoResponse } from '@logto/schemas';
import { fireEvent, waitFor } from '@testing-library/react';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { getConsentInfo } from '@/apis/consent';

import SwitchAccount from '.';

const navigate = jest.fn();

jest.mock('@/apis/consent', () => ({
  getConsentInfo: jest.fn(),
}));

jest.mock('@/hooks/use-navigate-with-preserved-search-params', () => ({
  __esModule: true,
  default: () => navigate,
  usePreserveSearchParams: () => ({ getTo: (to: unknown) => to }),
}));

const mockedGetConsentInfo = getConsentInfo as jest.MockedFunction<typeof getConsentInfo>;

const consentInfo: ConsentInfoResponse = {
  application: {
    id: 'application_id',
    name: 'Application',
    displayName: null,
    privacyPolicyUrl: null,
    termsOfUseUrl: null,
  },
  user: {
    id: 'user_id',
    name: null,
    avatar: null,
    username: 'user',
    primaryEmail: 'current@example.com',
    primaryPhone: null,
  },
  missingOIDCScope: [],
  missingResourceScopes: [],
  redirectUri: 'https://example.com/callback',
};

const renderSwitchAccount = () =>
  renderWithPageContext(
    <SettingsProvider>
      <SwitchAccount />
    </SettingsProvider>,
    {
      future: { v7_relativeSplatPath: true, v7_startTransition: true },
      initialEntries: [
        `/${experience.routes.switchAccount}?login_hint=invitee%40example.com&one_time_token=token`,
      ],
    }
  );

describe('SwitchAccount', () => {
  const originalLocation = window.location;
  const assign = jest.fn();

  beforeAll(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        assign,
      },
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetConsentInfo.mockResolvedValue(consentInfo);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  it('continues the one-time-token flow only when the user confirms switching account', async () => {
    const { getByText, queryByText } = renderSwitchAccount();

    await waitFor(() => {
      expect(queryByText('action.continue_as')).not.toBeNull();
    });

    fireEvent.click(getByText('action.continue_as'));

    expect(navigate).toHaveBeenCalledWith(
      {
        pathname: `/${experience.routes.oneTimeToken}`,
        search: '?login_hint=invitee%40example.com&one_time_token=token',
      },
      { replace: true }
    );
  });

  it('returns to the client origin without navigating back to token-bearing history entries', async () => {
    const { getByText, queryByText } = renderSwitchAccount();

    await waitFor(() => {
      expect(queryByText('action.back_to_current_account')).not.toBeNull();
    });

    fireEvent.click(getByText('action.back_to_current_account'));
    expect(assign).toHaveBeenCalledWith('https://example.com');
    expect(navigate).not.toHaveBeenCalled();
  });
});
