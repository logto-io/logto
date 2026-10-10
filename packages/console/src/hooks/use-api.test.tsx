import { renderHook } from '@testing-library/react';

import { mockEnv, resetMockEnv, type EnvTestUtils } from '@/test-utils/env';

import { useGlobalRequestErrorHandler } from './use-api';

const mockSignOut = jest.fn();
const mockToastError = jest.fn();

jest.mock('@/consts/env', () => jest.requireActual<EnvTestUtils>('@/test-utils/env').mockEnvModule);
jest.mock('@/components/Region', () => ({ defaultRegionName: 'US' }));
jest.mock('@logto/react', () => ({ useLogto: jest.fn() }));
jest.mock('./use-sign-out', () => ({
  __esModule: true,
  default: () => ({ signOut: mockSignOut }),
}));
jest.mock('@/hooks/use-confirm-modal', () => ({ useConfirmModal: () => ({ show: jest.fn() }) }));
jest.mock('@/hooks/use-redirect-uri', () => ({
  __esModule: true,
  default: () => new URL('https://admin.example.com/console/callback'),
}));
jest.mock('react-hot-toast', () => ({
  toast: { error: (message: string) => mockToastError(message) },
}));

/** Body of the Cloud Management API proxy's 403 for a missing tenant scope. */
const insufficientPermissions = { message: 'Insufficient permissions.' };

describe('useGlobalRequestErrorHandler', () => {
  beforeEach(() => {
    resetMockEnv();
    jest.clearAllMocks();
  });

  it('signs out on an insufficient permissions 403 with dev features off', async () => {
    const { result } = renderHook(() => useGlobalRequestErrorHandler());

    await result.current.handleError({
      status: 403,
      clone: () => ({ json: async () => insufficientPermissions }),
    } as Response);

    expect(mockSignOut).toHaveBeenCalled();
    expect(mockToastError).not.toHaveBeenCalled();
  });

  it('shows an insufficient permissions 403 as a toast with dev features on', async () => {
    mockEnv({ isDevFeaturesEnabled: true });
    const { result } = renderHook(() => useGlobalRequestErrorHandler());

    await result.current.handleError({
      status: 403,
      clone: () => ({ json: async () => insufficientPermissions }),
    } as Response);

    expect(mockSignOut).not.toHaveBeenCalled();
    expect(mockToastError).toHaveBeenCalledWith(
      expect.stringContaining('Insufficient permissions.')
    );
  });
});
