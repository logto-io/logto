import {
  AccountCenterControlValue,
  type AccountCreatedPersonalAccessTokenResponse,
  type AccountPersonalAccessTokenResponse,
} from '@logto/schemas';
import { fireEvent, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import renderWithPageContext, {
  mockAccountCenterSettings,
} from '@ac/__mocks__/RenderWithPageContext';
import {
  createPersonalAccessToken,
  getPersonalAccessTokens,
  renamePersonalAccessToken,
  revokePersonalAccessToken,
} from '@ac/apis/personal-access-tokens';
import { securityRoute } from '@ac/constants/routes';
import { setupI18nForTesting } from '@ac/jest.setup';

import PersonalAccessTokensSection from '.';

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

const createIdTokenClaims = () => ({
  acr: 'urn:logto:acr:1fa',
  auth_time: Math.floor(Date.now() / 1000) - 60,
});

jest.mock('@ac/apis/personal-access-tokens', () => ({
  getPersonalAccessTokens: jest.fn(),
  createPersonalAccessToken: jest.fn(),
  renamePersonalAccessToken: jest.fn(),
  revokePersonalAccessToken: jest.fn(),
}));

const mockGetPersonalAccessTokens = getPersonalAccessTokens as jest.MockedFunction<
  typeof getPersonalAccessTokens
>;
const mockCreatePersonalAccessToken = createPersonalAccessToken as jest.MockedFunction<
  typeof createPersonalAccessToken
>;
const mockRenamePersonalAccessToken = renamePersonalAccessToken as jest.MockedFunction<
  typeof renamePersonalAccessToken
>;
const mockRevokePersonalAccessToken = revokePersonalAccessToken as jest.MockedFunction<
  typeof revokePersonalAccessToken
>;

const activeToken = {
  name: 'ci-runner',
  createdAt: new Date(2026, 6, 1, 12).getTime(),
  expiresAt: new Date(2027, 6, 1, 12).getTime(),
} satisfies AccountPersonalAccessTokenResponse;

const expiredToken = {
  name: 'old-script',
  createdAt: new Date(2025, 0, 1, 12).getTime(),
  expiresAt: new Date(2025, 3, 1, 12).getTime(),
} satisfies AccountPersonalAccessTokenResponse;

const legacyNeverExpiringToken = {
  name: 'staff-token',
  createdAt: new Date(2025, 5, 1, 12).getTime(),
  expiresAt: null,
} satisfies AccountPersonalAccessTokenResponse;

const renderSection = (
  options: {
    control?: AccountCenterControlValue;
    setToast?: jest.Mock;
  } = {}
) => {
  const { control = AccountCenterControlValue.Edit, setToast = jest.fn() } = options;

  return renderWithPageContext(
    <Routes>
      <Route path={securityRoute} element={<PersonalAccessTokensSection />} />
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
            personalAccessToken: control,
          },
        },
      },
    }
  );
};

