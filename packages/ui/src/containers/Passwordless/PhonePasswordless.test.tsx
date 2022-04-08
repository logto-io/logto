import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import { sendPhonePasscode as sendRegisterPhonePasscode } from '@/apis/register';
import { sendPhonePasscode as sendSignInPhonePasscode } from '@/apis/sign-in';
import { defaultCountryCallingCode } from '@/hooks/use-phone-number';

import PhonePasswordless from './PhonePasswordless';

jest.mock('@/apis/sign-in', () => ({ sendPhonePasscode: jest.fn(async () => Promise.resolve()) }));
jest.mock('@/apis/register', () => ({ sendPhonePasscode: jest.fn(async () => Promise.resolve()) }));
jest.mock('@/hooks/page-context', () =>
  React.createContext({
    loading: false,
    setLoading: jest.fn(),
  })
);

describe('<PhonePasswordless/>', () => {
  const phoneNumber = '18888888888';

  test('render', () => {
    const { queryByText, container } = render(
      <MemoryRouter>
        <PhonePasswordless type="sign-in" />
      </MemoryRouter>
    );
    expect(container.querySelector('input[name="phone"]')).not.toBeNull();
    expect(queryByText('action.continue')).not.toBeNull();
    expect(queryByText('description.terms_of_use')).not.toBeNull();
  });

  test('required phone with error message', () => {
    const { queryByText, container, getByText } = render(
      <MemoryRouter>
        <PhonePasswordless type="sign-in" />
      </MemoryRouter>
    );
    const submitButton = getByText('action.continue');

    fireEvent.click(submitButton);
    expect(queryByText('invalid_phone')).not.toBeNull();
    expect(sendSignInPhonePasscode).not.toBeCalled();

    const phoneInput = container.querySelector('input[name="phone"]');

    if (phoneInput) {
      fireEvent.change(phoneInput, { target: { value: '1113' } });
      expect(queryByText('invalid_phone')).not.toBeNull();

      fireEvent.change(phoneInput, { target: { value: phoneNumber } });
      expect(queryByText('invalid_phone')).toBeNull();
    }
  });

  test('required terms of agreement with error message', () => {
    const { queryByText, container, getByText } = render(
      <MemoryRouter>
        <PhonePasswordless type="sign-in" />
      </MemoryRouter>
    );
    const submitButton = getByText('action.continue');
    const phoneInput = container.querySelector('input[name="phone"]');

    if (phoneInput) {
      fireEvent.change(phoneInput, { target: { value: phoneNumber } });
    }

    fireEvent.click(submitButton);
    expect(queryByText('agree_terms_required')).not.toBeNull();
  });

  test('signin method properly', async () => {
    const { container, getByText } = render(
      <MemoryRouter>
        <PhonePasswordless type="sign-in" />
      </MemoryRouter>
    );
    const phoneInput = container.querySelector('input[name="phone"]');

    if (phoneInput) {
      fireEvent.change(phoneInput, { target: { value: phoneNumber } });
    }
    const termsButton = getByText('description.agree_with_terms');
    fireEvent.click(termsButton);

    const submitButton = getByText('action.continue');

    await waitFor(() => {
      fireEvent.click(submitButton);
    });

    expect(sendSignInPhonePasscode).toBeCalledWith(`${defaultCountryCallingCode}${phoneNumber}`);
  });

  test('register method properly', async () => {
    const { container, getByText } = render(
      <MemoryRouter>
        <PhonePasswordless type="register" />
      </MemoryRouter>
    );
    const phoneInput = container.querySelector('input[name="phone"]');

    if (phoneInput) {
      fireEvent.change(phoneInput, { target: { value: phoneNumber } });
    }
    const termsButton = getByText('description.agree_with_terms');
    fireEvent.click(termsButton);

    const submitButton = getByText('action.continue');

    await waitFor(() => {
      fireEvent.click(submitButton);
    });

    expect(sendRegisterPhonePasscode).toBeCalledWith(`${defaultCountryCallingCode}${phoneNumber}`);
  });
});
