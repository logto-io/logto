import { AgreeToTermsPolicy } from '@logto/schemas';
import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import PageContextProvider from '@/Providers/PageContextProvider';
import { socialConnectors } from '@/__mocks__/logto';
import {
  abortInteraction,
  getDirectSignIn,
  getSocialAuthorizationUrl,
  initInteraction,
} from '@/apis/experience';
import useTerms from '@/hooks/use-terms';

import useSocial from './use-social';

const mockHandleError = jest.fn();
const mockRedirectTo = jest.fn();

jest.mock('@/apis/experience', () => ({
  initInteraction: jest.fn(),
  getSocialAuthorizationUrl: jest.fn(),
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

jest.mock('@/hooks/use-terms', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockedInitInteraction = initInteraction as jest.MockedFunction<typeof initInteraction>;
const mockedGetSocialAuthorizationUrl = getSocialAuthorizationUrl as jest.MockedFunction<
  typeof getSocialAuthorizationUrl
>;
const mockedGetDirectSignIn = getDirectSignIn as jest.MockedFunction<typeof getDirectSignIn>;
const mockedAbortInteraction = abortInteraction as jest.MockedFunction<typeof abortInteraction>;
const mockedUseTerms = useTerms as jest.Mock;

const wrapper = ({ children }: { readonly children: ReactNode }) => (
  <MemoryRouter>
    <PageContextProvider>{children}</PageContextProvider>
  </MemoryRouter>
);

const connector = socialConnectors[0]!;

describe('useSocial', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedInitInteraction.mockResolvedValue({} as Response);
    mockedGetDirectSignIn.mockResolvedValue({});
    mockedAbortInteraction.mockResolvedValue({ redirectTo: 'https://client.example.com/callback' });
    mockedUseTerms.mockReturnValue({
      termsValidation: jest.fn().mockResolvedValue(true),
      agreeToTermsPolicy: AgreeToTermsPolicy.Automatic,
    });
  });

  it('should abort a direct sign-in when the authorization URL request fails', async () => {
    mockedGetSocialAuthorizationUrl.mockRejectedValueOnce(new Error('connector error'));
    mockedGetDirectSignIn.mockResolvedValueOnce({ directSignIn: 'social:google' });

    const { result } = renderHook(() => useSocial(), { wrapper });

    await act(async () => {
      await result.current.invokeSocialSignIn(connector);
    });

    await waitFor(() => {
      expect(mockedAbortInteraction).toHaveBeenCalled();
      expect(mockRedirectTo).toHaveBeenCalledWith('https://client.example.com/callback');
    });
    expect(mockHandleError).not.toHaveBeenCalled();
  });

  it('should abort a direct sign-in when the user declines the terms', async () => {
    mockedUseTerms.mockReturnValueOnce({
      termsValidation: jest.fn().mockResolvedValue(false),
      agreeToTermsPolicy: AgreeToTermsPolicy.Manual,
    });
    mockedGetDirectSignIn.mockResolvedValueOnce({ directSignIn: 'social:google' });

    const { result } = renderHook(() => useSocial(), { wrapper });

    await act(async () => {
      await result.current.invokeSocialSignIn(connector);
    });

    await waitFor(() => {
      expect(mockedAbortInteraction).toHaveBeenCalled();
      expect(mockRedirectTo).toHaveBeenCalledWith('https://client.example.com/callback');
    });
    expect(mockedGetSocialAuthorizationUrl).not.toHaveBeenCalled();
    expect(mockHandleError).not.toHaveBeenCalled();
  });

  it('should keep the regular error handling for a hosted sign-in', async () => {
    mockedGetSocialAuthorizationUrl.mockRejectedValueOnce(new Error('connector error'));

    const { result } = renderHook(() => useSocial(), { wrapper });

    await act(async () => {
      await result.current.invokeSocialSignIn(connector);
    });

    await waitFor(() => {
      expect(mockHandleError).toHaveBeenCalled();
    });
    expect(mockedAbortInteraction).not.toHaveBeenCalled();
  });
});
