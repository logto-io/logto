import { AccountCenterControlValue, LogtoAcr, type UserProfileResponse } from '@logto/schemas';
import { fireEvent, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import renderWithPageContext, {
  mockAccountCenterSettings,
  mockUserInfo,
} from '@ac/__mocks__/RenderWithPageContext';
import { updatePassword } from '@ac/apis/account';
import { passwordRoute, passwordSuccessRoute } from '@ac/constants/routes';
import { accountStorage } from '@ac/utils/session-storage';

import Password from '.';

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

jest.mock('@ac/apis/account', () => ({
  updatePassword: jest.fn(),
}));

const createIdTokenClaims = (authTime = Math.floor(Date.now() / 1000) - 60) => ({
  acr: LogtoAcr.FirstFactor,
  auth_time: authTime,
});

const renderPassword = (userInfo: Partial<UserProfileResponse> = mockUserInfo) =>
  renderWithPageContext(
    <Routes>
      <Route path={passwordRoute} element={<Password />} />
      <Route path={passwordSuccessRoute} element={<div>Password success page</div>} />
    </Routes>,
    {
      initialEntries: [passwordRoute],
      future: { v7_relativeSplatPath: true, v7_startTransition: true },
    },
    {
      pageContext: {
        accountCenterSettings: {
          ...mockAccountCenterSettings,
          fields: {
            ...mockAccountCenterSettings.fields,
            password: AccountCenterControlValue.Edit,
          },
        },
        userInfo,
      },
    }
  );

const submitPassword = (
  container: HTMLElement,
  getByText: ReturnType<typeof renderPassword>['getByText']
) => {
  fireEvent.change(container.querySelector('input[name="newPassword"]')!, {
    target: { value: 'password123' },
  });
  fireEvent.change(container.querySelector('input[name="confirmPassword"]')!, {
    target: { value: 'password123' },
  });
  fireEvent.click(getByText('action.save_password'));
};

describe('<Password /> OIDC step-up', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    window.sessionStorage.clear();
    mockGetAccessToken.mockResolvedValue('access-token');
    mockSignIn.mockResolvedValue(undefined);
    jest.mocked(updatePassword).mockResolvedValue(undefined);
  });

  it('starts a proactive step-up with max_age=300 instead of the legacy verification UI', async () => {
    mockGetIdTokenClaims.mockResolvedValue(
      createIdTokenClaims(Math.floor(Date.now() / 1000) - 301)
    );

    const { queryByText } = renderPassword();

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
    });
    expect(mockSignIn).toHaveBeenCalledWith({
      redirectUri: 'http://localhost/account',
      clearTokens: false,
      extraParams: { acr_values: LogtoAcr.FirstFactor, max_age: '300' },
    });
    expect(accountStorage.pendingStepUp.get()).toMatchObject({
      action: { type: 'enter-subpage' },
      phase: 'authorizing',
    });
    expect(queryByText('account_center.password.title')).toBeNull();
    expect(queryByText('account_center.verification.title')).toBeNull();
  });

  it('submits with the access token only when the context is fresh', async () => {
    mockGetIdTokenClaims.mockResolvedValue(createIdTokenClaims());

    const { getByText, container } = renderPassword();

    await waitFor(() => {
      expect(getByText('account_center.password.title')).toBeTruthy();
    });
    submitPassword(container, getByText);

    await waitFor(() => {
      expect(updatePassword).toHaveBeenCalledWith('access-token', {
        password: 'password123',
      });
    });
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('skips the entry step-up for a user who can set the initial password', async () => {
    mockGetIdTokenClaims.mockResolvedValue(
      createIdTokenClaims(Math.floor(Date.now() / 1000) - 301)
    );

    const { getByText, container } = renderPassword({
      ...mockUserInfo,
      hasPassword: false,
      primaryEmail: undefined,
      primaryPhone: undefined,
      hasSecurityVerificationMethod: false,
    });

    await waitFor(() => {
      expect(getByText('account_center.password.title')).toBeTruthy();
    });
    expect(mockSignIn).not.toHaveBeenCalled();

    submitPassword(container, getByText);

    await waitFor(() => {
      expect(updatePassword).toHaveBeenCalledWith('access-token', {
        password: 'password123',
      });
    });
  });
});
