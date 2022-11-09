import { SignInIdentifier } from '@logto/schemas';
import { fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import { sendSignInEmailPasscode } from '@/apis/sign-in';

import EmailSignIn from './EmailSignIn';

const mockedNavigate = jest.fn();

jest.mock('@/apis/sign-in', () => ({
  sendSignInEmailPasscode: jest.fn(() => ({ success: true })),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

describe('EmailSignIn', () => {
  const email = 'foo@logto.io';

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('EmailSignIn form with password as primary method', async () => {
    const { container, getByText } = renderWithPageContext(
      <MemoryRouter>
        <EmailSignIn
          signInMethod={{
            identifier: SignInIdentifier.Email,
            password: true,
            verificationCode: true,
            isPasswordPrimary: true,
          }}
        />
      </MemoryRouter>
    );
    const emailInput = container.querySelector('input[name="email"]');

    if (emailInput) {
      fireEvent.change(emailInput, { target: { value: email } });
    }

    const submitButton = getByText('action.sign_in');

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(sendSignInEmailPasscode).not.toBeCalled();
      expect(mockedNavigate).toBeCalledWith(
        { pathname: '/sign-in/email/password', search: '' },
        { state: { email } }
      );
    });
  });

  test('EmailSignIn form with password true but not primary verification code false', async () => {
    const { container, getByText } = renderWithPageContext(
      <MemoryRouter>
        <EmailSignIn
          signInMethod={{
            identifier: SignInIdentifier.Email,
            password: true,
            verificationCode: false,
            isPasswordPrimary: true,
          }}
        />
      </MemoryRouter>
    );
    const emailInput = container.querySelector('input[name="email"]');

    if (emailInput) {
      fireEvent.change(emailInput, { target: { value: email } });
    }

    const submitButton = getByText('action.sign_in');

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(sendSignInEmailPasscode).not.toBeCalled();
      expect(mockedNavigate).toBeCalledWith(
        { pathname: '/sign-in/email/password', search: '' },
        { state: { email } }
      );
    });
  });

  test('EmailSignIn form with password true but not primary verification code true', async () => {
    const { container, getByText } = renderWithPageContext(
      <MemoryRouter>
        <EmailSignIn
          signInMethod={{
            identifier: SignInIdentifier.Email,
            password: true,
            verificationCode: true,
            isPasswordPrimary: false,
          }}
        />
      </MemoryRouter>
    );

    const emailInput = container.querySelector('input[name="email"]');

    if (emailInput) {
      fireEvent.change(emailInput, { target: { value: email } });
    }

    const submitButton = getByText('action.sign_in');

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(sendSignInEmailPasscode).toBeCalledWith(email);
      expect(mockedNavigate).toBeCalledWith(
        { pathname: '/sign-in/email/passcode-validation', search: '' },
        { state: { email } }
      );
    });
  });

  test('EmailSignIn form with password false but primary verification code true', async () => {
    const { container, getByText } = renderWithPageContext(
      <MemoryRouter>
        <EmailSignIn
          signInMethod={{
            identifier: SignInIdentifier.Email,
            password: false,
            verificationCode: true,
            isPasswordPrimary: true,
          }}
        />
      </MemoryRouter>
    );

    const emailInput = container.querySelector('input[name="email"]');

    if (emailInput) {
      fireEvent.change(emailInput, { target: { value: email } });
    }

    const submitButton = getByText('action.sign_in');

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(sendSignInEmailPasscode).toBeCalledWith(email);
      expect(mockedNavigate).toBeCalledWith(
        { pathname: '/sign-in/email/passcode-validation', search: '' },
        { state: { email } }
      );
    });
  });
});
