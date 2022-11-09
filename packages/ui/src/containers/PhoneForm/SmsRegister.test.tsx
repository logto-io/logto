import { fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import { sendRegisterSmsPasscode } from '@/apis/register';
import { getDefaultCountryCallingCode } from '@/utils/country-code';

import SmsRegister from './SmsRegister';

const mockedNavigate = jest.fn();

// PhoneNum CountryCode detection
jest.mock('i18next', () => ({
  language: 'en',
}));

jest.mock('@/apis/register', () => ({
  sendRegisterSmsPasscode: jest.fn(() => ({ success: true })),
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
        <SmsRegister />
      </MemoryRouter>
    );
    const phoneInput = container.querySelector('input[name="phone"]');

    if (phoneInput) {
      fireEvent.change(phoneInput, { target: { value: phone } });
    }

    const submitButton = getByText('action.create_account');

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(sendRegisterSmsPasscode).toBeCalledWith(fullPhoneNumber);
      expect(mockedNavigate).toBeCalledWith(
        { pathname: '/register/sms/passcode-validation', search: '' },
        { state: { phone: fullPhoneNumber } }
      );
    });
  });
});
