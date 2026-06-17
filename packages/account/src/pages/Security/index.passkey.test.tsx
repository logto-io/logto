import {
  AccountCenterControlValue,
  MfaFactor,
  MfaPolicy,
  type UserMfaVerificationResponse,
} from '@logto/schemas';
import { waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import renderWithPageContext, {
  mockAccountCenterSettings,
  mockSignInExperienceSettings,
} from '@ac/__mocks__/RenderWithPageContext';
import { securityRoute, verifiedActionRoute } from '@ac/constants/routes';

import { getMfaSettings, getMfaVerifications, updateMfaSettings } from '../../apis/mfa';

import Security from '.';

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

jest.mock('../../apis/mfa', () => ({
  getMfaSettings: jest.fn(),
  getMfaVerifications: jest.fn(),
  updateMfaSettings: jest.fn(),
}));

const mockGetMfaSettings = getMfaSettings as jest.MockedFunction<typeof getMfaSettings>;
const mockGetMfaVerifications = getMfaVerifications as jest.MockedFunction<
  typeof getMfaVerifications
>;
const mockUpdateMfaSettings = updateMfaSettings as jest.MockedFunction<typeof updateMfaSettings>;

const renderSecurity = ({
  factors,
  mfaVerifications = [],
}: {
  factors: MfaFactor[];
  mfaVerifications?: UserMfaVerificationResponse;
}) => {
  mockGetMfaVerifications.mockResolvedValue(mfaVerifications);

  return renderWithPageContext(
    <Routes>
      <Route path={securityRoute} element={<Security />} />
      <Route path={verifiedActionRoute} element={<div>verified action page</div>} />
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
            username: AccountCenterControlValue.Off,
            email: AccountCenterControlValue.Off,
            phone: AccountCenterControlValue.Off,
            password: AccountCenterControlValue.Off,
            social: AccountCenterControlValue.Off,
            mfa: AccountCenterControlValue.Edit,
          },
          deleteAccountUrl: null,
        },
        experienceSettings: {
          ...mockSignInExperienceSettings,
          socialConnectors: [],
          mfa: { policy: MfaPolicy.UserControlled, factors },
          passkeySignIn: { enabled: true },
        },
      },
    }
  );
};

describe('<Security /> with passkey sign-in enabled', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockGetAccessToken.mockResolvedValue('access-token');
    mockGetMfaSettings.mockResolvedValue({ skipMfaOnSignIn: true });
    mockUpdateMfaSettings.mockResolvedValue({ skipMfaOnSignIn: true });
    window.sessionStorage.clear();
  });

  it('shows a dedicated passkey section and no MFA section when only passkey sign-in is enabled', async () => {
    const { getAllByText, queryByText } = renderSecurity({ factors: [] });

    await waitFor(() => {
      expect(queryByText('account_center.security.not_configured')).not.toBeNull();
    });

    // The passkey section renders the label as both the section title and the row title.
    expect(getAllByText('account_center.security.passkeys')).toHaveLength(2);
    expect(queryByText('account_center.security.two_step_verification')).toBeNull();
  });

  it('does not render an empty MFA section when WebAuthn is the only enabled factor', async () => {
    const { getAllByText, queryByText } = renderSecurity({
      factors: [MfaFactor.WebAuthn],
      mfaVerifications: [
        {
          id: 'passkey-verification-id',
          createdAt: '2026-05-13T00:00:00.000Z',
          type: MfaFactor.WebAuthn,
        },
      ],
    });

    // Wait until the passkey section finishes loading (section title + row title).
    await waitFor(() => {
      expect(getAllByText('account_center.security.passkeys')).toHaveLength(2);
    });

    // WebAuthn is the only factor and is surfaced as a passkey, so there is no real second factor
    // to manage: the Two-step verification section must not render a toggle-only card.
    expect(queryByText('account_center.security.two_step_verification')).toBeNull();
  });

  it('does not duplicate passkey in the MFA section when both WebAuthn factor and passkey sign-in are enabled', async () => {
    const { getAllByText, queryByText } = renderSecurity({
      factors: [MfaFactor.TOTP, MfaFactor.WebAuthn],
      mfaVerifications: [
        {
          id: 'passkey-verification-id',
          createdAt: '2026-05-13T00:00:00.000Z',
          type: MfaFactor.WebAuthn,
        },
      ],
    });

    await waitFor(() => {
      expect(queryByText('account_center.security.authenticator_app')).not.toBeNull();
    });

    // Passkey appears only in its own section (section title + row title), never in the MFA section.
    await waitFor(() => {
      expect(getAllByText('account_center.security.passkeys')).toHaveLength(2);
    });
    // The MFA section is still present alongside its non-passkey factors.
    expect(getAllByText('account_center.security.two_step_verification').length).toBeGreaterThan(0);
  });

  it('warns to add a second verification method when only a passkey is configured', async () => {
    mockGetMfaSettings.mockResolvedValue({ skipMfaOnSignIn: false });
    const { queryByText } = renderSecurity({
      factors: [MfaFactor.TOTP, MfaFactor.WebAuthn],
      mfaVerifications: [
        {
          id: 'passkey-verification-id',
          createdAt: '2026-05-13T00:00:00.000Z',
          type: MfaFactor.WebAuthn,
        },
      ],
    });

    await waitFor(() => {
      expect(queryByText('account_center.security.no_verification_method_warning')).not.toBeNull();
    });
  });

  it('does not warn when a non-passkey second factor is configured alongside the passkey', async () => {
    mockGetMfaSettings.mockResolvedValue({ skipMfaOnSignIn: false });
    const { queryByText } = renderSecurity({
      factors: [MfaFactor.TOTP, MfaFactor.WebAuthn],
      mfaVerifications: [
        {
          id: 'passkey-verification-id',
          createdAt: '2026-05-13T00:00:00.000Z',
          type: MfaFactor.WebAuthn,
        },
        {
          id: 'totp-verification-id',
          createdAt: '2026-05-13T00:00:00.000Z',
          type: MfaFactor.TOTP,
        },
      ],
    });

    await waitFor(() => {
      expect(queryByText('account_center.security.authenticator_app')).not.toBeNull();
    });
    expect(queryByText('account_center.security.no_verification_method_warning')).toBeNull();
  });
});
