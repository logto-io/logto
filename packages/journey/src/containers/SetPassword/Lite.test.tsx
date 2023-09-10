import { render, fireEvent, act, waitFor } from '@testing-library/react';

import Lite from './Lite';

describe('<Lite />', () => {
  const submit = jest.fn();
  const clearError = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('default render ', () => {
    const { queryByText, container } = render(<Lite errorMessage="error" onSubmit={submit} />);
    expect(container.querySelector('input[name="newPassword"]')).not.toBeNull();
    expect(queryByText('error')).not.toBeNull();
    expect(queryByText('action.save_password')).not.toBeNull();
  });

  test('password is required', async () => {
    const { queryByText, getByText } = render(
      <Lite clearErrorMessage={clearError} onSubmit={submit} />
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

  test('should submit properly', async () => {
    const { getByText, container } = render(<Lite onSubmit={submit} />);
    const submitButton = getByText('action.save_password');
    const passwordInput = container.querySelector('input[name="newPassword"]');

    act(() => {
      if (passwordInput) {
        fireEvent.change(passwordInput, { target: { value: '1234asdf' } });
      }

      fireEvent.submit(submitButton);
    });

    await waitFor(() => {
      expect(submit).toBeCalledWith('1234asdf');
    });
  });
});
