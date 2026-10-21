import { LogtoAcr } from '@logto/schemas';
import { fireEvent, waitFor } from '@testing-library/react';
import { HTTPError, type NormalizedOptions } from 'ky';
import { Route, Routes } from 'react-router-dom';

import renderWithPageContext from '@ac/__mocks__/RenderWithPageContext';
import { getGrants, getSessions, revokeGrant, revokeSession } from '@ac/apis/sessions';
import { sessionsRoute, verifiedActionRoute } from '@ac/constants/routes';
import { setupI18nForTesting } from '@ac/jest.setup';
import { accountStorage } from '@ac/utils/session-storage';
import {
  completePendingStepUp,
  handlePendingStepUpOnPageLoad,
  startPendingStepUp,
  type PendingStepUpAction,
} from '@ac/utils/step-up';

import Sessions from '.';
import type { AccountSession, AccountGrant } from './utils';

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

jest.mock('@ac/apis/sessions', () => ({
  getSessions: jest.fn(),
  revokeSession: jest.fn(),
  getGrants: jest.fn(),
  revokeGrant: jest.fn(),
}));

const mockGetSessions = getSessions as jest.MockedFunction<typeof getSessions>;
const mockGetGrants = getGrants as jest.MockedFunction<typeof getGrants>;
const mockRevokeSession = revokeSession as jest.MockedFunction<typeof revokeSession>;
const mockRevokeGrant = revokeGrant as jest.MockedFunction<typeof revokeGrant>;

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

const currentSession = {
  payload: {
    exp: 1_900_000_000,
    iat: 1_800_000_000,
    jti: 'current-session-jti',
    uid: 'current-session',
    kind: 'Session',
    loginTs: 1_800_000_000,
    accountId: 'user-id',
  },
  lastSubmission: null,
  clientId: 'account-center',
  accountId: 'user-id',
  expiresAt: 1_900_000_000,
  isCurrent: true,
} satisfies AccountSession;

const otherSession = {
  payload: {
    exp: 1_900_000_000,
    iat: 1_800_000_000,
    jti: 'other-session-jti',
    uid: 'other-session',
    kind: 'Session',
    loginTs: 1_800_000_000,
    accountId: 'user-id',
  },
  lastSubmission: null,
  clientId: 'other-app',
  accountId: 'user-id',
  expiresAt: 1_900_000_000,
  isCurrent: false,
} satisfies AccountSession;

const createGrant = (id: string) =>
  ({
    id,
    payload: {
      exp: 1_900_000_000,
      iat: 1_800_000_000,
      jti: `${id}-jti`,
      kind: 'Grant',
      clientId: 'app-id',
      accountId: 'user-id',
    },
    expiresAt: 1_900_000_000,
    application: { id: 'app-id', name: 'Third-party app' },
  }) satisfies AccountGrant;

const grants = [createGrant('grant-1'), createGrant('grant-2')];

const renderSessions = () =>
  renderWithPageContext(
    <Routes>
      <Route path={sessionsRoute} element={<Sessions />} />
      <Route path={verifiedActionRoute} element={<div>verified action page</div>} />
    </Routes>,
    {
      initialEntries: [sessionsRoute],
      future: { v7_relativeSplatPath: true, v7_startTransition: true },
    }
  );

/** The state the restored route sees after a successful step-up callback. */
const prepareResumableStepUp = (action: PendingStepUpAction) => {
  startPendingStepUp(action, '/account/sessions');
  handlePendingStepUpOnPageLoad({ pathname: '/account', search: '?code=code&state=state' });
  completePendingStepUp();
  handlePendingStepUpOnPageLoad({ pathname: '/account', search: '' });
};

