import {
  AccountCenterControlValue,
  LogtoAcr,
  type AccountPersonalAccessTokenResponse,
} from '@logto/schemas';
import { fireEvent, waitFor } from '@testing-library/react';
import { HTTPError, type NormalizedOptions } from 'ky';
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
import { accountStorage } from '@ac/utils/session-storage';

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

const activeToken = {
  name: 'ci-runner',
  createdAt: new Date(2026, 6, 1, 12).getTime(),
  expiresAt: new Date(2027, 6, 1, 12).getTime(),
} satisfies AccountPersonalAccessTokenResponse;

const renderSection = () =>
  renderWithPageContext(
    <Routes>
      <Route path={securityRoute} element={<PersonalAccessTokensSection />} />
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
            personalAccessToken: AccountCenterControlValue.Edit,
          },
        },
      },
    }
  );

describe('<PersonalAccessTokensSection /> OIDC step-up', () => {
  beforeAll(async () => {
    await setupI18nForTesting({
      translation: {
        action: { cancel: 'Cancel', create: 'Create', save: 'Save' },
        account_center: {
          security: {
            personal_access_tokens: {
              title: 'Personal access tokens',
              description: 'Manage personal access tokens.',
              create: 'Create new token',
              rename: 'Rename',
              revoke: 'Revoke',
              loading: 'Loading...',
              empty: 'No personal access tokens.',
              load_failed: 'Failed to load personal access tokens.',
              retry: 'Try again',
              create_modal_title: 'Create personal access token',
              create_modal_description: 'Give your token a name.',
              token_name: 'Token name',
              token_name_placeholder: 'My token',
              expiration: 'Expiration',
              expiration_days: '{{count}} days',
              created_modal_title: 'Personal access token created',
              show_once_warning: 'Copy it now.',
              copied: 'Copied.',
              rename_modal_title: 'Rename personal access token',
              rename_modal_description: 'Enter a new name.',
              renamed: 'Renamed.',
              revoke_confirmation_title: 'Revoke personal access token?',
              revoke_confirmation_description: 'This cannot be undone.',
              revoked: 'Revoked.',
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
    mockGetPersonalAccessTokens.mockResolvedValue([activeToken]);
    mockCreatePersonalAccessToken.mockResolvedValue({
      name: 'deploy-bot',
      value: 'pat_secret_123',
      createdAt: Date.now(),
      expiresAt: Date.now() + 90 * 24 * 60 * 60 * 1000,
    });
    mockRenamePersonalAccessToken.mockResolvedValue({
      ...activeToken,
      name: 'ci-runner-renamed',
    });
    mockRevokePersonalAccessToken.mockResolvedValue(undefined);
  });

  it('calls the Account API directly with the access token when the context is fresh', async () => {
    const { getByPlaceholderText, getByRole, getByText } = renderSection();

    await waitFor(() => {
      expect(getByText('ci-runner')).not.toBeNull();
    });

    fireEvent.click(getByRole('button', { name: 'Create new token' }));
    fireEvent.change(getByPlaceholderText('My token'), { target: { value: 'deploy-bot' } });
    fireEvent.click(getByText('Create'));

    await waitFor(() => {
      expect(mockCreatePersonalAccessToken).toHaveBeenCalledWith(
        'access-token',
        expect.objectContaining({ name: 'deploy-bot' })
      );
    });
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('starts a step-up before creating when the context is stale', async () => {
    mockGetIdTokenClaims.mockResolvedValue(
      createIdTokenClaims(Math.floor(Date.now() / 1000) - 600)
    );

    const { getByPlaceholderText, getByRole, getByText } = renderSection();

    await waitFor(() => {
      expect(getByText('ci-runner')).not.toBeNull();
    });

    fireEvent.click(getByRole('button', { name: 'Create new token' }));
    fireEvent.change(getByPlaceholderText('My token'), { target: { value: 'deploy-bot' } });
    fireEvent.click(getByText('Create'));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
    });
    expect(mockCreatePersonalAccessToken).not.toHaveBeenCalled();
    expect(mockSignIn).toHaveBeenCalledWith({
      redirectUri: 'http://localhost/account',
      clearTokens: false,
      extraParams: { acr_values: 'urn:logto:acr:1fa', max_age: '540' },
    });
    expect(accountStorage.pendingStepUp.get()).toMatchObject({
      action: { type: 'create-personal-access-token', name: 'deploy-bot', expiryDays: 90 },
      phase: 'authorizing',
    });
  });

  it('keeps the create confirmation loading while the challenge starts a step-up', async () => {
    mockCreatePersonalAccessToken.mockRejectedValue(createChallengeError());

    const { getByPlaceholderText, getByRole, getByText } = renderSection();

    await waitFor(() => {
      expect(getByText('ci-runner')).not.toBeNull();
    });

    fireEvent.click(getByRole('button', { name: 'Create new token' }));
    fireEvent.change(getByPlaceholderText('My token'), { target: { value: 'deploy-bot' } });
    fireEvent.click(getByText('Create'));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
    });
    expect(getByText('Create').closest('button')!.disabled).toBe(true);
  });

  it('keeps the rename confirmation loading while the challenge starts a step-up', async () => {
    mockRenamePersonalAccessToken.mockRejectedValue(createChallengeError());

    const { getAllByRole, getByDisplayValue, getByText } = renderSection();

    await waitFor(() => {
      expect(getByText('ci-runner')).not.toBeNull();
    });

    fireEvent.click(getAllByRole('button', { name: 'Rename' })[0]!);
    fireEvent.change(getByDisplayValue('ci-runner'), {
      target: { value: 'ci-runner-renamed' },
    });
    fireEvent.click(getByText('Save'));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
    });
    expect(getByText('Save').closest('button')!.disabled).toBe(true);
  });

  it('keeps the revoke confirmation loading while the challenge starts a step-up', async () => {
    mockRevokePersonalAccessToken.mockRejectedValue(createChallengeError());

    const { getAllByText, getByText } = renderSection();

    await waitFor(() => {
      expect(getByText('ci-runner')).not.toBeNull();
    });

    fireEvent.click(getAllByText('Revoke')[0]!);
    fireEvent.click(getAllByText('Revoke').at(-1)!);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
    });

    const confirmButton = getAllByText('Revoke').at(-1)?.closest('button');

    expect(confirmButton!.disabled).toBe(true);
  });
});
