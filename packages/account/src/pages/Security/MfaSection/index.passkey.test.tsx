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

import { getMfaSettings, getMfaVerifications, updateMfaSettings } from '../../../apis/mfa';

import MfaSection from '.';

jest.mock('@ac/constants/env', () => ({
  __esModule: true,
  isDevFeaturesEnabled: true,
}));

const mockGetAccessToken = jest.fn().mockResolvedValue('access-token');

jest.mock('@logto/react', () => ({
  useLogto: () => ({
    getAccessToken: mockGetAccessToken,
  }),
}));

jest.mock('../../../apis/mfa', () => ({
  getMfaSettings: jest.fn(),
  getMfaVerifications: jest.fn(),
  updateMfaSettings: jest.fn(),
}));

const mockGetMfaSettings = getMfaSettings as jest.MockedFunction<typeof getMfaSettings>;
const mockGetMfaVerifications = getMfaVerifications as jest.MockedFunction<
  typeof getMfaVerifications
>;
const mockUpdateMfaSettings = updateMfaSettings as jest.MockedFunction<typeof updateMfaSettings>;

const renderMfaSection = (mfaVerifications: UserMfaVerificationResponse = []) => {
  mockGetMfaVerifications.mockResolvedValue(mfaVerifications);

  return renderWithPageContext(
    <Routes>
      <Route path={securityRoute} element={<MfaSection />} />
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
          fields: { ...mockAccountCenterSettings.fields, mfa: AccountCenterControlValue.Edit },
        },
        // Only passkey sign-in is enabled; no MFA factors are configured.
        experienceSettings: {
          ...mockSignInExperienceSettings,
          mfa: { policy: MfaPolicy.UserControlled, factors: [] },
          passkeySignIn: { enabled: true },
        },
      },
    }
  );
};

describe('<MfaSection /> with only passkey sign-in enabled', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockGetAccessToken.mockResolvedValue('access-token');
    mockGetMfaSettings.mockResolvedValue({ skipMfaOnSignIn: true });
    mockUpdateMfaSettings.mockResolvedValue({ skipMfaOnSignIn: true });
    window.sessionStorage.clear();
  });

  it('shows the passkey row without WebAuthn in MFA factors and exposes the add flow', async () => {
    const { getByText, queryByText } = renderMfaSection();

    await waitFor(() => {
      expect(queryByText('account_center.security.passkeys')).not.toBeNull();
    });

    // No MFA-only factors or two-step toggle should appear.
    expect(queryByText('account_center.security.authenticator_app')).toBeNull();
    expect(queryByText('account_center.security.backup_codes')).toBeNull();
    expect(queryByText('account_center.security.no_verification_method_warning')).toBeNull();
    expect(mockGetMfaSettings).not.toHaveBeenCalled();

    fireEvent.click(getByText('account_center.security.add'));

    expect(getByText('passkey add page')).not.toBeNull();
  });

  it('exposes the manage flow when a passkey is already configured', async () => {
    const { getByText, queryByText } = renderMfaSection([
      {
        id: 'passkey-verification-id',
        createdAt: '2026-05-13T00:00:00.000Z',
        type: MfaFactor.WebAuthn,
      },
    ]);

    await waitFor(() => {
      expect(queryByText('account_center.security.passkeys_count')).not.toBeNull();
    });

    fireEvent.click(getByText('account_center.security.manage'));

    expect(getByText('passkey manage page')).not.toBeNull();
  });
});
