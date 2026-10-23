import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import PageContextProvider from '@/Providers/PageContextProvider';
import {
  abortInteraction,
  getDirectSignIn,
  getSsoAuthorizationUrl,
  initInteraction,
} from '@/apis/experience';

import useSingleSignOn from './use-single-sign-on';

const mockHandleError = jest.fn();
const mockRedirectTo = jest.fn();

jest.mock('@/apis/experience', () => ({
  initInteraction: jest.fn(),
  getSsoAuthorizationUrl: jest.fn(),
  getDirectSignIn: jest.fn(),
  abortInteraction: jest.fn(),
}));

jest.mock('@/hooks/use-global-redirect-to', () => ({
  __esModule: true,
  default: () => mockRedirectTo,
}));

jest.mock('@/hooks/use-error-handler', () => ({
  __esModule: true,
  default: () => mockHandleError,
}));

jest.mock('@/hooks/use-step-up-error-handler', () => ({
  usePureStepUpErrorHandler: jest.fn(),
}));

const mockedInitInteraction = initInteraction as jest.MockedFunction<typeof initInteraction>;
const mockedGetSsoAuthorizationUrl = getSsoAuthorizationUrl as jest.MockedFunction<
  typeof getSsoAuthorizationUrl
>;
const mockedGetDirectSignIn = getDirectSignIn as jest.MockedFunction<typeof getDirectSignIn>;
const mockedAbortInteraction = abortInteraction as jest.MockedFunction<typeof abortInteraction>;

const wrapper = ({ children }: { readonly children: ReactNode }) => (
  <MemoryRouter>
    <PageContextProvider>{children}</PageContextProvider>
  </MemoryRouter>
);

describe('useSingleSignOn', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedInitInteraction.mockResolvedValue({} as Response);
    mockedGetDirectSignIn.mockResolvedValue({});
    mockedAbortInteraction.mockResolvedValue({ redirectTo: 'https://client.example.com/callback' });
  });

  it('should abort a direct sign-in when the authorization URL request fails', async () => {
    mockedGetSsoAuthorizationUrl.mockRejectedValueOnce(new Error('connector error'));
    mockedGetDirectSignIn.mockResolvedValueOnce({ directSignIn: 'sso:connector-id' });

    const { result } = renderHook(() => useSingleSignOn(), { wrapper });

    await act(async () => {
      await result.current('connector-id');
    });

    await waitFor(() => {
      expect(mockedAbortInteraction).toHaveBeenCalled();
      expect(mockRedirectTo).toHaveBeenCalledWith('https://client.example.com/callback');
    });
    expect(mockHandleError).not.toHaveBeenCalled();
  });

  it('should keep the regular error handling for a hosted sign-in', async () => {
    mockedGetSsoAuthorizationUrl.mockRejectedValueOnce(new Error('connector error'));

    const { result } = renderHook(() => useSingleSignOn(), { wrapper });

    await act(async () => {
      await result.current('connector-id');
    });

    await waitFor(() => {
      expect(mockHandleError).toHaveBeenCalled();
    });
    expect(mockedAbortInteraction).not.toHaveBeenCalled();
  });
});
