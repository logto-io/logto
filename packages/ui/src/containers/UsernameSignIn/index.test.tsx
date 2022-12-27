import { fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { mockSignInExperienceSettings } from '@/__mocks__/logto';
import { signInWithPasswordIdentifier } from '@/apis/interaction';
import ConfirmModalProvider from '@/containers/ConfirmModalProvider';

import UsernameSignIn from '.';

jest.mock('@/apis/interaction', () => ({ signInWithPasswordIdentifier: jest.fn(async () => 0) }));
jest.mock('react-device-detect', () => ({
  isMobile: true,
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('<UsernameSignIn>', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  test('render', () => {
    const { queryByText, container } = renderWithPageContext(<UsernameSignIn />);
    expect(container.querySelector('input[name="username"]')).not.toBeNull();
    expect(container.querySelector('input[name="password"]')).not.toBeNull();
    expect(queryByText('action.sign_in')).not.toBeNull();
  });

  test('render with terms settings enabled and forgot password enabled', () => {
    const { queryByText } = renderWithPageContext(
      <SettingsProvider>
        <MemoryRouter>
          <UsernameSignIn />
        </MemoryRouter>
      </SettingsProvider>
    );
    expect(queryByText('description.agree_with_terms')).not.toBeNull();
    expect(queryByText('action.forgot_password')).not.toBeNull();
  });

  test('render with  forgot password disabled', () => {
    const { queryByText } = renderWithPageContext(
      <SettingsProvider
        settings={{ ...mockSignInExperienceSettings, forgotPassword: { sms: false, email: false } }}
      >
        <UsernameSignIn />
      </SettingsProvider>
    );

    expect(queryByText('action.forgot_password')).toBeNull();
  });

  test('required inputs with error message', () => {
    const { queryByText, getByText, container } = renderWithPageContext(<UsernameSignIn />);
    const submitButton = getByText('action.sign_in');

    fireEvent.click(submitButton);

    expect(queryByText('username_required')).not.toBeNull();
    expect(queryByText('password_required')).not.toBeNull();

    const usernameInput = container.querySelector('input[name="username"]');
    const passwordInput = container.querySelector('input[name="password"]');

    expect(usernameInput).not.toBeNull();
    expect(passwordInput).not.toBeNull();

    if (usernameInput) {
      fireEvent.change(usernameInput, { target: { value: 'username' } });
    }

    if (passwordInput) {
      fireEvent.change(passwordInput, { target: { value: 'password' } });
    }

    expect(queryByText('required')).toBeNull();
  });

  test('should show terms confirm modal', async () => {
    const { queryByText, getByText, container } = renderWithPageContext(
      <MemoryRouter>
        <SettingsProvider>
          <ConfirmModalProvider>
            <UsernameSignIn />
          </ConfirmModalProvider>
        </SettingsProvider>
      </MemoryRouter>
    );
    const submitButton = getByText('action.sign_in');

    const usernameInput = container.querySelector('input[name="username"]');
    const passwordInput = container.querySelector('input[name="password"]');

    if (usernameInput) {
      fireEvent.change(usernameInput, { target: { value: 'username' } });
    }

    if (passwordInput) {
      fireEvent.change(passwordInput, { target: { value: 'password' } });
    }

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(queryByText('description.agree_with_terms_modal')).not.toBeNull();
    });
  });

  test('should show terms detail modal', async () => {
    const { getByText, queryByText, container, queryByRole } = renderWithPageContext(
      <MemoryRouter>
        <SettingsProvider>
          <ConfirmModalProvider>
            <UsernameSignIn />
          </ConfirmModalProvider>
        </SettingsProvider>
      </MemoryRouter>
    );
    const submitButton = getByText('action.sign_in');

    const usernameInput = container.querySelector('input[name="username"]');
    const passwordInput = container.querySelector('input[name="password"]');

    if (usernameInput) {
      fireEvent.change(usernameInput, { target: { value: 'username' } });
    }

    if (passwordInput) {
      fireEvent.change(passwordInput, { target: { value: 'password' } });
    }

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(queryByText('description.agree_with_terms_modal')).not.toBeNull();
    });

    const termsLink = getByText('description.terms_of_use');

    act(() => {
      fireEvent.click(termsLink);
    });

    await waitFor(() => {
      expect(queryByText('action.agree')).not.toBeNull();
      expect(queryByRole('article')).not.toBeNull();
    });
  });

  test('submit form', async () => {
    const { getByText, container } = renderWithPageContext(
      <MemoryRouter>
        <SettingsProvider>
          <UsernameSignIn />
        </SettingsProvider>
      </MemoryRouter>
    );
    const submitButton = getByText('action.sign_in');

    const usernameInput = container.querySelector('input[name="username"]');
    const passwordInput = container.querySelector('input[name="password"]');

    if (usernameInput) {
      fireEvent.change(usernameInput, { target: { value: 'username' } });
    }

    if (passwordInput) {
      fireEvent.change(passwordInput, { target: { value: 'password' } });
    }

    const termsButton = getByText('description.agree_with_terms');

    act(() => {
      fireEvent.click(termsButton);
    });

    act(() => {
      fireEvent.click(submitButton);
    });

    act(() => {
      void waitFor(() => {
        expect(signInWithPasswordIdentifier).toBeCalledWith(
          {
            username: 'username',
            password: 'password',
          },
          undefined
        );
      });
    });
  });
});
