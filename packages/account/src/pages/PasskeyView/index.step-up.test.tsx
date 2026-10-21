import { MfaFactor, type UserMfaVerificationResponse } from '@logto/schemas';
import { fireEvent, waitFor } from '@testing-library/react';
import { HTTPError, type NormalizedOptions } from 'ky';
import { Route, Routes } from 'react-router-dom';

import renderWithPageContext from '@ac/__mocks__/RenderWithPageContext';
import { deleteMfaVerification, getMfaVerifications, updateWebAuthnName } from '@ac/apis/mfa';
import { passkeyManageRoute } from '@ac/constants/routes';
import { accountStorage } from '@ac/utils/session-storage';
import {
  completePendingStepUp,
  handlePendingStepUpOnPageLoad,
  startPendingStepUp,
  type PendingStepUpAction,
} from '@ac/utils/step-up';

import PasskeyView from '.';

const mockGetAccessToken = jest.fn().mockResolvedValue('access-token');
const mockGetIdTokenClaims = jest.fn();
const mockSignIn = jest.fn();

jest.mock('@ac/constants/env', () => ({
  __esModule: true,
  isDevFeaturesEnabled: true,
}));

jest.mock('@logto/react', () => ({
  useLogto: () => ({
    getAccessToken: mockGetAccessToken,
    getIdTokenClaims: mockGetIdTokenClaims,
    signIn: mockSignIn,
  }),
}));

jest.mock('@ac/apis/mfa', () => ({
  ...jest.requireActual('@ac/apis/mfa'),
  getMfaVerifications: jest.fn(),
  deleteMfaVerification: jest.fn(),
  updateWebAuthnName: jest.fn(),
}));

const mockGetMfaVerifications = getMfaVerifications as jest.MockedFunction<
  typeof getMfaVerifications
>;
const mockDeleteMfaVerification = deleteMfaVerification as jest.MockedFunction<
  typeof deleteMfaVerification
>;
const mockUpdateWebAuthnName = updateWebAuthnName as jest.MockedFunction<typeof updateWebAuthnName>;

const challenge =
  'Bearer error="insufficient_user_authentication", ' +
  'error_description="Recent user authentication is required", ' +
  'acr_values="urn:logto:acr:1fa", max_age="600"';

const createNotFoundError = () =>
  new HTTPError(
    {
      status: 404,
      headers: { get: () => null },
      json: async () => ({ code: 'entity.not_found', message: 'Not found.' }),
    } as unknown as Response,
    {} as Request,
    {} as NormalizedOptions
  );

const createChallengeError = () =>
  new HTTPError(
    {
      status: 401,
      headers: { get: (name: string) => (name === 'www-authenticate' ? challenge : null) },
    } as unknown as Response,
    {} as Request,
    {} as NormalizedOptions
  );

const passkey = {
  id: 'passkey-1',
  type: MfaFactor.WebAuthn,
  name: 'My passkey',
  agent: 'Chrome on macOS',
  createdAt: '2026-07-01T00:00:00.000Z',
  lastUsedAt: '2026-07-20T00:00:00.000Z',
} satisfies UserMfaVerificationResponse[number];

const renderPasskeyView = () =>
  renderWithPageContext(
    <Routes>
      <Route path={passkeyManageRoute} element={<PasskeyView />} />
    </Routes>,
    {
      initialEntries: [passkeyManageRoute],
      future: { v7_relativeSplatPath: true, v7_startTransition: true },
    }
  );

/** The state the restored route sees after a successful step-up callback. */
const prepareResumableStepUp = (action: PendingStepUpAction) => {
  startPendingStepUp(action, '/account/passkey/manage');
  handlePendingStepUpOnPageLoad({ pathname: '/account', search: '?code=code&state=state' });
  completePendingStepUp();
  handlePendingStepUpOnPageLoad({ pathname: '/account', search: '' });
};

