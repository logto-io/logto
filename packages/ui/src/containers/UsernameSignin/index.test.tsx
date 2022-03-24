import { fireEvent, render } from '@testing-library/react';
import React from 'react';

import { signInBasic } from '@/apis/sign-in';

import UsernameSignin from '.';

jest.mock('@/apis/sign-in', () => ({ signInBasic: jest.fn(async () => Promise.resolve()) }));

describe('<UsernameSignin>', () => {
  test('render', () => {
    const { queryByText, container } = render(<UsernameSignin />);
    expect(container.querySelector('input[name="username"]')).not.toBeNull();
    expect(container.querySelector('input[name="password"]')).not.toBeNull();
    expect(queryByText('sign_in.action')).not.toBeNull();
    expect(queryByText('sign_in.forgot_password')).not.toBeNull();
    expect(queryByText('sign_in.terms_of_use')).not.toBeNull();
  });

  test('required inputs with error message', () => {
    const { queryByText, queryAllByText, getByText, container } = render(<UsernameSignin />);
    const submitButton = getByText('sign_in.action');

    fireEvent.click(submitButton);

    expect(queryAllByText('errors:form.required')).toHaveLength(2);

    const usernameInput = container.querySelector('input[name="username"]');
    const passwordInput = container.querySelector('input[name="password"]');

    expect(usernameInput).not.toBeNull();
    expect(passwordInput).not.toBeNull();

    if (usernameInput) {
      fireEvent.change(usernameInput, { target: { value: 'username' } });
    }

    if (passwordInput) {
      fireEvent.change(passwordInput, { target: { value: 'password' } });
    }

    fireEvent.click(submitButton);

    expect(queryByText('errors:form.required')).toBeNull();
    expect(queryByText('errors:form.terms_required')).not.toBeNull();

    expect(signInBasic).not.toBeCalled();
  });

  test('submit form', () => {
    const { getByText, container } = render(<UsernameSignin />);
    const submitButton = getByText('sign_in.action');

    const usernameInput = container.querySelector('input[name="username"]');
    const passwordInput = container.querySelector('input[name="password"]');

    if (usernameInput) {
      fireEvent.change(usernameInput, { target: { value: 'username' } });
    }

    if (passwordInput) {
      fireEvent.change(passwordInput, { target: { value: 'password' } });
    }

    const termsButton = getByText('sign_in.terms_agreement_prefix');
    fireEvent.click(termsButton);

    fireEvent.click(submitButton);

    expect(signInBasic).toBeCalledWith('username', 'password');
  });
});
