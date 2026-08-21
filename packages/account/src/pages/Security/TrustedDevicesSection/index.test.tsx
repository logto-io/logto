import { AccountCenterControlValue, type AccountTrustedDeviceResponse } from '@logto/schemas';
import { fireEvent, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import renderWithPageContext, {
  mockAccountCenterSettings,
} from '@ac/__mocks__/RenderWithPageContext';
import { getTrustedDevices, removeTrustedDevice } from '@ac/apis/trusted-devices';
import { securityRoute, verifiedActionRoute } from '@ac/constants/routes';
import { setupI18nForTesting } from '@ac/jest.setup';
import { sessionStorage } from '@ac/utils/session-storage';

import TrustedDevicesSection from '.';

const mockGetAccessToken = jest.fn().mockResolvedValue('access-token');

jest.mock('@logto/react', () => ({
  useLogto: () => ({
    getAccessToken: mockGetAccessToken,
  }),
}));

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
    verificationId?: string;
    setToast?: jest.Mock;
  } = {}
) => {
  const { control = AccountCenterControlValue.Edit, setToast = jest.fn() } = options;
  const verificationId = Object.hasOwn(options, 'verificationId')
    ? options.verificationId
    : 'verification-id';

  return renderWithPageContext(
    <Routes>
      <Route path={securityRoute} element={<TrustedDevicesSection />} />
      <Route path={verifiedActionRoute} element={<div>verified action page</div>} />
    </Routes>,
    {
      initialEntries: [securityRoute],
      future: { v7_relativeSplatPath: true, v7_startTransition: true },
    },
    {
      pageContext: {
        verificationId,
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
      expect(mockRemoveTrustedDevice).toHaveBeenCalledWith(
        'access-token',
        'verification-id',
        'trusted-device-id'
      );
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

  it('starts the independent trusted-device verification action when verification is unavailable', () => {
    const { getByRole, getByText } = renderTrustedDevices({ verificationId: undefined });

    expect(mockGetTrustedDevices).not.toHaveBeenCalled();
    fireEvent.click(getByRole('button', { name: 'Manage' }));
    expect(getByText('verified action page')).toBeTruthy();
    expect(sessionStorage.getPendingVerifiedAction()).toBe('load-trusted-devices');
  });

  it('clears the pending trusted-device action after returning with verification', async () => {
    sessionStorage.setPendingVerifiedAction('load-trusted-devices');
    renderTrustedDevices();

    await waitFor(() => {
      expect(mockGetTrustedDevices).toHaveBeenCalled();
    });
    expect(sessionStorage.getPendingVerifiedAction()).toBeUndefined();
  });
});
