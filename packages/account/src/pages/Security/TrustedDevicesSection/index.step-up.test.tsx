import {
  AccountCenterControlValue,
  LogtoAcr,
  type AccountTrustedDeviceResponse,
} from '@logto/schemas';
import { fireEvent, waitFor } from '@testing-library/react';
import { HTTPError, type NormalizedOptions } from 'ky';
import { Route, Routes } from 'react-router-dom';

import renderWithPageContext, {
  mockAccountCenterSettings,
} from '@ac/__mocks__/RenderWithPageContext';
import { getTrustedDevices, removeTrustedDevice } from '@ac/apis/trusted-devices';
import { securityRoute } from '@ac/constants/routes';
import { setupI18nForTesting } from '@ac/jest.setup';
import { accountStorage } from '@ac/utils/session-storage';

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

jest.mock('@ac/apis/trusted-devices', () => ({
  getTrustedDevices: jest.fn(),
  removeTrustedDevice: jest.fn(),
}));

const mockGetTrustedDevices = getTrustedDevices as jest.MockedFunction<typeof getTrustedDevices>;
const mockRemoveTrustedDevice = removeTrustedDevice as jest.MockedFunction<
  typeof removeTrustedDevice
>;

const challenge =
  'Bearer error="insufficient_user_authentication", ' +
  'error_description="Recent user authentication is required", ' +
  'acr_values="urn:logto:acr:1fa", max_age="600"';

const createChallengeError = () =>
  new HTTPError(
    {
      status: 401,
      headers: { get: (name: string) => (name === 'www-authenticate' ? challenge : null) },
    } as unknown as Response,
    {} as Request,
    {} as NormalizedOptions
  );

const createIdTokenClaims = (authTime = Math.floor(Date.now() / 1000) - 60) => ({
  acr: LogtoAcr.FirstFactor,
  auth_time: authTime,
});

const trustedDevice = {
  id: 'trusted-device-id',
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  country: 'China',
  city: 'Shanghai',
  createdAt: new Date('2026-07-01T00:00:00.000Z').getTime(),
  lastUsedAt: new Date('2026-07-20T00:00:00.000Z').getTime(),
  expiresAt: new Date(2026, 6, 26, 12).getTime(),
  isCurrent: true,
} satisfies AccountTrustedDeviceResponse;

const renderTrustedDevices = () =>
  renderWithPageContext(
    <Routes>
      <Route path={securityRoute} element={<TrustedDevicesSection />} />
    </Routes>,
    {
      initialEntries: [securityRoute],
      future: { v7_relativeSplatPath: true, v7_startTransition: true },
    },
    {
      pageContext: {
        accountCenterSettings: {
          ...mockAccountCenterSettings,
          fields: {
            ...mockAccountCenterSettings.fields,
            trustedDevice: AccountCenterControlValue.Edit,
          },
        },
      },
    }
  );

describe('<TrustedDevicesSection /> OIDC step-up', () => {
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
    jest.resetAllMocks();
    window.sessionStorage.clear();
    mockGetAccessToken.mockResolvedValue('access-token');
    mockGetIdTokenClaims.mockResolvedValue(createIdTokenClaims());
    mockGetTrustedDevices.mockResolvedValue([trustedDevice]);
    mockRemoveTrustedDevice.mockResolvedValue(undefined);
  });

  it('loads the protected list on mount when the ID token has a fresh 1fa context', async () => {
    const { getByText, queryByRole } = renderTrustedDevices();

    await waitFor(() => {
      expect(mockGetTrustedDevices).toHaveBeenCalledWith('access-token');
    });
    expect(getByText('trusted-device-id')).not.toBeNull();
    expect(queryByRole('button', { name: 'Manage' })).toBeNull();
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('starts a step-up from Manage without a throwaway API request when the context is stale', async () => {
    mockGetIdTokenClaims.mockResolvedValue(
      createIdTokenClaims(Math.floor(Date.now() / 1000) - 600)
    );

    const { getByRole } = renderTrustedDevices();

    await waitFor(() => {
      expect(getByRole('button', { name: 'Manage' })).not.toBeNull();
    });
    fireEvent.click(getByRole('button', { name: 'Manage' }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
    });
    expect(mockGetTrustedDevices).not.toHaveBeenCalled();
    expect(mockSignIn).toHaveBeenCalledWith({
      redirectUri: 'http://localhost/account',
      clearTokens: false,
      extraParams: { acr_values: 'urn:logto:acr:1fa', max_age: '540' },
    });
    expect(accountStorage.pendingStepUp.get()).toMatchObject({
      action: { type: 'load-trusted-devices' },
      phase: 'authorizing',
    });
  });

  it('keeps the removal confirmation loading while the challenge starts a step-up', async () => {
    mockRemoveTrustedDevice.mockRejectedValue(createChallengeError());

    const { getAllByText, getByText } = renderTrustedDevices();

    await waitFor(() => {
      expect(getByText('trusted-device-id')).not.toBeNull();
    });

    fireEvent.click(getByText('Remove'));
    fireEvent.click(getAllByText('Remove').at(-1)!);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
    });
    expect(mockRemoveTrustedDevice).toHaveBeenCalledWith('access-token', 'trusted-device-id');

    const confirmButton = getAllByText('Remove').at(-1)?.closest('button');

    expect(confirmButton!.disabled).toBe(true);
  });
});