describe('<Sessions /> OIDC step-up', () => {
  beforeAll(async () => {
    await setupI18nForTesting({
      translation: {
        account_center: {
          security: { manage: 'Manage' },
          sessions: {
            loading: 'Loading...',
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
    mockGetSessions.mockResolvedValue({ sessions: [] });
    mockGetGrants.mockResolvedValue({ grants: [] });
  });

  it('loads the protected lists on mount when the ID token has a fresh 1fa context', async () => {
    const { queryByRole } = renderSessions();

    await waitFor(() => {
      expect(mockGetSessions).toHaveBeenCalledWith('access-token', undefined);
      expect(mockGetGrants).toHaveBeenCalledWith('access-token', undefined);
    });
    expect(queryByRole('button', { name: 'Manage' })).toBeNull();
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('starts a step-up from Manage without a throwaway API request when the context is stale', async () => {
    mockGetIdTokenClaims.mockResolvedValue(
      createIdTokenClaims(Math.floor(Date.now() / 1000) - 600)
    );

    const { getByRole } = renderSessions();

    await waitFor(() => {
      expect(getByRole('button', { name: 'Manage' })).not.toBeNull();
    });
    fireEvent.click(getByRole('button', { name: 'Manage' }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
    });
    expect(mockGetSessions).not.toHaveBeenCalled();
    expect(mockGetGrants).not.toHaveBeenCalled();
    expect(mockSignIn).toHaveBeenCalledWith({
      redirectUri: 'http://localhost/account',
      clearTokens: false,
      extraParams: { acr_values: 'urn:logto:acr:1fa', max_age: '540' },
    });
    expect(accountStorage.pendingStepUp.get()).toMatchObject({
      action: { type: 'load-sessions' },
      phase: 'authorizing',
    });
  });

  it('starts a step-up with the confirmed session when its revocation is challenged', async () => {
    mockGetSessions.mockResolvedValue({ sessions: [currentSession, otherSession] });
    mockRevokeSession.mockRejectedValueOnce(createChallengeError());

    const { getAllByText, getByText } = renderSessions();

    await waitFor(() => {
      expect(getByText('account_center.sessions.revoke_session')).not.toBeNull();
    });
    fireEvent.click(getByText('account_center.sessions.revoke_session'));
    fireEvent.click(getAllByText('account_center.sessions.revoke_session').at(-1)!);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
    });
    expect(mockRevokeSession).toHaveBeenCalledWith('access-token', undefined, 'other-session');
    expect(accountStorage.pendingStepUp.get()).toMatchObject({
      action: { type: 'revoke-session', sessionId: 'other-session' },
      phase: 'authorizing',
    });
  });

  it('runs the resumed session revocation once and reloads the list', async () => {
    mockGetSessions.mockResolvedValue({ sessions: [currentSession] });
    prepareResumableStepUp({ type: 'revoke-session', sessionId: 'other-session' });

    const { unmount } = renderSessions();

    await waitFor(() => {
      expect(mockRevokeSession).toHaveBeenCalledWith('access-token', undefined, 'other-session');
      expect(mockGetSessions).toHaveBeenCalledWith('access-token', undefined);
    });

    // A second mount, as after a refresh of the restored route, does not run it again.
    unmount();
    renderSessions();
    await waitFor(() => {
      expect(mockGetSessions).toHaveBeenCalledTimes(2);
    });

    expect(mockRevokeSession).toHaveBeenCalledTimes(1);
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('starts a step-up with the confirmed grant when its revocation is challenged', async () => {
    mockGetGrants.mockResolvedValue({ grants });
    mockRevokeGrant.mockRejectedValueOnce(createChallengeError());

    const { getAllByText, getByText } = renderSessions();

    await waitFor(() => {
      expect(getByText('account_center.sessions.revoke_grant')).not.toBeNull();
    });
    fireEvent.click(getByText('account_center.sessions.revoke_grant'));
    fireEvent.click(getAllByText('account_center.sessions.revoke_grant').at(-1)!);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
    });
    expect(mockRevokeGrant).toHaveBeenCalledWith('access-token', undefined, 'grant-1');
    expect(mockRevokeGrant).toHaveBeenCalledWith('access-token', undefined, 'grant-2');
    expect(accountStorage.pendingStepUp.get()).toMatchObject({
      action: { type: 'revoke-grant', applicationId: 'app-id', grantIds: ['grant-1', 'grant-2'] },
      phase: 'authorizing',
    });
  });

  it('runs the resumed grant revocation once and reloads the list', async () => {
    prepareResumableStepUp({
      type: 'revoke-grant',
      applicationId: 'app-id',
      grantIds: ['grant-1', 'grant-2'],
    });

    const { unmount } = renderSessions();

    await waitFor(() => {
      expect(mockRevokeGrant).toHaveBeenCalledTimes(2);
      expect(mockGetGrants).toHaveBeenCalledWith('access-token', undefined);
    });

    unmount();
    renderSessions();
    await waitFor(() => {
      expect(mockGetGrants).toHaveBeenCalledTimes(2);
    });

    expect(mockRevokeGrant).toHaveBeenCalledTimes(2);
    expect(mockSignIn).not.toHaveBeenCalled();
  });
});
