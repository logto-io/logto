import { AccountCenterControlValue, type AccountTrustedDeviceResponse } from '@logto/schemas';
import { fireEvent, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import renderWithPageContext, {
  mockAccountCenterSettings,
} from '@ac/__mocks__/RenderWithPageContext';
import { getTrustedDevices, removeTrustedDevice } from '@ac/apis/trusted-devices';
import { securityRoute } from '@ac/constants/routes';
import { setupI18nForTesting } from '@ac/jest.setup';

import TrustedDevicesSection from '.';

const mockGetAccessToken = jest.fn().mockResolvedValue('access-token');
const mockGetIdTokenClaims = jest.fn();
const mockSignIn = jest.fn();

jest.mock('@logto/react', () => ({
  useLogto: () => ({
    getAccessToken: mockGetAccessToken,
    getIdTokenClaims: mockGetIdTokenClaims,
    signIn: mockSignIn,
  }),
}));

const createIdTokenClaims = (authTime = Math.floor(Date.now() / 1000) - 60) => ({
  acr: 'urn:logto:acr:1fa',
  auth_time: authTime,
});

jest.mock('@ac/apis/trusted-devices', () => ({
  getTrustedDevices: jest.fn(),
  removeTrustedDevice: jest.fn(),
}));

const mockGetTrustedDevices = getTrustedDevices as jest.MockedFunction<typeof getTrustedDevices>;
const mockRemoveTrustedDevice = removeTrustedDevice as jest.MockedFunction<
  typeof removeTrustedDevice
>;

const chromeUserAgent =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

const currentTrustedDevice = {
  id: 'trusted-device-id',
  userAgent: chromeUserAgent,
  country: 'China',
  city: 'Shanghai',
  createdAt: new Date('2026-07-01T00:00:00.000Z').getTime(),
  lastUsedAt: new Date('2026-07-20T00:00:00.000Z').getTime(),
  expiresAt: new Date(2026, 6, 26, 12).getTime(),
  isCurrent: true,
} satisfies AccountTrustedDeviceResponse;

const renderTrustedDevices = (
  options: {
    control?: AccountCenterControlValue;
    setToast?: jest.Mock;
  } = {}
) => {
  const { control = AccountCenterControlValue.Edit, setToast = jest.fn() } = options;

  return renderWithPageContext(
    <Routes>
      <Route path={securityRoute} element={<TrustedDevicesSection />} />
    </Routes>,
    {
      initialEntries: [securityRoute],
      future: { v7_relativeSplatPath: true, v7_startTransition: true },
    },
    {
      pageContext: {
        setToast,
        accountCenterSettings: {
          ...mockAccountCenterSettings,
          fields: {
            ...mockAccountCenterSettings.fields,
            trustedDevice: control,
          },
        },
      },
    }
  );
};

describe('<TrustedDevicesSection />', () => {
  beforeAll(async () => {
    await setupI18nForTesting({
      translation: {
        action: { cancel: 'Cancel' },
        account_center: {
          security: {
            manage: 'Manage',
            trusted_devices: {
              title: 'MFA trusted devices',
              current_device: 'Current device',
              expires_on: 'Expire on {{date}}',
              unknown_location: 'Unknown location',
              remove: 'Remove',
              removed: 'Trusted device removed successfully.',
              loading: 'Loading...',
              empty: 'No trusted devices.',
              load_failed: 'Failed to load trusted devices. Please try again.',
              retry: 'Try again',
              remove_confirmation_title: 'Remove trusted device?',
              remove_confirmation_description:
                "You'll need to complete MFA again on this device the next time you sign in. Your current session will stay active.",
            },
          },
        },
      },
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAccessToken.mockResolvedValue('access-token');
    mockGetIdTokenClaims.mockResolvedValue(createIdTokenClaims());
    mockGetTrustedDevices.mockResolvedValue([currentTrustedDevice]);
    mockRemoveTrustedDevice.mockResolvedValue(undefined);
    window.sessionStorage.clear();
  });

  it('does not render or load devices when permission is off', () => {
    const { queryByText } = renderTrustedDevices({ control: AccountCenterControlValue.Off });

    expect(queryByText('MFA trusted devices')).toBeNull();
    expect(mockGetTrustedDevices).not.toHaveBeenCalled();
  });

  it('renders read-only metadata without the Remove action', async () => {
    const { getByText, queryByRole } = renderTrustedDevices({
      control: AccountCenterControlValue.ReadOnly,
    });

    await waitFor(() => {
      expect(getByText('Chrome on Apple Macintosh')).toBeTruthy();
    });
    expect(getByText('trusted-device-id')).toBeTruthy();
    expect(getByText('Shanghai, China')).toBeTruthy();
    expect(getByText('Expire on Jul 26, 2026')).toBeTruthy();
    expect(getByText('Current device')).toBeTruthy();
    expect(queryByRole('button', { name: 'Remove' })).toBeNull();
  });

  it('removes the current device after confirmation while preserving the current session copy', async () => {
    const setToast = jest.fn();
    const { getAllByText, getByText, queryByText } = renderTrustedDevices({ setToast });

    await waitFor(() => {
      expect(getByText('Current device')).toBeTruthy();
    });
    fireEvent.click(getByText('Remove'));

    expect(getByText('Remove trusted device?')).toBeTruthy();
    expect(
      getByText(
        "You'll need to complete MFA again on this device the next time you sign in. Your current session will stay active."
      )
    ).toBeTruthy();

    const removeButtons = getAllByText('Remove');
    fireEvent.click(removeButtons.at(-1)!);

    await waitFor(() => {
      expect(mockRemoveTrustedDevice).toHaveBeenCalledWith('access-token', 'trusted-device-id');
    });
    expect(queryByText('trusted-device-id')).toBeNull();
    expect(setToast).toHaveBeenCalledWith('Trusted device removed successfully.');
  });

  it('shows loading, empty, and retryable error states', async () => {
    mockGetTrustedDevices.mockImplementationOnce(
      async () =>
        new Promise<AccountTrustedDeviceResponse[]>(() => {
          // Keep the request pending so the loading state remains visible.
        })
    );

    const loadingView = renderTrustedDevices();
    expect(loadingView.getByText('Loading...')).toBeTruthy();
    await waitFor(() => {
      expect(mockGetTrustedDevices).toHaveBeenCalledTimes(1);
    });
    loadingView.unmount();

    mockGetTrustedDevices.mockResolvedValueOnce([]);
    const emptyView = renderTrustedDevices();
    await waitFor(() => {
      expect(emptyView.getByText('No trusted devices.')).toBeTruthy();
    });
    emptyView.unmount();

    mockGetTrustedDevices.mockRejectedValueOnce(new Error('request failed'));
    mockGetTrustedDevices.mockResolvedValueOnce([]);
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {
      // The error path intentionally reaches the shared error logger.
    });
    const errorView = renderTrustedDevices();
    await waitFor(() => {
      expect(errorView.getByText('Failed to load trusted devices. Please try again.')).toBeTruthy();
    });
    fireEvent.click(errorView.getByRole('button', { name: 'Try again' }));
    await waitFor(() => {
      expect(mockGetTrustedDevices).toHaveBeenCalledTimes(4);
    });
    consoleError.mockRestore();
  });

  it('starts a step-up when the authentication context is stale', async () => {
    mockGetIdTokenClaims.mockResolvedValue(
      createIdTokenClaims(Math.floor(Date.now() / 1000) - 600)
    );
    const { getByRole } = renderTrustedDevices();

    expect(mockGetTrustedDevices).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(getByRole('button', { name: 'Manage' })).toBeTruthy();
    });
    fireEvent.click(getByRole('button', { name: 'Manage' }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
    });
    expect(mockSignIn).toHaveBeenCalledWith({
      redirectUri: 'http://localhost/account',
      clearTokens: false,
      extraParams: { acr_values: 'urn:logto:acr:1fa', max_age: '540' },
    });
  });
});
