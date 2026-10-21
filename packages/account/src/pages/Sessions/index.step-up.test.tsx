import { LogtoAcr } from '@logto/schemas';
import { fireEvent, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import renderWithPageContext from '@ac/__mocks__/RenderWithPageContext';
import { getGrants, getSessions } from '@ac/apis/sessions';
import { sessionsRoute } from '@ac/constants/routes';
import { setupI18nForTesting } from '@ac/jest.setup';
import { accountStorage } from '@ac/utils/session-storage';

import Sessions from '.';

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

jest.mock('@ac/apis/sessions', () => ({
  getSessions: jest.fn(),
  revokeSession: jest.fn(),
  getGrants: jest.fn(),
  revokeGrant: jest.fn(),
}));

const mockGetSessions = getSessions as jest.MockedFunction<typeof getSessions>;
const mockGetGrants = getGrants as jest.MockedFunction<typeof getGrants>;

const createIdTokenClaims = (authTime = Math.floor(Date.now() / 1000) - 60) => ({
  acr: LogtoAcr.FirstFactor,
  auth_time: authTime,
});

const renderSessions = () =>
  renderWithPageContext(
    <Routes>
      <Route path={sessionsRoute} element={<Sessions />} />
    </Routes>,
    {
      initialEntries: [sessionsRoute],
      future: { v7_relativeSplatPath: true, v7_startTransition: true },
    }
  );

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
      expect(mockGetSessions).toHaveBeenCalledWith('access-token');
      expect(mockGetGrants).toHaveBeenCalledWith('access-token');
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
});
