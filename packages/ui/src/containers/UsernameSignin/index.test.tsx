import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';

import { signInBasic } from '@/apis/sign-in';

import UsernameSignin from '.';

jest.mock('@/apis/sign-in', () => ({ signInBasic: jest.fn(async () => Promise.resolve()) }));
jest.mock('@/hooks/page-context', () =>
  React.createContext({
    loading: false,
    setLoading: jest.fn(),
  })
);

describe('<UsernameSignin>', () => {
  test('render', () => {
    const { queryByText, container } = render(<UsernameSignin />);
    expect(container.querySelector('input[name="username"]')).not.toBeNull();
    expect(container.querySelector('input[name="password"]')).not.toBeNull();
    expect(queryByText('action.sign_in')).not.toBeNull();
    expect(queryByText('description.forgot_password')).not.toBeNull();
    expect(queryByText('description.agree_with_terms')).not.toBeNull();
  });

  test('required inputs with error message', () => {
    const { queryByText, queryAllByText, getByText, container } = render(<UsernameSignin />);
    const submitButton = getByText('action.sign_in');

    fireEvent.click(submitButton);

    expect(queryAllByText('required')).toHaveLength(2);

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

    expect(queryByText('required')).toBeNull();
    expect(queryByText('agree_terms_required')).not.toBeNull();

    expect(signInBasic).not.toBeCalled();
  });

  test('submit form', async () => {
    const { getByText, container } = render(<UsernameSignin />);
    const submitButton = getByText('action.sign_in');

    const usernameInput = container.querySelector('input[name="username"]');
    const passwordInput = container.querySelector('input[name="password"]');

    if (usernameInput) {
      fireEvent.change(usernameInput, { target: { value: 'username' } });
    }

    if (passwordInput) {
      fireEvent.change(passwordInput, { target: { value: 'password' } });
    }

    const termsButton = getByText('description.agree_with_terms');
    fireEvent.click(termsButton);

    await waitFor(() => {
      fireEvent.click(submitButton);
    });

    expect(signInBasic).toBeCalledWith('username', 'password');
  });
});
