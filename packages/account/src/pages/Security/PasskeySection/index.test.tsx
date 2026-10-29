import {
  AccountCenterControlValue,
  MfaFactor,
  MfaPolicy,
  type UserMfaVerificationResponse,
} from '@logto/schemas';
import { fireEvent, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import renderWithPageContext, {
  mockAccountCenterSettings,
  mockSignInExperienceSettings,
} from '@ac/__mocks__/RenderWithPageContext';
import { passkeyAddRoute, passkeyManageRoute, securityRoute } from '@ac/constants/routes';

import { getLogtoConfig, updateLogtoConfig } from '../../../apis/logto-config';
import { getMfaVerifications } from '../../../apis/mfa';
import MfaVerificationsProvider from '../MfaVerificationsProvider';

import PasskeySection from '.';

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

jest.mock('../../../apis/mfa', () => ({
  getMfaVerifications: jest.fn(),
}));

jest.mock('../../../apis/logto-config', () => ({
  getLogtoConfig: jest.fn(),
  updateLogtoConfig: jest.fn(),
}));

const mockGetMfaVerifications = getMfaVerifications as jest.MockedFunction<
  typeof getMfaVerifications
>;
const mockGetLogtoConfig = getLogtoConfig as jest.MockedFunction<typeof getLogtoConfig>;
const mockUpdateLogtoConfig = updateLogtoConfig as jest.MockedFunction<typeof updateLogtoConfig>;

const buildLogtoConfigResponse = (passkeySignInSkipped: boolean) => ({
  mfa: { skipped: false, skipMfaOnSignIn: true },
  passkeySignIn: { skipped: passkeySignInSkipped },
});

type RenderOptions = {
  mfaVerifications?: UserMfaVerificationResponse;
  passkeyControl?: AccountCenterControlValue;
  passkeySignInEnabled?: boolean;
  passkeySignInSkipped?: boolean;
};

const renderPasskeySection = ({
  mfaVerifications = [],
  passkeyControl = AccountCenterControlValue.Edit,
  passkeySignInEnabled = true,
  passkeySignInSkipped = false,
}: RenderOptions = {}) => {
  mockGetMfaVerifications.mockResolvedValue(mfaVerifications);
  mockGetLogtoConfig.mockResolvedValue(buildLogtoConfigResponse(passkeySignInSkipped));
  mockUpdateLogtoConfig.mockResolvedValue(buildLogtoConfigResponse(passkeySignInSkipped));

  return renderWithPageContext(
    <Routes>
      <Route
        path={securityRoute}
        element={
          <MfaVerificationsProvider>
            <PasskeySection />
          </MfaVerificationsProvider>
        }
      />
      <Route path={passkeyAddRoute} element={<div>passkey add page</div>} />
      <Route path={passkeyManageRoute} element={<div>passkey manage page</div>} />
    </Routes>,
    {
      initialEntries: [securityRoute],
      future: { v7_relativeSplatPath: true, v7_startTransition: true },
    },
    {
      pageContext: {
        accountCenterSettings: {
          ...mockAccountCenterSettings,
          fields: { ...mockAccountCenterSettings.fields, passkey: passkeyControl },
        },
        experienceSettings: {
          ...mockSignInExperienceSettings,
          mfa: { policy: MfaPolicy.UserControlled, factors: [] },
          passkeySignIn: { enabled: passkeySignInEnabled },
        },
      },
    }
  );
};

describe('<PasskeySection />', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockGetAccessToken.mockResolvedValue('access-token');
    mockGetIdTokenClaims.mockResolvedValue(createIdTokenClaims());
    window.sessionStorage.clear();
  });

  it('shows the passkey section and exposes the add flow when no passkey is configured', async () => {
    const { getByText, queryAllByText, queryByText } = renderPasskeySection();

    await waitFor(() => {
      expect(queryByText('account_center.security.not_configured')).not.toBeNull();
    });

    expect(queryAllByText('account_center.security.passkeys')).toHaveLength(2);

    fireEvent.click(getByText('account_center.security.add'));

    expect(getByText('passkey add page')).not.toBeNull();
  });

  it('exposes the manage flow when a passkey is already configured', async () => {
    const { getByText, queryByText } = renderPasskeySection({
      mfaVerifications: [
        {
          id: 'passkey-verification-id',
          createdAt: '2026-05-13T00:00:00.000Z',
          type: MfaFactor.WebAuthn,
        },
      ],
    });

    await waitFor(() => {
      expect(queryByText('account_center.security.passkeys_count')).not.toBeNull();
    });

    fireEvent.click(getByText('account_center.security.manage'));

    expect(getByText('passkey manage page')).not.toBeNull();
  });

  it('does not render any action when the passkey control is read-only', async () => {
    const { queryAllByText, queryByText } = renderPasskeySection({
      passkeyControl: AccountCenterControlValue.ReadOnly,
    });

    await waitFor(() => {
      expect(queryByText('account_center.security.not_configured')).not.toBeNull();
    });

    expect(queryAllByText('account_center.security.passkeys')).toHaveLength(2);
    expect(queryByText('account_center.security.add')).toBeNull();
    expect(queryByText('account_center.security.manage')).toBeNull();
    expect(queryByText('account_center.security.passkey_sign_in_prompt')).toBeNull();
  });

  it('renders nothing when passkey sign-in is disabled', () => {
    const { queryByText } = renderPasskeySection({ passkeySignInEnabled: false });

    expect(queryByText('account_center.security.passkeys')).toBeNull();
    expect(mockGetMfaVerifications).not.toHaveBeenCalled();
  });

  it('renders nothing when the passkey control is off', () => {
    const { queryByText } = renderPasskeySection({
      passkeyControl: AccountCenterControlValue.Off,
    });

    expect(queryByText('account_center.security.passkeys')).toBeNull();
    expect(mockGetMfaVerifications).not.toHaveBeenCalled();
  });

  it('reflects the current passkey sign-in skip state in the toggle', async () => {
    const { getByRole } = renderPasskeySection({ passkeySignInSkipped: true });

    await waitFor(() => {
      expect((getByRole('checkbox') as HTMLInputElement).checked).toBe(false);
    });
  });

  it('starts a step-up when toggling with a stale authentication context', async () => {
    const { getByRole } = renderPasskeySection({ passkeySignInSkipped: false });

    await waitFor(() => {
      expect((getByRole('checkbox') as HTMLInputElement).checked).toBe(true);
    });

    mockGetIdTokenClaims.mockResolvedValue(
      createIdTokenClaims(Math.floor(Date.now() / 1000) - 600)
    );
    fireEvent.click(getByRole('checkbox'));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
    });
    expect(mockSignIn).toHaveBeenCalledWith({
      redirectUri: 'http://localhost/account',
      clearTokens: false,
      extraParams: { acr_values: 'urn:logto:acr:1fa', max_age: '540' },
    });
    expect(mockUpdateLogtoConfig).not.toHaveBeenCalled();
  });

  it('updates the passkey sign-in skip state directly with a fresh context', async () => {
    const { getByRole } = renderPasskeySection({ passkeySignInSkipped: false });

    await waitFor(() => {
      expect((getByRole('checkbox') as HTMLInputElement).checked).toBe(true);
    });

    fireEvent.click(getByRole('checkbox'));

    await waitFor(() => {
      expect(mockUpdateLogtoConfig).toHaveBeenCalledWith('access-token', {
        passkeySignIn: { skipped: true },
      });
    });
  });
});
