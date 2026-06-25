import { useLogto } from '@logto/react';
import { render, screen, waitFor } from '@testing-library/react';
import type * as React from 'react';
import { MemoryRouter } from 'react-router-dom';
import useSWR from 'swr';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';

import AcceptInvitation from '.';

jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@logto/react', () => ({
  useLogto: jest.fn(),
}));

const mockCloudApi = {
  get: jest.fn(),
  patch: jest.fn(),
};
const mockSilentCloudApi = {
  get: jest.fn(),
  patch: jest.fn(),
};

jest.mock('@/cloud/hooks/use-cloud-api', () => ({
  useCloudApi: jest.fn((options?: { readonly hideErrorToast?: boolean }) =>
    options?.hideErrorToast ? mockSilentCloudApi : mockCloudApi
  ),
}));

jest.mock('@/hooks/use-redirect-uri', () => ({
  __esModule: true,
  default: jest.fn(() => new URL('/callback', window.location.origin)),
}));

jest.mock('@/contexts/TenantsProvider', () => {
  const { createContext } = jest.requireActual<typeof React>('react');

  return {
    TenantsContext: createContext({
      navigateTenant: jest.fn(),
      resetTenants: jest.fn(),
    }),
  };
});

jest.mock('@/utils/storage', () => ({
  saveRedirect: jest.fn(),
}));

jest.mock('@/components/AppLoading', () => ({
  __esModule: true,
  default: () => <div>loading</div>,
}));

jest.mock('@/components/AppError', () => ({
  __esModule: true,
  default: ({ errorMessage }: { readonly errorMessage: string }) => <div>{errorMessage}</div>,
}));

jest.mock('./SwitchAccount', () => ({
  __esModule: true,
  default: () => <button type="button">switch account</button>,
}));

const mockedUseLogto = jest.mocked(useLogto);
const mockedUseCloudApi = jest.mocked(useCloudApi);
const mockedUseSWR = jest.mocked(useSWR);

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ invitationId: 'invitation-id' }),
}));

const renderAcceptInvitation = (entry: string) =>
  render(
    <MemoryRouter
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
      initialEntries={[entry]}
    >
      <AcceptInvitation />
    </MemoryRouter>
  );

describe('AcceptInvitation', () => {
  const requestSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(HTMLFormElement.prototype, 'requestSubmit').mockImplementation(requestSubmit);
    mockedUseLogto.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      signIn: jest.fn(),
    } as unknown as ReturnType<typeof useLogto>);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('loads the invitation details with error toast suppressed', async () => {
    mockedUseSWR.mockReturnValue({} as unknown as ReturnType<typeof useSWR>);
    mockSilentCloudApi.get.mockResolvedValue({});

    renderAcceptInvitation('/accept/invitation-id?one_time_token=one-time-token');

    const fetchInvitation = mockedUseSWR.mock.calls[0]?.[1] as () => Promise<unknown>;
    await fetchInvitation();

    expect(mockedUseCloudApi).toHaveBeenCalledWith({ hideErrorToast: true });
    expect(mockSilentCloudApi.get).toHaveBeenCalledWith('/api/invitations/:invitationId', {
      params: { invitationId: 'invitation-id' },
    });
    expect(mockCloudApi.get).not.toHaveBeenCalled();
  });

  it('starts invitation one-time-token auth for a signed-in mismatched user', async () => {
    mockedUseSWR.mockReturnValue({
      error: { status: 403 },
    } as unknown as ReturnType<typeof useSWR>);

    renderAcceptInvitation('/accept/invitation-id?one_time_token=one-time-token');

    await waitFor(() => {
      expect(requestSubmit).toHaveBeenCalledTimes(1);
    });

    expect(screen.queryByRole('button', { name: 'switch account' })).toBeNull();
    expect(document.querySelector('form')?.getAttribute('method')).toBe('post');
    expect(document.querySelector('form')?.getAttribute('action')).toBe(
      '/api/invitations/invitation-id/auth?one_time_token=one-time-token'
    );
  });

  it('shows the manual switch-account page for a signed-in mismatched user without one-time token', () => {
    mockedUseSWR.mockReturnValue({
      error: { status: 403 },
    } as unknown as ReturnType<typeof useSWR>);

    renderAcceptInvitation('/accept/invitation-id');

    expect(requestSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'switch account' })).toBeTruthy();
  });
});
