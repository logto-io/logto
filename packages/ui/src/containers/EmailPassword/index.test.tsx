import { fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { signInWithEmailPassword } from '@/apis/sign-in';
import ConfirmModalProvider from '@/containers/ConfirmModalProvider';

import EmailPassword from '.';

jest.mock('@/apis/sign-in', () => ({ signInWithEmailPassword: jest.fn(async () => 0) }));
jest.mock('react-device-detect', () => ({
  isMobile: true,
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('<EmailPassword>', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  test('render', () => {
    const { queryByText, container } = renderWithPageContext(<EmailPassword />);
    expect(container.querySelector('input[name="email"]')).not.toBeNull();
    expect(container.querySelector('input[name="password"]')).not.toBeNull();
    expect(queryByText('action.sign_in')).not.toBeNull();
  });

  test('render with terms settings enabled', () => {
    const { queryByText } = renderWithPageContext(
      <MemoryRouter>
        <SettingsProvider>
          <EmailPassword />
        </SettingsProvider>
      </MemoryRouter>
    );
    expect(queryByText('description.agree_with_terms')).not.toBeNull();
    expect(queryByText('action.forgot_password')).not.toBeNull();
  });

  test('required inputs with error message', () => {
    const { queryByText, getByText, container } = renderWithPageContext(<EmailPassword />);
    const submitButton = getByText('action.sign_in');

    fireEvent.click(submitButton);

    expect(queryByText('invalid_email')).not.toBeNull();
    expect(queryByText('password_required')).not.toBeNull();

    const emailInput = container.querySelector('input[name="email"]');
    const passwordInput = container.querySelector('input[name="password"]');

    expect(emailInput).not.toBeNull();
    expect(passwordInput).not.toBeNull();

    if (emailInput) {
      fireEvent.change(emailInput, { target: { value: 'email@logto.io' } });
    }

    if (passwordInput) {
      fireEvent.change(passwordInput, { target: { value: 'password' } });
    }

    expect(queryByText('invalid_email')).toBeNull();
    expect(queryByText('password_required')).toBeNull();
  });

  test('should show terms confirm modal', async () => {
    const { queryByText, getByText, container } = renderWithPageContext(
      <MemoryRouter>
        <SettingsProvider>
          <ConfirmModalProvider>
            <EmailPassword />
          </ConfirmModalProvider>
        </SettingsProvider>
      </MemoryRouter>
    );
    const submitButton = getByText('action.sign_in');

    const emailInput = container.querySelector('input[name="email"]');
    const passwordInput = container.querySelector('input[name="password"]');

    if (emailInput) {
      fireEvent.change(emailInput, { target: { value: 'email@logto.io' } });
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
            <EmailPassword />
          </ConfirmModalProvider>
        </SettingsProvider>
      </MemoryRouter>
    );
    const submitButton = getByText('action.sign_in');

    const emailInput = container.querySelector('input[name="email"]');
    const passwordInput = container.querySelector('input[name="password"]');

    if (emailInput) {
      fireEvent.change(emailInput, { target: { value: 'email@logto.io' } });
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
          <EmailPassword />
        </SettingsProvider>
      </MemoryRouter>
    );
    const submitButton = getByText('action.sign_in');

    const emailInput = container.querySelector('input[name="email"]');
    const passwordInput = container.querySelector('input[name="password"]');

    if (emailInput) {
      fireEvent.change(emailInput, { target: { value: 'email' } });
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
        expect(signInWithEmailPassword).toBeCalledWith('email', 'password', undefined);
      });
    });
  });
});
