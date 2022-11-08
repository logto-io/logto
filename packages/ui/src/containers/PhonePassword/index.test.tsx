import { fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { signInWithPhonePassword } from '@/apis/sign-in';
import ConfirmModalProvider from '@/containers/ConfirmModalProvider';

import PhonePassword from '.';

jest.mock('@/apis/sign-in', () => ({ signInWithPhonePassword: jest.fn(async () => 0) }));
// Terms Iframe Modal only shown on mobile device
jest.mock('react-device-detect', () => ({
  isMobile: true,
}));
// PhoneNum CountryCode detection
jest.mock('i18next', () => ({
  language: 'en',
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('<PhonePassword>', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  const phoneNumber = '8573333333';

  test('render', () => {
    const { queryByText, container } = renderWithPageContext(<PhonePassword />);
    expect(container.querySelector('input[name="phone"]')).not.toBeNull();
    expect(container.querySelector('input[name="password"]')).not.toBeNull();
    expect(queryByText('action.sign_in')).not.toBeNull();
  });

  test('render with terms settings enabled', () => {
    const { queryByText } = renderWithPageContext(
      <MemoryRouter>
        <SettingsProvider>
          <PhonePassword />
        </SettingsProvider>
      </MemoryRouter>
    );
    expect(queryByText('description.agree_with_terms')).not.toBeNull();
    expect(queryByText('action.forgot_password')).not.toBeNull();
  });

  test('required inputs with error message', () => {
    const { queryByText, getByText, container } = renderWithPageContext(<PhonePassword />);
    const submitButton = getByText('action.sign_in');

    fireEvent.click(submitButton);

    expect(queryByText('invalid_phone')).not.toBeNull();
    expect(queryByText('password_required')).not.toBeNull();

    const phoneInput = container.querySelector('input[name="phone"]');
    const passwordInput = container.querySelector('input[name="password"]');

    expect(phoneInput).not.toBeNull();
    expect(passwordInput).not.toBeNull();

    if (phoneInput) {
      fireEvent.change(phoneInput, { target: { value: phoneNumber } });
    }

    if (passwordInput) {
      fireEvent.change(passwordInput, { target: { value: 'password' } });
    }

    expect(queryByText('invalid_phone')).toBeNull();
    expect(queryByText('password_required')).toBeNull();
  });

  test('should show terms confirm modal', async () => {
    const { queryByText, getByText, container } = renderWithPageContext(
      <MemoryRouter>
        <SettingsProvider>
          <ConfirmModalProvider>
            <PhonePassword />
          </ConfirmModalProvider>
        </SettingsProvider>
      </MemoryRouter>
    );
    const submitButton = getByText('action.sign_in');

    const phoneInput = container.querySelector('input[name="phone"]');
    const passwordInput = container.querySelector('input[name="password"]');

    if (phoneInput) {
      fireEvent.change(phoneInput, { target: { value: phoneNumber } });
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
            <PhonePassword />
          </ConfirmModalProvider>
        </SettingsProvider>
      </MemoryRouter>
    );
    const submitButton = getByText('action.sign_in');

    const phoneInput = container.querySelector('input[name="phone"]');
    const passwordInput = container.querySelector('input[name="password"]');

    if (phoneInput) {
      fireEvent.change(phoneInput, { target: { value: phoneNumber } });
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
          <PhonePassword />
        </SettingsProvider>
      </MemoryRouter>
    );
    const submitButton = getByText('action.sign_in');

    const phoneInput = container.querySelector('input[name="phone"]');
    const passwordInput = container.querySelector('input[name="password"]');

    if (phoneInput) {
      fireEvent.change(phoneInput, { target: { value: 'phone' } });
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
        expect(signInWithPhonePassword).toBeCalledWith('phone', 'password', undefined);
      });
    });
  });
});
