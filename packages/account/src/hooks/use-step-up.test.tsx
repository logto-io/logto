import { LogtoAcr } from '@logto/schemas';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import {
  createMockPageContext,
  mockAccountCenterSettings,
} from '@ac/__mocks__/RenderWithPageContext';
import { accountStorage } from '@ac/utils/session-storage';
import {
  completePendingStepUp,
  getSubpageAuthenticationMaxAgeSeconds,
  getSubpageStepUpChallenge,
  handlePendingStepUpOnPageLoad,
  startPendingStepUp,
} from '@ac/utils/step-up';

import { useStepUpEntry } from './use-step-up';

const mockGetIdTokenClaims = jest.fn();
const mockSignIn = jest.fn();

jest.mock('@ac/constants/env', () => ({
  __esModule: true,
  isDevFeaturesEnabled: true,
}));

jest.mock('@logto/react', () => ({
  __esModule: true,
  useLogto: () => ({
    getIdTokenClaims: mockGetIdTokenClaims,
    signIn: mockSignIn,
  }),
}));

const now = Math.floor(Date.now() / 1000);
const createClaims = (authTime = now - 60) => ({
  acr: LogtoAcr.FirstFactor,
  auth_time: authTime,
});

const createWrapper =
  (maximumAuthenticationAgeInSeconds = 600) =>
  ({ children }: { readonly children: ReactNode }) => (
    <PageContext.Provider
      value={createMockPageContext({
        accountCenterSettings: {
          ...mockAccountCenterSettings,
          maximumAuthenticationAgeInSeconds,
        },
      })}
    >
      {children}
    </PageContext.Provider>
  );

const prepareResumableStepUp = () => {
  startPendingStepUp({ type: 'enter-subpage' }, '/account/password');
  handlePendingStepUpOnPageLoad({ pathname: '/account', search: '?code=code&state=state' });
  completePendingStepUp();
  handlePendingStepUpOnPageLoad({ pathname: '/account/password', search: '' });
};

describe('useStepUpEntry', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    window.localStorage.clear();
    window.sessionStorage.clear();
    mockSignIn.mockResolvedValue(undefined);
  });

  it('renders the page when the ID token has a fresh 1fa context', async () => {
    mockGetIdTokenClaims.mockResolvedValue(createClaims());

    const { result } = renderHook(() => useStepUpEntry({ enabled: true }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });
    expect(result.current.isResumed).toBe(false);
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('accepts a context within the entry cutoff without subtracting the margin twice', async () => {
    mockGetIdTokenClaims.mockResolvedValue(createClaims(now - 270));

    const { result } = renderHook(() => useStepUpEntry({ enabled: true }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('accepts a future auth_time within the tenant-window skew at the shortest window', async () => {
    // A one-minute window keeps a 15-second skew allowance while its entry cutoff is 15 seconds.
    // A browser clock 5 seconds behind the authorization server must not make the token the
    // step-up has just issued look stale, or the page shows the failure fallback.
    mockGetIdTokenClaims.mockResolvedValue(createClaims(now + 5));

    const { result } = renderHook(() => useStepUpEntry({ enabled: true }), {
      wrapper: createWrapper(60),
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });
    expect(result.current.hasFailed).toBe(false);
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('steps up stricter than the entry cutoff when the context is stale', async () => {
    mockGetIdTokenClaims.mockResolvedValue(createClaims(now - 301));

    const { result } = renderHook(() => useStepUpEntry({ enabled: true }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
    });
    expect(mockSignIn).toHaveBeenCalledWith({
      redirectUri: 'http://localhost/account',
      clearTokens: false,
      extraParams: {
        acr_values: LogtoAcr.FirstFactor,
        max_age: '240',
      },
    });
    expect(accountStorage.pendingStepUp.get()).toMatchObject({
      action: { type: 'enter-subpage' },
      phase: 'authorizing',
    });
    expect(result.current.isReady).toBe(false);
  });

  it('keeps the shortest tenant window usable and steps up after its entry threshold', async () => {
    mockGetIdTokenClaims.mockResolvedValue(createClaims(now - 16));

    const { result } = renderHook(() => useStepUpEntry({ enabled: true }), {
      wrapper: createWrapper(60),
    });

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
    });
    expect(mockSignIn).toHaveBeenCalledWith(
      expect.objectContaining({
        extraParams: {
          acr_values: LogtoAcr.FirstFactor,
          // The entry cutoff is 15 seconds and the skew margin is 15 seconds, so the step-up
          // always prompts instead of letting the provider reuse a context the page rejects.
          max_age: '0',
        },
      })
    );
    expect(result.current.isReady).toBe(false);
  });

  it('does not step up early for a long tenant window', async () => {
    mockGetIdTokenClaims.mockResolvedValue(createClaims(now - 6000));

    const { result } = renderHook(() => useStepUpEntry({ enabled: true }), {
      wrapper: createWrapper(7200),
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('skips the check for a flow that is allowed without verification', async () => {
    const { result } = renderHook(() => useStepUpEntry({ enabled: true, skip: true }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });
    expect(mockGetIdTokenClaims).not.toHaveBeenCalled();
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('does not check or step up when the page is disabled', () => {
    const { result } = renderHook(() => useStepUpEntry({ enabled: false }), {
      wrapper: createWrapper(),
    });

    expect(result.current).toMatchObject({
      isReady: false,
      isChecking: false,
      hasFailed: false,
      isResumed: false,
    });
    expect(mockGetIdTokenClaims).not.toHaveBeenCalled();
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('marks a completed entry step-up as resumed when the context is fresh', async () => {
    prepareResumableStepUp();
    mockGetIdTokenClaims.mockResolvedValue(createClaims());

    const { result } = renderHook(() => useStepUpEntry({ enabled: true }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });
    expect(result.current.isResumed).toBe(true);
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('reports a failure instead of looping when a completed step-up is still stale', async () => {
    prepareResumableStepUp();
    mockGetIdTokenClaims.mockResolvedValue(createClaims(now - 600));

    const { result } = renderHook(() => useStepUpEntry({ enabled: true }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.hasFailed).toBe(true);
    });
    expect(result.current.isResumed).toBe(true);
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('accepts a completed step-up at the shortest window when the clock is behind', async () => {
    prepareResumableStepUp();
    // A token issued five seconds in the future: `auth_time` comes from the authorization server,
    // and the browser clock that compares it may run behind.
    mockGetIdTokenClaims.mockResolvedValue(createClaims(Math.floor(Date.now() / 1000) + 5));

    const { result } = renderHook(() => useStepUpEntry({ enabled: true }), {
      wrapper: createWrapper(60),
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });
    expect(result.current.hasFailed).toBe(false);
    expect(result.current.isResumed).toBe(true);
    expect(mockSignIn).not.toHaveBeenCalled();
  });
});

describe('subpage entry challenge', () => {
  it.each([
    [60, 15, 0],
    [600, 300, 240],
    [7200, 6900, 6840],
  ])(
    'derives the entry cutoff and the stricter step-up max_age for a %p second window',
    (window, cutoff, maxAge) => {
      expect(getSubpageAuthenticationMaxAgeSeconds(window)).toBe(cutoff);
      expect(getSubpageStepUpChallenge(window)).toEqual({
        acrValues: LogtoAcr.FirstFactor,
        maxAge: String(maxAge),
      });
    }
  );
});
