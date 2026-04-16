import { renderHook } from '@testing-library/react';

import useCurrentUser from './use-current-user';
import useOssOnboardingData from './use-oss-onboarding-data';

jest.mock('@/consts/env', () => ({
  isCloud: false,
}));

jest.mock('./use-current-user', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockedUseCurrentUser = jest.mocked(useCurrentUser);

describe('useOssOnboardingData', () => {
  beforeEach(() => {
    mockedUseCurrentUser.mockReturnValue({
      customData: undefined,
      error: undefined,
      isLoading: false,
      isLoaded: true,
      updateCustomData: jest.fn(),
      user: undefined,
      reload: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('treats missing OSS onboarding data as not required', () => {
    const { result } = renderHook(() => useOssOnboardingData());

    expect(result.current.hasOssOnboardingRecord).toBe(false);
    expect(result.current.isOnboardingRequired).toBe(false);
    expect(result.current.isOnboardingDone).toBe(false);
  });

  it('requires onboarding only when an OSS onboarding record exists and is not done', () => {
    mockedUseCurrentUser.mockReturnValue({
      customData: {
        ossOnboarding: {
          isOnboardingDone: false,
        },
      },
      error: undefined,
      isLoading: false,
      isLoaded: true,
      updateCustomData: jest.fn(),
      user: undefined,
      reload: jest.fn(),
    });

    const { result } = renderHook(() => useOssOnboardingData());

    expect(result.current.hasOssOnboardingRecord).toBe(true);
    expect(result.current.isOnboardingRequired).toBe(true);
    expect(result.current.isOnboardingDone).toBe(false);
  });
});
