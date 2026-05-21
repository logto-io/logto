/* eslint-disable max-lines */
import type { SignInExperienceResponse } from '@experience/shared/types';
import {
  AccountCenterControlValue,
  ConnectorPlatform,
  MfaFactor,
  MfaPolicy,
  type AccountCenter,
  type UserMfaVerificationResponse,
  type UserProfileResponse,
} from '@logto/schemas';
import { fireEvent, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import renderWithPageContext, {
  mockAccountCenterSettings,
  mockSignInExperienceSettings,
  mockUserInfo,
} from '@ac/__mocks__/RenderWithPageContext';
import { securityRoute, verifiedActionRoute } from '@ac/constants/routes';
import { sessionStorage } from '@ac/utils/session-storage';

import { getMfaSettings, getMfaVerifications, updateMfaSettings } from '../../apis/mfa';

import Security from '.';

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

type SecurityRenderOptions = {
  readonly accountCenterSettings?: Omit<Partial<AccountCenter>, 'fields'> & {
    readonly fields?: Partial<AccountCenter['fields']>;
  };
  readonly experienceSettings?: Omit<Partial<SignInExperienceResponse>, 'mfa'> & {
    readonly mfa?: Partial<SignInExperienceResponse['mfa']>;
  };
  readonly userInfo?: Partial<UserProfileResponse>;
  readonly verificationId?: string;
};

const googleWebConnector = {
  id: 'google-web',
  target: 'google',
  platform: ConnectorPlatform.Web,
  name: { en: 'Google' },
  logo: 'https://example.com/google.svg',
  logoDark: 'https://example.com/google-dark.svg',
};

const googleNativeConnector = {
  ...googleWebConnector,
  id: 'google-native',
  platform: ConnectorPlatform.Native,
};

const mockGetMfaSettings = getMfaSettings as jest.MockedFunction<typeof getMfaSettings>;
const mockGetMfaVerifications = getMfaVerifications as jest.MockedFunction<
  typeof getMfaVerifications
>;
const mockUpdateMfaSettings = updateMfaSettings as jest.MockedFunction<typeof updateMfaSettings>;

const configuredMfaVerifications = [
  {
    id: 'totp-verification-id',
    createdAt: '2026-05-13T00:00:00.000Z',
    type: MfaFactor.TOTP,
  },
  {
    id: 'passkey-verification-id',
    createdAt: '2026-05-13T00:00:00.000Z',
    type: MfaFactor.WebAuthn,
  },
  {
    id: 'backup-code-verification-id',
    createdAt: '2026-05-13T00:00:00.000Z',
    type: MfaFactor.BackupCode,
    remainCodes: 8,
  },
] satisfies UserMfaVerificationResponse;

const renderSecurity = ({
  accountCenterSettings,
  experienceSettings,
  userInfo,
  verificationId,
}: SecurityRenderOptions = {}) => {
  const { fields, ...accountCenterSettingsOverrides } = accountCenterSettings ?? {};
  const { mfa, ...experienceSettingsOverrides } = experienceSettings ?? {};

  return renderWithPageContext(
    <Routes>
      <Route path={securityRoute} element={<Security />} />
      <Route path={verifiedActionRoute} element={<div>verified action page</div>} />
    </Routes>,
    {
      initialEntries: [securityRoute],
      future: {
        v7_relativeSplatPath: true,
        v7_startTransition: true,
      },
    },
    {
      pageContext: {
        accountCenterSettings: {
          ...mockAccountCenterSettings,
          fields: {
            ...mockAccountCenterSettings.fields,
            social: AccountCenterControlValue.Off,
            mfa: AccountCenterControlValue.Off,
            ...fields,
          },
          deleteAccountUrl: null,
          ...accountCenterSettingsOverrides,
        },
        experienceSettings: {
          ...mockSignInExperienceSettings,
          socialConnectors: [],
          mfa: {
            ...mockSignInExperienceSettings.mfa,
            factors: [],
            ...mfa,
          },
          ...experienceSettingsOverrides,
        },
        userInfo: {
          ...mockUserInfo,
          ...userInfo,
        },
        verificationId,
      },
    }
  );
};

describe('<Security />', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockGetAccessToken.mockResolvedValue('access-token');
    mockGetMfaSettings.mockResolvedValue({ skipMfaOnSignIn: true });
    mockGetMfaVerifications.mockResolvedValue([]);
    mockUpdateMfaSettings.mockResolvedValue({ skipMfaOnSignIn: true });
    window.sessionStorage.clear();
  });

  it('renders editable fields with expected sections and edit entries', () => {
    const { queryAllByText, queryByText } = renderSecurity();

    expect(queryByText('account_center.page.security_title')).not.toBeNull();
    expect(queryByText('account_center.page.security_description')).not.toBeNull();

    expect(queryAllByText('input.username')).toHaveLength(2);
    expect(queryByText('alex')).not.toBeNull();

    expect(queryByText('account_center.security.email_phone')).not.toBeNull();
    expect(queryByText('account_center.security.email')).not.toBeNull();
    expect(queryByText('alex@example.com')).not.toBeNull();
    expect(queryByText('account_center.security.phone')).not.toBeNull();
    expect(queryByText('+1 415 555 0100')).not.toBeNull();

    expect(queryAllByText('account_center.security.password')).toHaveLength(2);
    expect(queryByText('account_center.security.configured')).not.toBeNull();
    expect(queryAllByText('account_center.security.change')).toHaveLength(4);
    expect(queryAllByText('account_center.security.remove')).toHaveLength(3);
  });

  it('renders read-only fields in display-only state', () => {
    const { queryAllByText, queryByText } = renderSecurity({
      accountCenterSettings: {
        fields: {
          username: AccountCenterControlValue.ReadOnly,
          email: AccountCenterControlValue.ReadOnly,
          phone: AccountCenterControlValue.ReadOnly,
          password: AccountCenterControlValue.ReadOnly,
          social: AccountCenterControlValue.ReadOnly,
        },
      },
      experienceSettings: {
        socialConnectors: [googleWebConnector],
      },
    });

    expect(queryAllByText('input.username')).toHaveLength(2);
    expect(queryByText('alex')).not.toBeNull();
    expect(queryByText('account_center.security.email_phone')).not.toBeNull();
    expect(queryByText('alex@example.com')).not.toBeNull();
    expect(queryByText('+1 415 555 0100')).not.toBeNull();
    expect(queryAllByText('account_center.security.password')).toHaveLength(2);
    expect(queryByText('account_center.security.configured')).not.toBeNull();
    expect(queryByText('account_center.security.social_sign_in')).not.toBeNull();
    expect(queryByText('Google')).not.toBeNull();
    expect(queryByText('account_center.security.social_not_linked')).not.toBeNull();
    expect(queryByText('account_center.security.add')).toBeNull();
    expect(queryByText('account_center.security.change')).toBeNull();
    expect(queryByText('account_center.security.remove')).toBeNull();
  });

  it('hides off and unavailable sections', () => {
    const { queryByText } = renderSecurity({
      accountCenterSettings: {
        fields: {
          username: AccountCenterControlValue.Off,
          email: AccountCenterControlValue.Off,
          phone: AccountCenterControlValue.Off,
          password: AccountCenterControlValue.Off,
          social: AccountCenterControlValue.Off,
          mfa: AccountCenterControlValue.Edit,
        },
      },
      experienceSettings: {
        mfa: {
          factors: [],
        },
      },
    });

    expect(queryByText('input.username')).toBeNull();
    expect(queryByText('account_center.security.email_phone')).toBeNull();
    expect(queryByText('account_center.security.password')).toBeNull();
    expect(queryByText('account_center.security.social_sign_in')).toBeNull();
    expect(queryByText('account_center.security.two_step_verification')).toBeNull();
    expect(queryByText('account_center.security.account_removal')).toBeNull();
  });

  it('renders social section only when available web social connectors exist', () => {
    const { queryByText, unmount } = renderSecurity({
      accountCenterSettings: {
        fields: {
          username: AccountCenterControlValue.Off,
          email: AccountCenterControlValue.Off,
          phone: AccountCenterControlValue.Off,
          password: AccountCenterControlValue.Off,
          social: AccountCenterControlValue.Edit,
        },
      },
      experienceSettings: {
        socialConnectors: [googleNativeConnector],
      },
    });

    expect(queryByText('account_center.security.social_sign_in')).toBeNull();
    expect(queryByText('Google')).toBeNull();

    unmount();

    const visibleSocialSection = renderSecurity({
      accountCenterSettings: {
        fields: {
          username: AccountCenterControlValue.Off,
          email: AccountCenterControlValue.Off,
          phone: AccountCenterControlValue.Off,
          password: AccountCenterControlValue.Off,
          social: AccountCenterControlValue.Edit,
        },
      },
      experienceSettings: {
        socialConnectors: [googleWebConnector],
      },
    });

    expect(
      visibleSocialSection.queryByText('account_center.security.social_sign_in')
    ).not.toBeNull();
    expect(visibleSocialSection.queryByText('Google')).not.toBeNull();
    expect(
      visibleSocialSection.queryByText('account_center.security.social_not_linked')
    ).not.toBeNull();
    expect(visibleSocialSection.queryByText('account_center.security.add')).not.toBeNull();
  });

  it('renders delete account section only when delete account URL is configured', () => {
    const { queryByText, unmount } = renderSecurity({
      accountCenterSettings: {
        fields: {
          username: AccountCenterControlValue.Off,
          email: AccountCenterControlValue.Off,
          phone: AccountCenterControlValue.Off,
          password: AccountCenterControlValue.Off,
        },
      },
    });

    expect(queryByText('account_center.security.account_removal')).toBeNull();

    unmount();

    const deleteAccountUrl = 'https://example.com/delete-account';
    const visibleDeleteSection = renderSecurity({
      accountCenterSettings: {
        fields: {
          username: AccountCenterControlValue.Off,
          email: AccountCenterControlValue.Off,
          phone: AccountCenterControlValue.Off,
          password: AccountCenterControlValue.Off,
        },
        deleteAccountUrl,
      },
    });

    expect(
      visibleDeleteSection.queryByText('account_center.security.account_removal')
    ).not.toBeNull();
    expect(
      visibleDeleteSection.queryByText('account_center.security.delete_your_account')
    ).not.toBeNull();
    expect(
      visibleDeleteSection
        .queryByText('account_center.security.delete_account')
        ?.closest('a')
        ?.getAttribute('href')
    ).toBe(deleteAccountUrl);
  });

  it('renders MFA loading mask without leaking incomplete content', async () => {
    const pendingMfaVerifications = new Promise<UserMfaVerificationResponse>(() => {
      // Keep the request pending to assert the loading state.
    });

    mockGetMfaVerifications.mockImplementationOnce(async () => pendingMfaVerifications);

    const { queryByRole, queryByText } = renderSecurity({
      accountCenterSettings: {
        fields: {
          username: AccountCenterControlValue.Off,
          email: AccountCenterControlValue.Off,
          phone: AccountCenterControlValue.Off,
          password: AccountCenterControlValue.Off,
          social: AccountCenterControlValue.Off,
          mfa: AccountCenterControlValue.Edit,
        },
      },
      experienceSettings: {
        mfa: {
          factors: [MfaFactor.TOTP, MfaFactor.WebAuthn, MfaFactor.BackupCode],
          policy: MfaPolicy.Mandatory,
        },
      },
    });

    await waitFor(() => {
      expect(queryByRole('status')).not.toBeNull();
    });
    await waitFor(() => {
      expect(mockGetMfaVerifications).toHaveBeenCalledTimes(1);
    });

    const status = queryByRole('status');

    expect(status?.getAttribute('aria-live')).toBe('polite');
    expect(status?.getAttribute('aria-busy')).toBe('true');
    expect(status?.getAttribute('aria-label')).toBe(
      'account_center.security.two_step_verification'
    );
    expect(queryByText('account_center.security.authenticator_app')).toBeNull();
    expect(queryByText('account_center.security.passkeys')).toBeNull();
    expect(queryByText('account_center.security.backup_codes')).toBeNull();
    expect(queryByText('account_center.security.not_configured')).toBeNull();
  });

  it('renders configured MFA method rows from mocked API data', async () => {
    mockGetMfaSettings.mockResolvedValue({ skipMfaOnSignIn: false });
    mockGetMfaVerifications.mockResolvedValue(configuredMfaVerifications);

    const { queryAllByText, queryByText } = renderSecurity({
      accountCenterSettings: {
        fields: {
          username: AccountCenterControlValue.Off,
          email: AccountCenterControlValue.Off,
          phone: AccountCenterControlValue.Off,
          password: AccountCenterControlValue.Off,
          social: AccountCenterControlValue.Off,
          mfa: AccountCenterControlValue.Edit,
        },
      },
      experienceSettings: {
        mfa: {
          factors: [MfaFactor.TOTP, MfaFactor.WebAuthn, MfaFactor.BackupCode],
          policy: MfaPolicy.Mandatory,
        },
      },
    });

    await waitFor(() => {
      expect(queryByText('account_center.security.authenticator_app')).not.toBeNull();
    });

    expect(queryByText('account_center.security.two_step_verification')).not.toBeNull();
    expect(queryByText('account_center.security.passkeys')).not.toBeNull();
    expect(queryByText('account_center.security.passkeys_count')).not.toBeNull();
    expect(queryByText('account_center.security.authenticator_app')).not.toBeNull();
    expect(queryByText('account_center.security.configured')).not.toBeNull();
    expect(queryByText('account_center.security.backup_codes')).not.toBeNull();
    expect(queryByText('account_center.security.backup_codes_count')).not.toBeNull();
    expect(queryByText('account_center.security.not_configured')).toBeNull();
    expect(queryAllByText('account_center.security.manage')).toHaveLength(2);
    expect(queryByText('account_center.security.change')).not.toBeNull();
    expect(mockGetMfaSettings).not.toHaveBeenCalled();
    expect(mockGetMfaVerifications).toHaveBeenCalledTimes(1);
  });

  it('renders two-step verification toggle for user-controlled MFA policy', async () => {
    const { getByLabelText, queryByText } = renderSecurity({
      accountCenterSettings: {
        fields: {
          username: AccountCenterControlValue.Off,
          email: AccountCenterControlValue.Off,
          phone: AccountCenterControlValue.Off,
          password: AccountCenterControlValue.Off,
          social: AccountCenterControlValue.Off,
          mfa: AccountCenterControlValue.Edit,
        },
      },
      experienceSettings: {
        mfa: {
          factors: [MfaFactor.TOTP],
          policy: MfaPolicy.PromptAtSignInAndSignUp,
        },
      },
    });

    await waitFor(() => {
      expect(getByLabelText('Toggle switch')).not.toBeNull();
    });

    expect(
      queryByText('account_center.security.turn_on_2_step_verification_description')
    ).not.toBeNull();
    expect(mockGetMfaSettings).toHaveBeenCalledTimes(1);
  });

  it('hides two-step verification toggle for mandatory MFA policies', async () => {
    const { queryByLabelText, queryByText } = renderSecurity({
      accountCenterSettings: {
        fields: {
          username: AccountCenterControlValue.Off,
          email: AccountCenterControlValue.Off,
          phone: AccountCenterControlValue.Off,
          password: AccountCenterControlValue.Off,
          social: AccountCenterControlValue.Off,
          mfa: AccountCenterControlValue.Edit,
        },
      },
      experienceSettings: {
        mfa: {
          factors: [MfaFactor.TOTP],
          policy: MfaPolicy.Mandatory,
        },
      },
    });

    await waitFor(() => {
      expect(queryByText('account_center.security.authenticator_app')).not.toBeNull();
    });

    expect(queryByLabelText('Toggle switch')).toBeNull();
    expect(mockGetMfaSettings).not.toHaveBeenCalled();
  });

  it('navigates to verified action when enabling MFA without verification ID', async () => {
    const { getByLabelText, getByText } = renderSecurity({
      accountCenterSettings: {
        fields: {
          username: AccountCenterControlValue.Off,
          email: AccountCenterControlValue.Off,
          phone: AccountCenterControlValue.Off,
          password: AccountCenterControlValue.Off,
          social: AccountCenterControlValue.Off,
          mfa: AccountCenterControlValue.Edit,
        },
      },
      experienceSettings: {
        mfa: {
          factors: [MfaFactor.TOTP],
          policy: MfaPolicy.PromptAtSignInAndSignUp,
        },
      },
    });

    await waitFor(() => {
      expect(getByLabelText('Toggle switch')).not.toBeNull();
    });

    fireEvent.click(getByLabelText('Toggle switch'));

    expect(getByText('verified action page')).not.toBeNull();
    expect(sessionStorage.getPendingVerifiedAction()).toBe('enable-mfa');
    expect(mockUpdateMfaSettings).not.toHaveBeenCalled();
  });

  it('updates MFA settings when enabling MFA with verification ID', async () => {
    mockUpdateMfaSettings.mockResolvedValue({ skipMfaOnSignIn: false });

    const { getByLabelText } = renderSecurity({
      accountCenterSettings: {
        fields: {
          username: AccountCenterControlValue.Off,
          email: AccountCenterControlValue.Off,
          phone: AccountCenterControlValue.Off,
          password: AccountCenterControlValue.Off,
          social: AccountCenterControlValue.Off,
          mfa: AccountCenterControlValue.Edit,
        },
      },
      experienceSettings: {
        mfa: {
          factors: [MfaFactor.TOTP],
          policy: MfaPolicy.PromptAtSignInAndSignUp,
        },
      },
      verificationId: 'verification-record-id',
    });

    await waitFor(() => {
      expect(getByLabelText('Toggle switch')).not.toBeNull();
    });

    fireEvent.click(getByLabelText('Toggle switch'));

    await waitFor(() => {
      expect(mockUpdateMfaSettings).toHaveBeenCalledWith('access-token', 'verification-record-id', {
        skipMfaOnSignIn: false,
      });
    });
    expect((getByLabelText('Toggle switch') as HTMLInputElement).checked).toBe(true);
  });

  it('navigates to verified action after confirming disable without verification ID', async () => {
    mockGetMfaSettings.mockResolvedValue({ skipMfaOnSignIn: false });

    const { getByLabelText, getByText } = renderSecurity({
      accountCenterSettings: {
        fields: {
          username: AccountCenterControlValue.Off,
          email: AccountCenterControlValue.Off,
          phone: AccountCenterControlValue.Off,
          password: AccountCenterControlValue.Off,
          social: AccountCenterControlValue.Off,
          mfa: AccountCenterControlValue.Edit,
        },
      },
      experienceSettings: {
        mfa: {
          factors: [MfaFactor.TOTP],
          policy: MfaPolicy.PromptAtSignInAndSignUp,
        },
      },
    });

    await waitFor(() => {
      expect((getByLabelText('Toggle switch') as HTMLInputElement).checked).toBe(true);
    });

    fireEvent.click(getByLabelText('Toggle switch'));

    expect(getByText('account_center.security.turn_off_2_step_verification')).not.toBeNull();
    expect(getByText('account_center.security.disable_2_step_verification')).not.toBeNull();

    fireEvent.click(getByText('account_center.security.disable_2_step_verification'));

    expect(getByText('verified action page')).not.toBeNull();
    expect(sessionStorage.getPendingVerifiedAction()).toBe('disable-mfa');
    expect(mockUpdateMfaSettings).not.toHaveBeenCalled();
  });

  it('updates MFA settings and UI state after confirming disable', async () => {
    mockGetMfaSettings.mockResolvedValue({ skipMfaOnSignIn: false });
    mockUpdateMfaSettings.mockResolvedValue({ skipMfaOnSignIn: true });

    const { getByLabelText, getByText } = renderSecurity({
      accountCenterSettings: {
        fields: {
          username: AccountCenterControlValue.Off,
          email: AccountCenterControlValue.Off,
          phone: AccountCenterControlValue.Off,
          password: AccountCenterControlValue.Off,
          social: AccountCenterControlValue.Off,
          mfa: AccountCenterControlValue.Edit,
        },
      },
      experienceSettings: {
        mfa: {
          factors: [MfaFactor.TOTP],
          policy: MfaPolicy.PromptAtSignInAndSignUp,
        },
      },
      verificationId: 'verification-record-id',
    });

    await waitFor(() => {
      expect((getByLabelText('Toggle switch') as HTMLInputElement).checked).toBe(true);
    });

    fireEvent.click(getByLabelText('Toggle switch'));
    fireEvent.click(getByText('account_center.security.disable_2_step_verification'));

    await waitFor(() => {
      expect(mockUpdateMfaSettings).toHaveBeenCalledWith('access-token', 'verification-record-id', {
        skipMfaOnSignIn: true,
      });
    });
    expect((getByLabelText('Toggle switch') as HTMLInputElement).checked).toBe(false);
  });

  it('renders not-configured state for unconfigured MFA methods', async () => {
    const { queryAllByText, queryByText } = renderSecurity({
      accountCenterSettings: {
        fields: {
          username: AccountCenterControlValue.Off,
          email: AccountCenterControlValue.Off,
          phone: AccountCenterControlValue.Off,
          password: AccountCenterControlValue.Off,
          social: AccountCenterControlValue.Off,
          mfa: AccountCenterControlValue.Edit,
        },
      },
      experienceSettings: {
        mfa: {
          factors: [MfaFactor.TOTP, MfaFactor.WebAuthn, MfaFactor.BackupCode],
          policy: MfaPolicy.Mandatory,
        },
      },
    });

    await waitFor(() => {
      expect(queryByText('account_center.security.authenticator_app')).not.toBeNull();
    });

    expect(queryByText('account_center.security.passkeys')).not.toBeNull();
    expect(queryByText('account_center.security.authenticator_app')).not.toBeNull();
    expect(queryByText('account_center.security.backup_codes')).not.toBeNull();
    expect(queryAllByText('account_center.security.not_configured')).toHaveLength(3);
    expect(queryByText('account_center.security.configured')).toBeNull();
    expect(queryAllByText('account_center.security.add')).toHaveLength(3);
  });

  it('hides MFA section when disabled by Account Center settings or experience settings', () => {
    const { queryByText, unmount } = renderSecurity({
      accountCenterSettings: {
        fields: {
          username: AccountCenterControlValue.Off,
          email: AccountCenterControlValue.Off,
          phone: AccountCenterControlValue.Off,
          password: AccountCenterControlValue.Off,
          social: AccountCenterControlValue.Off,
          mfa: AccountCenterControlValue.Off,
        },
      },
      experienceSettings: {
        mfa: {
          factors: [MfaFactor.TOTP],
        },
      },
    });

    expect(queryByText('account_center.security.two_step_verification')).toBeNull();
    expect(mockGetMfaSettings).not.toHaveBeenCalled();
    expect(mockGetMfaVerifications).not.toHaveBeenCalled();

    unmount();
    jest.clearAllMocks();

    const hiddenMfaSection = renderSecurity({
      accountCenterSettings: {
        fields: {
          username: AccountCenterControlValue.Off,
          email: AccountCenterControlValue.Off,
          phone: AccountCenterControlValue.Off,
          password: AccountCenterControlValue.Off,
          social: AccountCenterControlValue.Off,
          mfa: AccountCenterControlValue.Edit,
        },
      },
      experienceSettings: {
        mfa: {
          factors: [],
        },
      },
    });

    expect(
      hiddenMfaSection.queryByText('account_center.security.two_step_verification')
    ).toBeNull();
    expect(mockGetMfaSettings).not.toHaveBeenCalled();
    expect(mockGetMfaVerifications).not.toHaveBeenCalled();
  });
});
/* eslint-enable max-lines */
