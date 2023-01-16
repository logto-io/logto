import { InteractionEvent, SignInIdentifier } from '@logto/schemas';
import { fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import { sendVerificationCode, putInteraction } from '@/apis/interaction';

import EmailSignIn from './EmailSignIn';

const mockedNavigate = jest.fn();

jest.mock('@/apis/interaction', () => ({
  sendVerificationCode: jest.fn(() => ({ success: true })),
  putInteraction: jest.fn(() => ({ success: true })),
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
      expect(putInteraction).not.toBeCalled();
      expect(sendVerificationCode).not.toBeCalled();
      expect(mockedNavigate).toBeCalledWith(
        { pathname: '/sign-in/email/password' },
        { state: { email } }
      );
    });
  });

  test('EmailSignIn form with password true but verification code false', async () => {
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
      expect(putInteraction).not.toBeCalled();
      expect(sendVerificationCode).not.toBeCalled();
      expect(mockedNavigate).toBeCalledWith(
        { pathname: '/sign-in/email/password' },
        { state: { email } }
      );
    });
  });

  test('EmailSignIn form with password true but not primary, verification code true', async () => {
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
      expect(putInteraction).toBeCalledWith(InteractionEvent.SignIn);
      expect(sendVerificationCode).toBeCalledWith({ email });
      expect(mockedNavigate).toBeCalledWith(
        { pathname: '/sign-in/email/verification-code', search: '' },
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
      expect(putInteraction).toBeCalledWith(InteractionEvent.SignIn);
      expect(sendVerificationCode).toBeCalledWith({ email });
      expect(mockedNavigate).toBeCalledWith(
        { pathname: '/sign-in/email/verification-code', search: '' },
        { state: { email } }
      );
    });
  });
});
