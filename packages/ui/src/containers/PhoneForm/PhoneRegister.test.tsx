import { InteractionEvent } from '@logto/schemas';
import { fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import { putInteraction, sendVerificationCode } from '@/apis/interaction';
import { getDefaultCountryCallingCode } from '@/utils/country-code';

import PhoneRegister from './PhoneRegister';

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

describe('PhoneRegister', () => {
  const phone = '8573333333';
  const defaultCountryCallingCode = getDefaultCountryCallingCode();
  const fullPhoneNumber = `${defaultCountryCallingCode}${phone}`;

  test('register form submit', async () => {
    const { container, getByText } = renderWithPageContext(
      <MemoryRouter>
        <PhoneRegister />
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
      expect(putInteraction).toBeCalledWith(InteractionEvent.Register);
      expect(sendVerificationCode).toBeCalledWith({ phone: fullPhoneNumber });
      expect(mockedNavigate).toBeCalledWith(
        { pathname: '/register/phone/verification-code' },
        { state: { phone: fullPhoneNumber } }
      );
    });
  });
});
