import { fireEvent, waitFor } from '@testing-library/react';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { register } from '@/apis/register';

import CreateAccount from '.';

jest.mock('@/apis/register', () => ({
  register: jest.fn(async () => ({ redirectTo: '/' })),
}));

describe('<CreateAccount/>', () => {
  test('default render', () => {
    const { queryByText, container } = renderWithPageContext(<CreateAccount />);
    expect(container.querySelector('input[name="new-username"]')).not.toBeNull();
    expect(container.querySelector('input[name="new-password"]')).not.toBeNull();
    expect(container.querySelector('input[name="confirm-new-password"]')).not.toBeNull();
    expect(queryByText('action.create')).not.toBeNull();
  });

  test('render with terms settings enabled', () => {
    const { queryByText } = renderWithPageContext(
      <SettingsProvider>
        <CreateAccount />
      </SettingsProvider>
    );
    expect(queryByText('description.terms_of_use')).not.toBeNull();
  });

  test('username and password are required', () => {
    const { queryByText, getByText } = renderWithPageContext(<CreateAccount />);
    const submitButton = getByText('action.create');
    fireEvent.click(submitButton);

    expect(queryByText('username_required')).not.toBeNull();
    expect(queryByText('password_required')).not.toBeNull();

    expect(register).not.toBeCalled();
  });

  test('username with initial numeric char should throw', () => {
    const { queryByText, getByText, container } = renderWithPageContext(<CreateAccount />);
    const submitButton = getByText('action.create');

    const usernameInput = container.querySelector('input[name="new-username"]');

    if (usernameInput) {
      fireEvent.change(usernameInput, { target: { value: '1username' } });
    }

    fireEvent.click(submitButton);

    expect(queryByText('username_should_not_start_with_number')).not.toBeNull();

    expect(register).not.toBeCalled();

    // Clear error
    if (usernameInput) {
      fireEvent.change(usernameInput, { target: { value: 'username' } });
    }

    expect(queryByText('username_should_not_start_with_number')).toBeNull();
  });

  test('username with special character should throw', () => {
    const { queryByText, getByText, container } = renderWithPageContext(<CreateAccount />);
    const submitButton = getByText('action.create');
    const usernameInput = container.querySelector('input[name="new-username"]');

    if (usernameInput) {
      fireEvent.change(usernameInput, { target: { value: '@username' } });
    }

    fireEvent.click(submitButton);

    expect(queryByText('username_valid_charset')).not.toBeNull();

    expect(register).not.toBeCalled();

    // Clear error
    if (usernameInput) {
      fireEvent.change(usernameInput, { target: { value: 'username' } });
    }

    expect(queryByText('username_valid_charset')).toBeNull();
  });

  test('password less than 6 chars should throw', () => {
    const { queryByText, getByText, container } = renderWithPageContext(<CreateAccount />);
    const submitButton = getByText('action.create');
    const passwordInput = container.querySelector('input[name="new-password"]');

    if (passwordInput) {
      fireEvent.change(passwordInput, { target: { value: '12345' } });
    }

    fireEvent.click(submitButton);

    expect(queryByText('password_min_length')).not.toBeNull();

    expect(register).not.toBeCalled();

    // Clear error
    if (passwordInput) {
      fireEvent.change(passwordInput, { target: { value: '123456' } });
    }

    expect(queryByText('password_min_length')).toBeNull();
  });

  test('password mismatch with confirmPassword should throw', () => {
    const { queryByText, getByText, container } = renderWithPageContext(<CreateAccount />);
    const submitButton = getByText('action.create');
    const passwordInput = container.querySelector('input[name="new-password"]');
    const confirmPasswordInput = container.querySelector('input[name="confirm-new-password"]');
    const usernameInput = container.querySelector('input[name="username"]');

    if (usernameInput) {
      fireEvent.change(usernameInput, { target: { value: 'username' } });
    }

    if (passwordInput) {
      fireEvent.change(passwordInput, { target: { value: '123456' } });
    }

    if (confirmPasswordInput) {
      fireEvent.change(confirmPasswordInput, { target: { value: '012345' } });
    }

    fireEvent.click(submitButton);

    expect(queryByText('passwords_do_not_match')).not.toBeNull();

    expect(register).not.toBeCalled();

    // Clear Error
    if (confirmPasswordInput) {
      fireEvent.change(confirmPasswordInput, { target: { value: '123456' } });
    }

    expect(queryByText('passwords_do_not_match')).toBeNull();
  });

  test('should clear value when click clear button', async () => {
    const { queryByText, getByText, container } = renderWithPageContext(<CreateAccount />);

    const passwordInput = container.querySelector('input[name="new-password"]');
    const confirmPasswordInput = container.querySelector('input[name="confirm-new-password"]');
    const usernameInput = container.querySelector('input[name="new-username"]');
    const submitButton = getByText('action.create');

    if (usernameInput) {
      fireEvent.change(usernameInput, { target: { value: 'username' } });
    }

    if (passwordInput) {
      fireEvent.change(passwordInput, { target: { value: '123456' } });
    }

    if (confirmPasswordInput) {
      fireEvent.change(confirmPasswordInput, { target: { value: '123456' } });
    }

    const confirmClearButton = confirmPasswordInput?.parentElement?.querySelector('svg');
    const usernameClearButton = usernameInput?.parentElement?.querySelector('svg');
    const passwordClearButton = passwordInput?.parentElement?.querySelector('svg');

    if (confirmClearButton) {
      fireEvent.mouseDown(confirmClearButton);
    }

    await waitFor(() => {
      fireEvent.click(submitButton);
    });

    expect(queryByText('passwords_do_not_match')).not.toBeNull();

    if (usernameClearButton) {
      fireEvent.mouseDown(usernameClearButton);
    }

    if (passwordClearButton) {
      fireEvent.mouseDown(passwordClearButton);
    }

    await waitFor(() => {
      fireEvent.click(submitButton);
    });

    expect(queryByText('username_required')).not.toBeNull();
    expect(queryByText('password_required')).not.toBeNull();
  });

  test('submit form properly with terms settings enabled', async () => {
    const { getByText, container } = renderWithPageContext(
      <SettingsProvider>
        <CreateAccount />
      </SettingsProvider>
    );
    const submitButton = getByText('action.create');
    const passwordInput = container.querySelector('input[name="new-password"]');
    const confirmPasswordInput = container.querySelector('input[name="confirm-new-password"]');
    const usernameInput = container.querySelector('input[name="new-username"]');

    if (usernameInput) {
      fireEvent.change(usernameInput, { target: { value: 'username' } });
    }

    if (passwordInput) {
      fireEvent.change(passwordInput, { target: { value: '123456' } });
    }

    if (confirmPasswordInput) {
      fireEvent.change(confirmPasswordInput, { target: { value: '123456' } });
    }

    const termsButton = getByText('description.agree_with_terms');
    fireEvent.click(termsButton);

    await waitFor(() => {
      fireEvent.click(submitButton);
    });

    expect(register).toBeCalledWith('username', '123456');
  });
});
