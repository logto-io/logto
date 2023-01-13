import { SignInIdentifier, InteractionEvent } from '@logto/schemas';
import { fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import { sendVerificationCode, putInteraction } from '@/apis/interaction';
import { getDefaultCountryCallingCode } from '@/utils/country-code';

import PhoneSignIn from './PhoneSignIn';

const mockedNavigate = jest.fn();

// PhoneNum CountryCode detection
jest.mock('i18next', () => ({
  language: 'en',
}));

jest.mock('@/apis/interaction', () => ({
  sendVerificationCode: jest.fn(() => ({ success: true })),
  putInteraction: jest.fn(() => ({ success: true })),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

describe('PhoneSignIn', () => {
  const phone = '8573333333';
  const defaultCountryCallingCode = getDefaultCountryCallingCode();
  const fullPhoneNumber = `${defaultCountryCallingCode}${phone}`;

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('PhoneSignIn form with password as primary method', async () => {
    const { container, getByText } = renderWithPageContext(
      <MemoryRouter>
        <PhoneSignIn
          signInMethod={{
            identifier: SignInIdentifier.Phone,
            password: true,
            verificationCode: true,
            isPasswordPrimary: true,
          }}
        />
      </MemoryRouter>
    );
    const phoneInput = container.querySelector('input[name="phone"]');

    if (phoneInput) {
      fireEvent.change(phoneInput, { target: { value: phone } });
    }

    const submitButton = getByText('action.sign_in');

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(putInteraction).not.toBeCalled();
      expect(sendVerificationCode).not.toBeCalled();
      expect(mockedNavigate).toBeCalledWith(
        { pathname: '/sign-in/phone/password' },
        { state: { phone: fullPhoneNumber } }
      );
    });
  });

  test('PhoneSignIn form with password true, primary true but verification code false', async () => {
    const { container, getByText } = renderWithPageContext(
      <MemoryRouter>
        <PhoneSignIn
          signInMethod={{
            identifier: SignInIdentifier.Phone,
            password: true,
            verificationCode: false,
            isPasswordPrimary: true,
          }}
        />
      </MemoryRouter>
    );
    const phoneInput = container.querySelector('input[name="phone"]');

    if (phoneInput) {
      fireEvent.change(phoneInput, { target: { value: phone } });
    }

    const submitButton = getByText('action.sign_in');

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(putInteraction).not.toBeCalled();
      expect(sendVerificationCode).not.toBeCalled();
      expect(mockedNavigate).toBeCalledWith(
        { pathname: '/sign-in/phone/password' },
        { state: { phone: fullPhoneNumber } }
      );
    });
  });

  test('PhoneSignIn form with password true but is primary false and verification code true', async () => {
    const { container, getByText } = renderWithPageContext(
      <MemoryRouter>
        <PhoneSignIn
          signInMethod={{
            identifier: SignInIdentifier.Phone,
            password: true,
            verificationCode: true,
            isPasswordPrimary: false,
          }}
        />
      </MemoryRouter>
    );

    const phoneInput = container.querySelector('input[name="phone"]');

    if (phoneInput) {
      fireEvent.change(phoneInput, { target: { value: phone } });
    }

    const submitButton = getByText('action.sign_in');

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(putInteraction).toBeCalledWith(InteractionEvent.SignIn);
      expect(sendVerificationCode).toBeCalledWith({ phone: fullPhoneNumber });
      expect(mockedNavigate).toBeCalledWith(
        { pathname: '/sign-in/phone/verification-code' },
        { state: { phone: fullPhoneNumber } }
      );
    });
  });

  test('PhoneSignIn form with password false but primary verification code true', async () => {
    const { container, getByText } = renderWithPageContext(
      <MemoryRouter>
        <PhoneSignIn
          signInMethod={{
            identifier: SignInIdentifier.Phone,
            password: false,
            verificationCode: true,
            isPasswordPrimary: true,
          }}
        />
      </MemoryRouter>
    );

    const phoneInput = container.querySelector('input[name="phone"]');

    if (phoneInput) {
      fireEvent.change(phoneInput, { target: { value: phone } });
    }

    const submitButton = getByText('action.sign_in');

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(putInteraction).toBeCalledWith(InteractionEvent.SignIn);
      expect(sendVerificationCode).toBeCalledWith({ phone: fullPhoneNumber });
      expect(mockedNavigate).toBeCalledWith(
        { pathname: '/sign-in/phone/verification-code' },
        { state: { phone: fullPhoneNumber } }
      );
    });
  });
});
