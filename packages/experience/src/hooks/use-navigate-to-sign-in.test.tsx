import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import PageContextProvider from '@/Providers/PageContextProvider';
import { abortInteraction, getDirectSignIn } from '@/apis/experience';

import useNavigateToSignIn from './use-navigate-to-sign-in';

const mockNavigate = jest.fn();
const mockRedirectTo = jest.fn();

jest.mock('@/apis/experience', () => ({
  getDirectSignIn: jest.fn(),
  abortInteraction: jest.fn(),
}));

jest.mock('./use-navigate-with-preserved-search-params', () => ({
  __esModule: true,
  default: () => mockNavigate,
}));

jest.mock('./use-global-redirect-to', () => ({
  __esModule: true,
  default: () => mockRedirectTo,
}));

const mockedGetDirectSignIn = getDirectSignIn as jest.MockedFunction<typeof getDirectSignIn>;
const mockedAbortInteraction = abortInteraction as jest.MockedFunction<typeof abortInteraction>;

const wrapper = ({ children }: { readonly children: ReactNode }) => (
  <MemoryRouter>
    <PageContextProvider>{children}</PageContextProvider>
  </MemoryRouter>
);

describe('useNavigateToSignIn', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetDirectSignIn.mockResolvedValue({});
    mockedAbortInteraction.mockResolvedValue({ redirectTo: 'https://client.example.com/callback' });
  });

  it('should abort a failed direct sign-in back to the client', async () => {
    mockedGetDirectSignIn.mockResolvedValueOnce({ directSignIn: 'social:google' });
    const { result } = renderHook(() => useNavigateToSignIn(), { wrapper });

    act(() => {
      result.current('connector.error');
    });

    await waitFor(() => {
      expect(mockedAbortInteraction).toHaveBeenCalledWith('connector.error');
      expect(mockRedirectTo).toHaveBeenCalledWith('https://client.example.com/callback');
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should fall back to the hosted sign-in page when aborting fails', async () => {
    mockedGetDirectSignIn.mockResolvedValueOnce({ directSignIn: 'sso:connector-id' });
    mockedAbortInteraction.mockRejectedValueOnce(new Error('interaction expired'));
    const { result } = renderHook(() => useNavigateToSignIn(), { wrapper });

    act(() => {
      result.current('invalid_session');
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/sign-in', { replace: true });
    });
  });

  it('should not abort a hosted sign-in that follows an abandoned direct sign-in', async () => {
    const { result } = renderHook(() => useNavigateToSignIn(), { wrapper });

    mockedGetDirectSignIn.mockResolvedValueOnce({ directSignIn: 'social:google' });
    act(() => {
      result.current('access_denied');
    });
    await waitFor(() => {
      expect(mockRedirectTo).toHaveBeenCalled();
    });

    // The next interaction carries no `direct_sign_in`; nothing from the previous attempt
    // survives in the tab, so it keeps the hosted fallback.
    mockedGetDirectSignIn.mockResolvedValueOnce({});
    act(() => {
      result.current('connector.error');
    });
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/sign-in', { replace: true });
    });

    expect(mockedAbortInteraction).toHaveBeenCalledTimes(1);
  });
});
