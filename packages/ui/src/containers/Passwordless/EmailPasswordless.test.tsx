import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import { sendEmailPasscode as sendRegisterEmailPasscode } from '@/apis/register';
import { sendEmailPasscode as sendSignInEmailPasscode } from '@/apis/sign-in';

import EmailPasswordless from './EmailPasswordless';

jest.mock('@/apis/sign-in', () => ({ sendEmailPasscode: jest.fn(async () => Promise.resolve()) }));
jest.mock('@/apis/register', () => ({ sendEmailPasscode: jest.fn(async () => Promise.resolve()) }));

describe('<EmailPasswordless/>', () => {
  test('render', () => {
    const { queryByText, container } = render(
      <MemoryRouter>
        <EmailPasswordless type="sign-in" />
      </MemoryRouter>
    );
    expect(container.querySelector('input[name="email"]')).not.toBeNull();
    expect(queryByText('general.continue')).not.toBeNull();
    expect(queryByText('sign_in.terms_of_use')).not.toBeNull();
  });

  test('required email with error message', () => {
    const { queryByText, container, getByText } = render(
      <MemoryRouter>
        <EmailPasswordless type="sign-in" />
      </MemoryRouter>
    );
    const submitButton = getByText('general.continue');

    fireEvent.click(submitButton);
    expect(queryByText('errors:user.invalid_email')).not.toBeNull();
    expect(sendSignInEmailPasscode).not.toBeCalled();

    const emailInput = container.querySelector('input[name="email"]');

    if (emailInput) {
      fireEvent.change(emailInput, { target: { value: 'foo' } });
      expect(queryByText('errors:user.invalid_email')).not.toBeNull();

      fireEvent.change(emailInput, { target: { value: 'foo@logto.io' } });
      expect(queryByText('errors:user.invalid_email')).toBeNull();
    }
  });

  test('required terms of agreement with error message', () => {
    const { queryByText, container, getByText } = render(
      <MemoryRouter>
        <EmailPasswordless type="sign-in" />
      </MemoryRouter>
    );
    const submitButton = getByText('general.continue');
    const emailInput = container.querySelector('input[name="email"]');

    if (emailInput) {
      fireEvent.change(emailInput, { target: { value: 'foo@logto.io' } });
    }

    fireEvent.click(submitButton);
    expect(queryByText('errors:form.terms_required')).not.toBeNull();
  });

  test('signin method properly', async () => {
    const { container, getByText } = render(
      <MemoryRouter>
        <EmailPasswordless type="sign-in" />
      </MemoryRouter>
    );
    const emailInput = container.querySelector('input[name="email"]');

    if (emailInput) {
      fireEvent.change(emailInput, { target: { value: 'foo@logto.io' } });
    }
    const termsButton = getByText('sign_in.terms_agreement_prefix');
    fireEvent.click(termsButton);

    const submitButton = getByText('general.continue');

    await waitFor(() => {
      fireEvent.click(submitButton);
    });

    expect(sendSignInEmailPasscode).toBeCalledWith('foo@logto.io');
  });

  test('register method properly', async () => {
    const { container, getByText } = render(
      <MemoryRouter>
        <EmailPasswordless type="register" />
      </MemoryRouter>
    );
    const emailInput = container.querySelector('input[name="email"]');

    if (emailInput) {
      fireEvent.change(emailInput, { target: { value: 'foo@logto.io' } });
    }
    const termsButton = getByText('sign_in.terms_agreement_prefix');
    fireEvent.click(termsButton);

    const submitButton = getByText('general.continue');

    await waitFor(() => {
      fireEvent.click(submitButton);
    });

    expect(sendRegisterEmailPasscode).toBeCalledWith('foo@logto.io');
  });
});
