import { SignInIdentifier } from '@logto/schemas';
import { fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import { sendSignInSmsPasscode } from '@/apis/sign-in';
import { getDefaultCountryCallingCode } from '@/utils/country-code';

import SmsSignIn from './SmsSignIn';

const mockedNavigate = jest.fn();

// PhoneNum CountryCode detection
jest.mock('i18next', () => ({
  language: 'en',
}));

jest.mock('@/apis/sign-in', () => ({
  sendSignInSmsPasscode: jest.fn(() => ({ success: true })),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

describe('SmsSignIn', () => {
  const phone = '8573333333';
  const defaultCountryCallingCode = getDefaultCountryCallingCode();
  const fullPhoneNumber = `${defaultCountryCallingCode}${phone}`;

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('SmsSignIn form with password as primary method', async () => {
    const { container, getByText } = renderWithPageContext(
      <MemoryRouter>
        <SmsSignIn
          signInMethod={{
            identifier: SignInIdentifier.Sms,
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
      expect(sendSignInSmsPasscode).not.toBeCalled();
      expect(mockedNavigate).toBeCalledWith(
        { pathname: '/sign-in/sms/password', search: '' },
        { state: { phone: fullPhoneNumber } }
      );
    });
  });

  test('SmsSignIn form with password true, primary true but verification code false', async () => {
    const { container, getByText } = renderWithPageContext(
      <MemoryRouter>
        <SmsSignIn
          signInMethod={{
            identifier: SignInIdentifier.Sms,
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
      expect(sendSignInSmsPasscode).not.toBeCalled();
      expect(mockedNavigate).toBeCalledWith(
        { pathname: '/sign-in/sms/password', search: '' },
        { state: { phone: fullPhoneNumber } }
      );
    });
  });

  test('SmsSignIn form with password true but is primary false and verification code true', async () => {
    const { container, getByText } = renderWithPageContext(
      <MemoryRouter>
        <SmsSignIn
          signInMethod={{
            identifier: SignInIdentifier.Sms,
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
      expect(sendSignInSmsPasscode).toBeCalledWith(fullPhoneNumber);
      expect(mockedNavigate).toBeCalledWith(
        { pathname: '/sign-in/sms/passcode-validation', search: '' },
        { state: { phone: fullPhoneNumber } }
      );
    });
  });

  test('SmsSignIn form with password false but primary verification code true', async () => {
    const { container, getByText } = renderWithPageContext(
      <MemoryRouter>
        <SmsSignIn
          signInMethod={{
            identifier: SignInIdentifier.Sms,
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
      expect(sendSignInSmsPasscode).toBeCalledWith(fullPhoneNumber);
      expect(mockedNavigate).toBeCalledWith(
        { pathname: '/sign-in/sms/passcode-validation', search: '' },
        { state: { phone: fullPhoneNumber } }
      );
    });
  });
});
