import { SignInIdentifier } from '@logto/schemas';
import { assert } from '@silverhand/essentials';
import { act, fireEvent, waitFor } from '@testing-library/react';
import { useEffect } from 'react';

import ConfirmModalProvider from '@/Providers/ConfirmModalProvider';
import SingleSignOnFormModeContextProvider from '@/Providers/SingleSignOnFormModeContextProvider';
import ToastProvider from '@/Providers/ToastProvider';
import UserInteractionContextProvider from '@/Providers/UserInteractionContextProvider';
import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { mockSignInExperienceSettings } from '@/__mocks__/logto';
import useToast from '@/hooks/use-toast';

import PasswordSignInForm from '.';

jest.mock('react-device-detect', () => ({
  isMobile: true,
}));

jest.mock('i18next', () => ({
  ...jest.requireActual('i18next'),
  language: 'en',
  t: (key: string) => key,
}));

jest.mock('@/apis/experience', () => ({
  signInWithPasswordIdentifier: jest.fn(async () => ({ redirectTo: '/' })),
  getSsoAuthorizationUrl: jest.fn(),
  getSsoConnectors: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

const SeedToast = ({ message }: { readonly message: string }) => {
  const { setToast } = useToast();

  useEffect(() => {
    setToast(message);
  }, [message, setToast]);

  return null;
};

describe('PasswordSignInForm suspended account error', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should keep suspended account form error after toast timeout', () => {
    jest.useFakeTimers();

    const suspendedMessage = 'This account is suspended.';

    const { container } = renderWithPageContext(
      <SettingsProvider settings={mockSignInExperienceSettings}>
        <ConfirmModalProvider>
          <ToastProvider>
            <SeedToast message={suspendedMessage} />
            <UserInteractionContextProvider>
              <SingleSignOnFormModeContextProvider>
                <PasswordSignInForm
                  signInMethods={[SignInIdentifier.Username, SignInIdentifier.Email]}
                />
              </SingleSignOnFormModeContextProvider>
            </UserInteractionContextProvider>
          </ToastProvider>
        </ConfirmModalProvider>
      </SettingsProvider>,
      {
        initialEntries: [
          {
            pathname: '/sign-in',
            state: { errorMessage: suspendedMessage },
          },
        ],
      }
    );

    // Toast is portaled to document.body via ReactModal and marks the app aria-hidden
    expect(document.querySelector('[role="toast"]')).not.toBeNull();
    expect(container.querySelector('[role="alert"]')?.textContent).toBe(suspendedMessage);

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    // ReactModal keeps the toast in the DOM during its close animation
    act(() => {
      jest.advanceTimersByTime(300);
    });

    const toast = document.querySelector('[role="toast"]');
    if (toast) {
      fireEvent.transitionEnd(toast);
    }

    // Toast is dismissed after timeout, but the form error remains
    expect(document.querySelector('[role="toast"]')).toBeNull();
    expect(container.querySelector('[role="alert"]')?.textContent).toBe(suspendedMessage);
  });

  it('should clear suspended form error when user resubmits the form', async () => {
    const suspendedMessage = 'This account is suspended.';

    const { queryByText, getByText, container } = renderWithPageContext(
      <SettingsProvider settings={mockSignInExperienceSettings}>
        <ConfirmModalProvider>
          <UserInteractionContextProvider>
            <SingleSignOnFormModeContextProvider>
              <PasswordSignInForm signInMethods={[SignInIdentifier.Username]} />
            </SingleSignOnFormModeContextProvider>
          </UserInteractionContextProvider>
        </ConfirmModalProvider>
      </SettingsProvider>,
      {
        initialEntries: [
          {
            pathname: '/sign-in',
            state: { errorMessage: suspendedMessage },
          },
        ],
      }
    );

    expect(queryByText(suspendedMessage)).not.toBeNull();

    const identifierInput = container.querySelector('input[name="identifier"]');
    const passwordInput = container.querySelector('input[name="password"]');
    assert(identifierInput, new Error('identifier input should exist'));
    assert(passwordInput, new Error('password input should exist'));

    fireEvent.change(identifierInput, { target: { value: 'foo' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });

    act(() => {
      fireEvent.submit(getByText('action.sign_in'));
    });

    await waitFor(() => {
      expect(queryByText(suspendedMessage)).toBeNull();
    });
  });
});
