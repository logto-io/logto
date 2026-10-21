import { LogtoAcr } from '@logto/schemas';
import { act, renderHook, waitFor } from '@testing-library/react';

import { accountStorage } from '@ac/utils/session-storage';
import {
  completePendingStepUp,
  handlePendingStepUpOnPageLoad,
  startPendingStepUp,
} from '@ac/utils/step-up';

import useStepUp, { useIdentityProof, useStepUpEntry } from './use-step-up';

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

const createIdTokenClaims = (authTime = Math.floor(Date.now() / 1000) - 60) => ({
  acr: LogtoAcr.FirstFactor,
  auth_time: authTime,
});

const createStaleIdTokenClaims = () => createIdTokenClaims(Math.floor(Date.now() / 1000) - 600);

describe('useStepUpEntry', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    window.sessionStorage.clear();
    mockSignIn.mockResolvedValue(undefined);
    mockGetIdTokenClaims.mockResolvedValue(createIdTokenClaims());
  });

  it('renders the page once the ID token has a fresh 1fa context', async () => {
    const { result } = renderHook(() => useStepUpEntry({ enabled: true }));

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('starts a step-up with the standalone subpage max_age when the context is stale', async () => {
    mockGetIdTokenClaims.mockResolvedValue(
      createIdTokenClaims(Math.floor(Date.now() / 1000) - 301)
    );

    const { result } = renderHook(() => useStepUpEntry({ enabled: true }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
    });
    expect(mockSignIn).toHaveBeenCalledWith({
      redirectUri: 'http://localhost/account',
      clearTokens: false,
      extraParams: {
        acr_values: LogtoAcr.FirstFactor,
        max_age: '300',
      },
    });
    expect(accountStorage.pendingStepUp.get()).toMatchObject({
      action: { type: 'enter-subpage' },
      phase: 'authorizing',
    });
    expect(result.current.isReady).toBe(false);
  });

  it('skips the check for a flow that is allowed without verification', async () => {
    const { result } = renderHook(() => useStepUpEntry({ enabled: true, skip: true }));

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });
    expect(mockGetIdTokenClaims).not.toHaveBeenCalled();
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('does not check or step up when the page is disabled', async () => {
    const { result } = renderHook(() => useStepUpEntry({ enabled: false }));

    expect(result.current).toEqual({ isReady: false, isChecking: false, hasFailed: false });
    expect(mockGetIdTokenClaims).not.toHaveBeenCalled();
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('reports a failure instead of looping when a completed step-up is still stale', async () => {
    startPendingStepUp({ type: 'enter-subpage' }, '/account/password');
    handlePendingStepUpOnPageLoad({ pathname: '/account', search: '?code=code&state=state' });
    completePendingStepUp();
    handlePendingStepUpOnPageLoad({ pathname: '/account/password', search: '' });
    mockGetIdTokenClaims.mockResolvedValue(createStaleIdTokenClaims());

    const { result } = renderHook(() => useStepUpEntry({ enabled: true }));

    await waitFor(() => {
      expect(result.current.hasFailed).toBe(true);
    });
    expect(mockSignIn).not.toHaveBeenCalled();
  });
});

describe('useIdentityProof', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockGetIdTokenClaims.mockResolvedValue(createIdTokenClaims());
  });

  it('accepts a 1fa context within the Account API freshness window', async () => {
    const { result } = renderHook(() => useIdentityProof());

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });
  });

  it('reports a stale context and re-reads the ID token at action time', async () => {
    mockGetIdTokenClaims.mockResolvedValue(createStaleIdTokenClaims());

    const { result } = renderHook(() => useIdentityProof());

    await waitFor(() => {
      expect(result.current.isReady).toBe(false);
    });

    mockGetIdTokenClaims.mockResolvedValue(createIdTokenClaims());

    await act(async () => {
      await expect(result.current.checkIdentityProof()).resolves.toBe(true);
    });
    expect(result.current.isReady).toBe(true);
  });
});

describe('useStepUp', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    window.sessionStorage.clear();
    mockSignIn.mockResolvedValue(undefined);
  });

  it('starts a proactive step-up with the default freshness max_age', async () => {
    const { result } = renderHook(() => useStepUp());

    await act(async () => {
      await expect(result.current.startStepUp({ type: 'remove-username' })).resolves.toBe(true);
    });
    expect(mockSignIn).toHaveBeenCalledWith({
      redirectUri: 'http://localhost/account',
      clearTokens: false,
      extraParams: { acr_values: LogtoAcr.FirstFactor, max_age: '540' },
    });
  });

  it('uses the challenge acr_values and max_age when an Account API request is challenged', async () => {
    const challengeError = {
      response: {
        status: 401,
        headers: {
          get: (name: string) =>
            name === 'www-authenticate'
              ? 'Bearer error="insufficient_user_authentication", acr_values="urn:logto:acr:mfa", max_age="120"'
              : null,
        },
      },
    };
    // The helper checks `instanceof HTTPError`, so build a real one.
    const { HTTPError } = await import('ky');
    const error = new HTTPError(
      challengeError.response as unknown as Response,
      {} as Request,
      {} as never
    );
    const { result } = renderHook(() => useStepUp());

    await act(async () => {
      await expect(
        result.current.requestStepUp(
          error,
          { type: 'enter-subpage' },
          {
            route: '/account/social/google-web',
          }
        )
      ).resolves.toBe(true);
    });
    expect(mockSignIn).toHaveBeenCalledWith({
      redirectUri: 'http://localhost/account',
      clearTokens: false,
      extraParams: { acr_values: 'urn:logto:acr:mfa', max_age: '120' },
    });
    expect(accountStorage.pendingStepUp.get()).toMatchObject({
      route: '/account/social/google-web',
    });
    expect(accountStorage.routeRestore.get()).toBe('/account/social/google-web');
  });

  it('does not step up again for a resumed action', async () => {
    const { result } = renderHook(() => useStepUp());

    await act(async () => {
      await expect(
        result.current.requestStepUp(
          new Error('challenged'),
          { type: 'enter-subpage' },
          {
            isResumed: true,
          }
        )
      ).resolves.toBe(false);
    });
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('returns to a route override after the step-up', async () => {
    const { result } = renderHook(() => useStepUp());

    await act(async () => {
      await expect(
        result.current.startStepUp(
          { type: 'enter-subpage' },
          {
            acrValues: LogtoAcr.FirstFactor,
            maxAge: '300',
          }
        )
      ).resolves.toBe(true);
    });
    expect(accountStorage.pendingStepUp.get()).toMatchObject({
      route: '/',
      action: { type: 'enter-subpage' },
    });
  });
});
