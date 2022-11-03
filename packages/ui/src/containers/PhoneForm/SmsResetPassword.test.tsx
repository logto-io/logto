import { SignInIdentifier } from '@logto/schemas';
import { fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import { sendForgotPasswordSmsPasscode } from '@/apis/forgot-password';
import { UserFlow } from '@/types';
import { getDefaultCountryCallingCode } from '@/utils/country-code';

import SmsResetPassword from './SmsResetPassword';

const mockedNavigate = jest.fn();

// PhoneNum CountryCode detection
jest.mock('i18next', () => ({
  language: 'en',
}));

jest.mock('@/apis/forgot-password', () => ({
  sendForgotPasswordSmsPasscode: jest.fn(() => ({ success: true })),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

describe('SmsRegister', () => {
  const phone = '8573333333';
  const defaultCountryCallingCode = getDefaultCountryCallingCode();
  const fullPhoneNumber = `${defaultCountryCallingCode}${phone}`;

  test('register form submit', async () => {
    const { container, getByText } = renderWithPageContext(
      <MemoryRouter>
        <SmsResetPassword />
      </MemoryRouter>
    );
    const phoneInput = container.querySelector('input[name="phone"]');

    if (phoneInput) {
      fireEvent.change(phoneInput, { target: { value: phone } });
    }

    const submitButton = getByText('action.continue');

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(sendForgotPasswordSmsPasscode).toBeCalledWith(fullPhoneNumber);
      expect(mockedNavigate).toBeCalledWith(
        {
          pathname: `/${UserFlow.forgotPassword}/${SignInIdentifier.Sms}/passcode-validation`,
          search: '',
        },
        { state: { phone: fullPhoneNumber } }
      );
    });
  });
});
