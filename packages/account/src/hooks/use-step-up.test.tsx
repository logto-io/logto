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
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('starts an entry step-up with the subpage max_age when the context is stale', async () => {
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
        max_age: '300',
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
          max_age: '15',
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
    });
    expect(mockGetIdTokenClaims).not.toHaveBeenCalled();
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
    expect(mockSignIn).not.toHaveBeenCalled();
  });
});

describe('subpage entry challenge', () => {
  it.each([
    [60, 15],
    [600, 300],
    [7200, 6900],
  ])('derives the entry max age for a %p second window', (window, expected) => {
    expect(getSubpageAuthenticationMaxAgeSeconds(window)).toBe(expected);
    expect(getSubpageStepUpChallenge(window)).toEqual({
      acrValues: LogtoAcr.FirstFactor,
      maxAge: String(expected),
    });
  });
});
