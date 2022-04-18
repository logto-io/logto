import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import { sendRegisterEmailPasscode } from '@/apis/register';
import { sendSignInEmailPasscode } from '@/apis/sign-in';

import EmailPasswordless from './EmailPasswordless';

jest.mock('@/apis/sign-in', () => ({
  sendSignInEmailPasscode: jest.fn(async () => Promise.resolve()),
}));
jest.mock('@/apis/register', () => ({
  sendRegisterEmailPasscode: jest.fn(async () => Promise.resolve()),
}));
jest.mock('@/hooks/page-context', () =>
  React.createContext({
    loading: false,
    setLoading: jest.fn(),
  })
);

describe('<EmailPasswordless/>', () => {
  test('render', () => {
    const { queryByText, container } = render(
      <MemoryRouter>
        <EmailPasswordless type="sign-in" />
      </MemoryRouter>
    );
    expect(container.querySelector('input[name="email"]')).not.toBeNull();
    expect(queryByText('action.continue')).not.toBeNull();
    expect(queryByText('description.terms_of_use')).not.toBeNull();
  });

  test('required email with error message', () => {
    const { queryByText, container, getByText } = render(
      <MemoryRouter>
        <EmailPasswordless type="sign-in" />
      </MemoryRouter>
    );
    const submitButton = getByText('action.continue');

    fireEvent.click(submitButton);
    expect(queryByText('invalid_email')).not.toBeNull();
    expect(sendSignInEmailPasscode).not.toBeCalled();

    const emailInput = container.querySelector('input[name="email"]');

    if (emailInput) {
      fireEvent.change(emailInput, { target: { value: 'foo' } });
      expect(queryByText('invalid_email')).not.toBeNull();

      fireEvent.change(emailInput, { target: { value: 'foo@logto.io' } });
      expect(queryByText('invalid_email')).toBeNull();
    }
  });

  test('required terms of agreement with error message', () => {
    const { queryByText, container, getByText } = render(
      <MemoryRouter>
        <EmailPasswordless type="sign-in" />
      </MemoryRouter>
    );
    const submitButton = getByText('action.continue');
    const emailInput = container.querySelector('input[name="email"]');

    if (emailInput) {
      fireEvent.change(emailInput, { target: { value: 'foo@logto.io' } });
    }

    fireEvent.click(submitButton);
    expect(queryByText('agree_terms_required')).not.toBeNull();
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
    const termsButton = getByText('description.agree_with_terms');
    fireEvent.click(termsButton);

    const submitButton = getByText('action.continue');

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
    const termsButton = getByText('description.agree_with_terms');
    fireEvent.click(termsButton);

    const submitButton = getByText('action.continue');

    await waitFor(() => {
      fireEvent.click(submitButton);
    });

    expect(sendRegisterEmailPasscode).toBeCalledWith('foo@logto.io');
  });
});
