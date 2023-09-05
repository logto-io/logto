import { render, fireEvent, act, waitFor } from '@testing-library/react';

import SetPassword from './SetPassword';

describe('<SetPassword />', () => {
  const submit = jest.fn();
  const clearError = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('default render ', () => {
    const { queryByText, container } = render(
      <SetPassword errorMessage="error" onSubmit={submit} />
    );
    expect(container.querySelector('input[name="newPassword"]')).not.toBeNull();
    expect(container.querySelector('input[name="confirmPassword"]')).not.toBeNull();
    expect(queryByText('error')).not.toBeNull();
    expect(queryByText('action.save_password')).not.toBeNull();
  });

  test('password is required', async () => {
    const { queryByText, getByText } = render(
      <SetPassword clearErrorMessage={clearError} onSubmit={submit} />
    );

    const submitButton = getByText('action.save_password');

    act(() => {
      fireEvent.submit(submitButton);
    });

    expect(clearError).toBeCalled();

    await waitFor(() => {
      expect(queryByText('error.password_required')).not.toBeNull();
    });

    expect(submit).not.toBeCalled();
  });

  test('password mismatch with confirmPassword should throw', async () => {
    const { queryByText, getByText, container } = render(<SetPassword onSubmit={submit} />);
    const submitButton = getByText('action.save_password');
    const passwordInput = container.querySelector('input[name="newPassword"]');
    const confirmPasswordInput = container.querySelector('input[name="confirmPassword"]');

    act(() => {
      if (passwordInput) {
        fireEvent.change(passwordInput, { target: { value: '1234asdf' } });
      }

      if (confirmPasswordInput) {
        fireEvent.change(confirmPasswordInput, { target: { value: '0234asdf' } });
      }

      fireEvent.submit(submitButton);
    });

    await waitFor(() => {
      expect(queryByText('error.passwords_do_not_match')).not.toBeNull();
    });

    expect(submit).not.toBeCalled();

    act(() => {
      // Clear Error
      if (confirmPasswordInput) {
        fireEvent.change(confirmPasswordInput, { target: { value: '1234asdf' } });
        fireEvent.blur(confirmPasswordInput);
      }
    });

    await waitFor(() => {
      expect(queryByText('error.passwords_do_not_match')).toBeNull();
    });
  });

  test('should submit properly', async () => {
    const { queryByText, getByText, container } = render(<SetPassword onSubmit={submit} />);
    const submitButton = getByText('action.save_password');
    const passwordInput = container.querySelector('input[name="newPassword"]');
    const confirmPasswordInput = container.querySelector('input[name="confirmPassword"]');

    act(() => {
      if (passwordInput) {
        fireEvent.change(passwordInput, { target: { value: '1234asdf' } });
      }

      if (confirmPasswordInput) {
        fireEvent.change(confirmPasswordInput, { target: { value: '1234asdf' } });
      }

      fireEvent.submit(submitButton);
    });

    expect(queryByText('error.passwords_do_not_match')).toBeNull();

    await waitFor(() => {
      expect(submit).toBeCalledWith('1234asdf');
    });
  });
});
