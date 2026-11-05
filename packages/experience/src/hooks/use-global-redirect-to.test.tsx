import { SignInIdentifier } from '@logto/schemas';
import { act, fireEvent, waitFor } from '@testing-library/react';
import { HTTPError } from 'ky';
import { useContext } from 'react';

import ConfirmModalProvider from '@/Providers/ConfirmModalProvider';
import UserInteractionContextProvider from '@/Providers/UserInteractionContextProvider';
import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { signInWithPasswordIdentifier } from '@/apis/experience';
import PasswordForm from '@/pages/SignInPassword/PasswordForm';

import useGlobalRedirectTo from './use-global-redirect-to';

jest.mock('@/apis/experience', () => ({
  signInWithPasswordIdentifier: jest.fn(async () => ({ redirectTo: '/oidc/auth/foo' })),
}));

const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

const replace = jest.fn();
const assign = jest.fn();
const originalLocation = window.location;

beforeAll(() => {
  // eslint-disable-next-line @silverhand/fp/no-mutating-methods
  Object.defineProperty(window, 'location', { value: { replace, assign }, writable: true });
});

afterAll(() => {
  // eslint-disable-next-line @silverhand/fp/no-mutating-methods
  Object.defineProperty(window, 'location', { value: originalLocation });
});

const redirectUrl = 'https://logto.dev/oidc/auth/foo';

const Harness = ({ options }: { readonly options?: Parameters<typeof useGlobalRedirectTo>[0] }) => {
  const redirectTo = useGlobalRedirectTo(options);
  const { setHasEnteredPassword } = useContext(UserInteractionContext);

  return (
    <>
      <button
        onClick={() => {
          setHasEnteredPassword(true);
        }}
      >
        enter password
      </button>
      <button
        onClick={async () => {
          await redirectTo(redirectUrl);
        }}
      >
        redirect
      </button>
    </>
  );
};

const renderHarness = ({
  hasEnteredPassword = true,
  options,
}: {
  hasEnteredPassword?: boolean;
  options?: Parameters<typeof useGlobalRedirectTo>[0];
} = {}) => {
  const { getByText } = renderWithPageContext(
    <SettingsProvider>
      <UserInteractionContextProvider>
        <Harness options={options} />
      </UserInteractionContextProvider>
    </SettingsProvider>
  );

  if (hasEnteredPassword) {
    fireEvent.click(getByText('enter password'));
  }

  fireEvent.click(getByText('redirect'));
};

const expectContinueToAppPage = (url: string) => {
  expect(mockedNavigate).toHaveBeenCalledWith(
    { pathname: '/continue-to-app' },
    { replace: true, state: { redirectTo: url } }
  );
  expect(replace).not.toHaveBeenCalled();
};

const expectRedirectedRightAway = (location = replace) => {
  expect(mockedNavigate).not.toHaveBeenCalled();
  expect(location).toHaveBeenCalledWith(redirectUrl);
};

describe('useGlobalRedirectTo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  it('should show the continue-to-app page for confirm_redirect_policy=password after a password is entered', () => {
    sessionStorage.setItem('confirm_redirect_policy', 'password');
    renderHarness();
    expectContinueToAppPage(redirectUrl);
  });

  it.each([
    { name: 'confirm_redirect_policy is not set', policy: undefined },
    { name: 'confirm_redirect_policy is unknown', policy: 'always' },
    {
      name: 'confirm_redirect_policy=password and no password was entered',
      policy: 'password',
      hasEnteredPassword: false,
    },
    {
      name: 'the redirect opts out (the continue page itself)',
      policy: 'password',
      options: { canConfirmRedirect: false },
    },
  ])('should redirect right away when $name', ({ policy, ...rest }) => {
    if (policy) {
      sessionStorage.setItem('confirm_redirect_policy', policy);
    }

    renderHarness(rest);
    expectRedirectedRightAway();
  });

  it('should never hold a social or SSO redirect', () => {
    sessionStorage.setItem('confirm_redirect_policy', 'password');
    renderHarness({ options: { shouldClearInteractionContextSession: false, isReplace: false } });
    expectRedirectedRightAway(assign);
  });

  it('should show the continue-to-app page after a password sign-in', async () => {
    sessionStorage.setItem('confirm_redirect_policy', 'password');
    const { getByText, container } = renderWithPageContext(
      <SettingsProvider>
        <ConfirmModalProvider>
          <UserInteractionContextProvider>
            <PasswordForm identifier={SignInIdentifier.Username} value="foo" />
          </UserInteractionContextProvider>
        </ConfirmModalProvider>
      </SettingsProvider>
    );

    const passwordInput = container.querySelector('input[name="password"]');

    if (passwordInput) {
      fireEvent.change(passwordInput, { target: { value: 'password' } });
    }

    act(() => {
      fireEvent.submit(getByText('action.continue'));
    });

    await waitFor(() => {
      expectContinueToAppPage('/oidc/auth/foo');
    });
  });

  it('should redirect right away when the password was rejected and another method finishes', async () => {
    sessionStorage.setItem('confirm_redirect_policy', 'password');
    (signInWithPasswordIdentifier as jest.Mock).mockRejectedValueOnce(
      new HTTPError(
        {
          json: async () => ({
            code: 'session.invalid_credentials',
            message: 'session.invalid_credentials',
          }),
        } as Response,
        {} as Request,
        {} as never
      )
    );
    const { getByText, container } = renderWithPageContext(
      <SettingsProvider>
        <ConfirmModalProvider>
          <UserInteractionContextProvider>
            <PasswordForm identifier={SignInIdentifier.Username} value="foo" />
            <Harness />
          </UserInteractionContextProvider>
        </ConfirmModalProvider>
      </SettingsProvider>
    );

    const passwordInput = container.querySelector('input[name="password"]');

    if (passwordInput) {
      fireEvent.change(passwordInput, { target: { value: 'wrong' } });
    }

    act(() => {
      fireEvent.submit(getByText('action.continue'));
    });

    await waitFor(() => {
      expect(getByText('session.invalid_credentials')).not.toBeNull();
    });

    // E.g. the user switches to a verification code and finishes the sign-in with it.
    fireEvent.click(getByText('redirect'));
    expectRedirectedRightAway();
  });
});