describe('<PersonalAccessTokensSection />', () => {
  beforeAll(async () => {
    await setupI18nForTesting({
      translation: {
        action: {
          cancel: 'Cancel',
          create: 'Create',
          copy: 'Copy',
          done: 'Done',
          save: 'Save',
        },
        account_center: {
          security: {
            personal_access_tokens: {
              title: 'Personal access tokens',
              description:
                'Use personal access tokens to authenticate with APIs on your behalf. They remain active until they expire or you revoke them, even if you sign out or change your password.',
              create: 'Create new token',
              created_at: 'Created {{date}}',
              expires_on: 'Expires on {{date}}',
              expired_on: 'Expired on {{date}}',
              expired: 'Expired',
              never_expires: 'Never expires',
              never_expires_warning:
                'This token has no expiration date. For better security, create a new token with an expiration date and revoke this one.',
              rename: 'Rename',
              revoke: 'Revoke',
              loading: 'Loading...',
              empty: 'No personal access tokens.',
              load_failed: 'Failed to load personal access tokens. Please try again.',
              retry: 'Try again',
              create_modal_title: 'Create personal access token',
              create_modal_description:
                'Give your token a descriptive name and choose an expiration period.',
              token_name: 'Token name',
              token_name_placeholder: 'My token',
              expiration: 'Expiration',
              expiration_days: '{{count}} days',
              created_modal_title: 'Personal access token created',
              show_once_warning:
                "You won't be able to see this token again. Copy it now and store it in a safe place.",
              copied: 'Personal access token copied.',
              rename_modal_title: 'Rename personal access token',
              rename_modal_description: 'Enter a new name for this personal access token.',
              renamed: 'Personal access token renamed successfully.',
              revoke_confirmation_title: 'Revoke personal access token?',
              revoke_confirmation_description:
                'Any applications or scripts using "{{name}}" will immediately lose access. Are you sure you want to continue?',
              revoked: 'Personal access token revoked successfully.',
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
    mockGetPersonalAccessTokens.mockResolvedValue([
      activeToken,
      expiredToken,
      legacyNeverExpiringToken,
    ]);
    mockCreatePersonalAccessToken.mockResolvedValue({
      name: 'deploy-bot',
      value: 'pat_secret_123',
      createdAt: Date.now(),
      expiresAt: Date.now() + 90 * 24 * 60 * 60 * 1000,
    } satisfies AccountCreatedPersonalAccessTokenResponse);
    mockRenamePersonalAccessToken.mockResolvedValue({
      ...activeToken,
      name: 'ci-runner-renamed',
    });
    mockRevokePersonalAccessToken.mockResolvedValue(undefined);
    window.sessionStorage.clear();
  });

  it('does not render or load tokens when permission is off', () => {
    const { queryByText } = renderSection({ control: AccountCenterControlValue.Off });

    expect(queryByText('Personal access tokens')).toBeNull();
    expect(mockGetPersonalAccessTokens).not.toHaveBeenCalled();
  });

  it('renders read-only list with expired and never-expires states without edit buttons', async () => {
    const { getByText, queryByRole } = renderSection({
      control: AccountCenterControlValue.ReadOnly,
    });

    await waitFor(() => {
      expect(getByText('ci-runner')).toBeTruthy();
    });

    expect(
      getByText(
        'Use personal access tokens to authenticate with APIs on your behalf. They remain active until they expire or you revoke them, even if you sign out or change your password.'
      )
    ).toBeTruthy();
    expect(getByText('Expires on Jul 1, 2027')).toBeTruthy();
    expect(getByText('old-script')).toBeTruthy();
    expect(getByText('Expired on Apr 1, 2025')).toBeTruthy();
    expect(getByText('Expired')).toBeTruthy();
    expect(getByText('staff-token')).toBeTruthy();
    expect(getByText('Never expires')).toBeTruthy();
    expect(
      getByText(
        'This token has no expiration date. For better security, create a new token with an expiration date and revoke this one.'
      )
    ).toBeTruthy();

    expect(queryByRole('button', { name: 'Create new token' })).toBeNull();
    expect(queryByRole('button', { name: 'Rename' })).toBeNull();
    expect(queryByRole('button', { name: 'Revoke' })).toBeNull();
  });

  it('creates a token and displays the show-once dialog with copy', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods -- Mock navigator.clipboard in JSDOM.
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    const setToast = jest.fn();

    const { getByPlaceholderText, getByRole, getByText, queryByText } = renderSection({
      setToast,
    });

    await waitFor(() => {
      expect(getByText('ci-runner')).toBeTruthy();
    });

    fireEvent.click(getByRole('button', { name: 'Create new token' }));
    expect(getByText('Create personal access token')).toBeTruthy();

    fireEvent.change(getByPlaceholderText('My token'), { target: { value: 'deploy-bot' } });
    fireEvent.click(getByText('Create'));

    await waitFor(() => {
      expect(mockCreatePersonalAccessToken).toHaveBeenCalledWith(
        'access-token',
        expect.objectContaining({ name: 'deploy-bot' })
      );
    });

    expect(getByText('Personal access token created')).toBeTruthy();
    expect(
      getByText(
        "You won't be able to see this token again. Copy it now and store it in a safe place."
      )
    ).toBeTruthy();
    expect(getByText('pat_secret_123')).toBeTruthy();

    fireEvent.click(getByText('Copy'));
    expect(writeText).toHaveBeenCalledWith('pat_secret_123');
    await waitFor(() => {
      expect(setToast).toHaveBeenCalledWith('Personal access token copied.');
    });

    // The token is shown only once, so Esc must not dismiss the dialog.
    fireEvent.keyDown(getByText('pat_secret_123'), { key: 'Escape', keyCode: 27 });
    expect(getByText('pat_secret_123')).toBeTruthy();

    fireEvent.click(getByText('Done'));
    await waitFor(() => {
      expect(queryByText('pat_secret_123')).toBeNull();
    });
  });

  it('renames and revokes a token', async () => {
    const setToast = jest.fn();
    const { getAllByRole, getAllByText, getByDisplayValue, getByText, queryByText } = renderSection(
      {
        setToast,
      }
    );

    await waitFor(() => {
      expect(getByText('ci-runner')).toBeTruthy();
    });

    fireEvent.click(getAllByRole('button', { name: 'Rename' })[0]!);
    expect(getByText('Rename personal access token')).toBeTruthy();

    fireEvent.change(getByDisplayValue('ci-runner'), { target: { value: 'ci-runner-renamed' } });
    fireEvent.click(getByText('Save'));

    await waitFor(() => {
      expect(mockRenamePersonalAccessToken).toHaveBeenCalledWith('access-token', {
        currentName: 'ci-runner',
        name: 'ci-runner-renamed',
      });
    });
    expect(setToast).toHaveBeenCalledWith('Personal access token renamed successfully.');

    fireEvent.click(getAllByRole('button', { name: 'Revoke' })[0]!);
    expect(getByText('Revoke personal access token?')).toBeTruthy();

    const revokeButtons = getAllByText('Revoke');
    fireEvent.click(revokeButtons.at(-1)!);

    await waitFor(() => {
      expect(mockRevokePersonalAccessToken).toHaveBeenCalledWith('access-token', 'ci-runner');
    });
    expect(queryByText('ci-runner')).toBeNull();
    expect(setToast).toHaveBeenCalledWith('Personal access token revoked successfully.');
  });
});
