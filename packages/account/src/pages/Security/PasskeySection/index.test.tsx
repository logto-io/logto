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

import { getMfaVerifications } from '../../../apis/mfa';
import MfaVerificationsProvider from '../MfaVerificationsProvider';

import PasskeySection from '.';

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
  getMfaVerifications: jest.fn(),
}));

const mockGetMfaVerifications = getMfaVerifications as jest.MockedFunction<
  typeof getMfaVerifications
>;

type RenderOptions = {
  mfaVerifications?: UserMfaVerificationResponse;
  passkeyControl?: AccountCenterControlValue;
  passkeySignInEnabled?: boolean;
};

const renderPasskeySection = ({
  mfaVerifications = [],
  passkeyControl = AccountCenterControlValue.Edit,
  passkeySignInEnabled = true,
}: RenderOptions = {}) => {
  mockGetMfaVerifications.mockResolvedValue(mfaVerifications);

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
});
