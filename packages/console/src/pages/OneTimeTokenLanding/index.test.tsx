import { Prompt, useLogto } from '@logto/react';
import { ExtraParamsKey } from '@logto/schemas';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { saveRedirect } from '@/utils/storage';

import OneTimeTokenLanding from '.';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('@/hooks/use-redirect-uri', () => ({
  __esModule: true,
  default: jest.fn(() => new URL('/callback', window.location.origin)),
}));

jest.mock('@logto/react', () => ({
  Prompt: {
    Consent: 'consent',
    Login: 'login',
  },
  useLogto: jest.fn(),
}));

jest.mock('@/utils/storage', () => ({
  saveRedirect: jest.fn(),
}));

const mockedUseLogto = jest.mocked(useLogto);
const mockedSaveRedirect = jest.mocked(saveRedirect);

type OneTimeTokenSignInOptions = {
  redirectUri: URL;
  clearTokens: false;
  prompt: typeof Prompt.Consent;
  extraParams: {
    [ExtraParamsKey.OneTimeToken]: string;
    [ExtraParamsKey.LoginHint]: string;
  };
};

const renderOneTimeTokenLanding = (entry: string) =>
  render(
    <MemoryRouter
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
      initialEntries={[entry]}
    >
      <OneTimeTokenLanding />
    </MemoryRouter>
  );

describe('OneTimeTokenLanding', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('waits for Logto auth loading before starting the one-time-token flow', () => {
    const signIn = jest.fn();
    mockedUseLogto.mockReturnValue({
      isLoading: true,
      signIn,
    } as unknown as ReturnType<typeof useLogto>);

    renderOneTimeTokenLanding('/one-time-token?one_time_token=token&email=foo%40example.com');

    expect(signIn).not.toHaveBeenCalled();
    expect(mockedSaveRedirect).not.toHaveBeenCalled();
  });

  it('starts one-time-token sign-in with consent prompt and keeps existing tokens', async () => {
    const signIn = jest.fn();
    mockedUseLogto.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      signIn,
    } as unknown as ReturnType<typeof useLogto>);

    renderOneTimeTokenLanding(
      '/one-time-token?one_time_token=token&email=foo%40example.com&redirect=https%3A%2F%2Fconsole.logto.io%2Faccept%2Finvitation-id'
    );

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledTimes(1);
    });

    const [options] = signIn.mock.calls[0] as [OneTimeTokenSignInOptions];

    expect(options).toMatchObject({
      clearTokens: false,
      prompt: Prompt.Consent,
      extraParams: {
        [ExtraParamsKey.OneTimeToken]: 'token',
        [ExtraParamsKey.LoginHint]: 'foo@example.com',
      },
    });
    expect(options.redirectUri.href).toBe('http://localhost/callback');
    const [savedRedirect] = mockedSaveRedirect.mock.calls[0] as [URL];
    expect(savedRedirect.href).toBe('https://console.logto.io/accept/invitation-id');
  });

  it('navigates to root when the one-time-token parameters are missing after loading', async () => {
    const signIn = jest.fn();
    mockedUseLogto.mockReturnValue({
      isLoading: false,
      signIn,
    } as unknown as ReturnType<typeof useLogto>);

    renderOneTimeTokenLanding('/one-time-token?one_time_token=token');

    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    expect(signIn).not.toHaveBeenCalled();
  });
});
