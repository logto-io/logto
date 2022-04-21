import { fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import renderWithContext from '@/__mocks__/RenderWithContext';
import { sendRegisterSmsPasscode } from '@/apis/register';
import { sendSignInSmsPasscode } from '@/apis/sign-in';
import { defaultCountryCallingCode } from '@/hooks/use-phone-number';

import PhonePasswordless from './PhonePasswordless';

jest.mock('@/apis/sign-in', () => ({
  sendSignInSmsPasscode: jest.fn(async () => Promise.resolve()),
}));
jest.mock('@/apis/register', () => ({
  sendRegisterSmsPasscode: jest.fn(async () => Promise.resolve()),
}));

describe('<PhonePasswordless/>', () => {
  const phoneNumber = '18888888888';

  test('render', () => {
    const { queryByText, container } = renderWithContext(
      <MemoryRouter>
        <PhonePasswordless type="sign-in" />
      </MemoryRouter>
    );
    expect(container.querySelector('input[name="phone"]')).not.toBeNull();
    expect(queryByText('action.continue')).not.toBeNull();
    expect(queryByText('description.terms_of_use')).not.toBeNull();
  });

  test('required phone with error message', () => {
    const { queryByText, container, getByText } = renderWithContext(
      <MemoryRouter>
        <PhonePasswordless type="sign-in" />
      </MemoryRouter>
    );
    const submitButton = getByText('action.continue');

    fireEvent.click(submitButton);
    expect(queryByText('invalid_phone')).not.toBeNull();
    expect(sendSignInSmsPasscode).not.toBeCalled();

    const phoneInput = container.querySelector('input[name="phone"]');

    if (phoneInput) {
      fireEvent.change(phoneInput, { target: { value: '1113' } });
      expect(queryByText('invalid_phone')).not.toBeNull();

      fireEvent.change(phoneInput, { target: { value: phoneNumber } });
      expect(queryByText('invalid_phone')).toBeNull();
    }
  });

  test('required terms of agreement with error message', () => {
    const { queryByText, container, getByText } = renderWithContext(
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
    const { container, getByText } = renderWithContext(
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

    expect(sendSignInSmsPasscode).toBeCalledWith(`${defaultCountryCallingCode}${phoneNumber}`);
  });

  test('register method properly', async () => {
    const { container, getByText } = renderWithContext(
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

    expect(sendRegisterSmsPasscode).toBeCalledWith(`${defaultCountryCallingCode}${phoneNumber}`);
  });
});