describe('<PasskeyView /> OIDC step-up', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    window.sessionStorage.clear();
    mockGetAccessToken.mockResolvedValue('access-token');
    mockGetIdTokenClaims.mockResolvedValue({
      acr: 'urn:logto:acr:1fa',
      auth_time: Math.floor(Date.now() / 1000) - 60,
    });
    mockGetMfaVerifications.mockResolvedValue([passkey]);
    mockDeleteMfaVerification.mockResolvedValue(undefined);
    mockUpdateWebAuthnName.mockResolvedValue(undefined);
  });

  it('starts a step-up with the confirmed passkey when its removal is challenged', async () => {
    mockDeleteMfaVerification.mockRejectedValueOnce(createChallengeError());

    const { getAllByText, getByText } = renderPasskeyView();

    await waitFor(() => {
      expect(getByText('My passkey')).not.toBeNull();
    });
    fireEvent.click(getByText('action.remove'));
    fireEvent.click(getAllByText('action.remove').at(-1)!);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
    });
    expect(mockDeleteMfaVerification).toHaveBeenCalledWith('access-token', undefined, 'passkey-1');
    expect(accountStorage.pendingStepUp.get()).toMatchObject({
      action: { type: 'delete-passkey', id: 'passkey-1' },
      phase: 'authorizing',
    });
  });

  it('starts a step-up with the confirmed passkey name when its rename is challenged', async () => {
    mockUpdateWebAuthnName.mockRejectedValueOnce(createChallengeError());

    const { getByText } = renderPasskeyView();

    await waitFor(() => {
      expect(getByText('My passkey')).not.toBeNull();
    });
    fireEvent.click(getByText('action.edit'));

    // The confirmation modal is rendered in a portal outside the render container.
    const nameInput = await waitFor(() => {
      const input = document.querySelector('input[name="passkeyName"]');
      expect(input).not.toBeNull();
      return input!;
    });
    fireEvent.change(nameInput, { target: { value: 'Renamed passkey' } });
    fireEvent.click(getByText('action.save'));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
    });
    expect(mockUpdateWebAuthnName).toHaveBeenCalledWith(
      'access-token',
      undefined,
      'passkey-1',
      'Renamed passkey'
    );
    expect(accountStorage.pendingStepUp.get()).toMatchObject({
      action: { type: 'rename-passkey', id: 'passkey-1', name: 'Renamed passkey' },
      phase: 'authorizing',
    });
  });

  it('runs the resumed removal once and reloads the list', async () => {
    prepareResumableStepUp({ type: 'delete-passkey', id: 'passkey-1' });

    renderPasskeyView();

    await waitFor(() => {
      expect(mockDeleteMfaVerification).toHaveBeenCalledWith(
        'access-token',
        undefined,
        'passkey-1'
      );
      // The mount fetch is skipped; only the resumed action reloads the list.
      expect(mockGetMfaVerifications).toHaveBeenCalledTimes(1);
    });

    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('runs the resumed rename once and reloads the list', async () => {
    prepareResumableStepUp({ type: 'rename-passkey', id: 'passkey-1', name: 'Renamed passkey' });

    renderPasskeyView();

    await waitFor(() => {
      expect(mockUpdateWebAuthnName).toHaveBeenCalledWith(
        'access-token',
        undefined,
        'passkey-1',
        'Renamed passkey'
      );
      // The mount fetch is skipped; only the resumed action reloads the list.
      expect(mockGetMfaVerifications).toHaveBeenCalledTimes(1);
    });

    expect(mockUpdateWebAuthnName).toHaveBeenCalledTimes(1);
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('reloads the list when the resumed action fails', async () => {
    prepareResumableStepUp({ type: 'delete-passkey', id: 'passkey-1' });
    mockDeleteMfaVerification.mockRejectedValue(createNotFoundError());

    const { getByText } = renderPasskeyView();

    await waitFor(() => {
      expect(getByText('My passkey')).not.toBeNull();
    });

    expect(mockGetMfaVerifications).toHaveBeenCalledTimes(1);
    expect(mockDeleteMfaVerification).toHaveBeenCalledTimes(1);
    expect(mockSignIn).not.toHaveBeenCalled();
  });
});
