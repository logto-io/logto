import { fireEvent, act, waitFor } from '@testing-library/react';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';

import UsernameForm from './UsernameForm';

const onSubmit = jest.fn();
const onClearErrorMessage = jest.fn();

describe('<UsernameRegister />', () => {
  test('default render without terms', () => {
    const { queryByText, container } = renderWithPageContext(
      <SettingsProvider>
        <UsernameForm hasTerms={false} onSubmit={onSubmit} />
      </SettingsProvider>
    );

    expect(container.querySelector('input[name="new-username"]')).not.toBeNull();
    expect(queryByText('description.terms_of_use')).toBeNull();
    expect(queryByText('action.create')).not.toBeNull();
  });

  test('render with terms settings enabled', () => {
    const { queryByText } = renderWithPageContext(
      <SettingsProvider>
        <UsernameForm onSubmit={onSubmit} />
      </SettingsProvider>
    );
    expect(queryByText('description.terms_of_use')).not.toBeNull();
  });

  test('render with error message', () => {
    const { queryByText, getByText } = renderWithPageContext(
      <SettingsProvider>
        <UsernameForm
          errorMessage="error_message"
          clearErrorMessage={onClearErrorMessage}
          onSubmit={onSubmit}
        />
      </SettingsProvider>
    );
    expect(queryByText('error_message')).not.toBeNull();

    const submitButton = getByText('action.create');
    fireEvent.click(submitButton);

    expect(onClearErrorMessage).toBeCalled();
  });

  test('username are required', () => {
    const { queryByText, getByText } = renderWithPageContext(<UsernameForm onSubmit={onSubmit} />);
    const submitButton = getByText('action.create');
    fireEvent.click(submitButton);

    expect(queryByText('username_required')).not.toBeNull();

    expect(onSubmit).not.toBeCalled();
  });

  test('username with initial numeric char should throw', () => {
    const { queryByText, getByText, container } = renderWithPageContext(
      <UsernameForm onSubmit={onSubmit} />
    );
    const submitButton = getByText('action.create');

    const usernameInput = container.querySelector('input[name="new-username"]');

    if (usernameInput) {
      fireEvent.change(usernameInput, { target: { value: '1username' } });
    }

    fireEvent.click(submitButton);

    expect(queryByText('username_should_not_start_with_number')).not.toBeNull();

    expect(onSubmit).not.toBeCalled();

    // Clear error
    if (usernameInput) {
      fireEvent.change(usernameInput, { target: { value: 'username' } });
    }

    expect(queryByText('username_should_not_start_with_number')).toBeNull();
  });

  test('username with special character should throw', () => {
    const { queryByText, getByText, container } = renderWithPageContext(
      <UsernameForm onSubmit={onSubmit} />
    );
    const submitButton = getByText('action.create');
    const usernameInput = container.querySelector('input[name="new-username"]');

    if (usernameInput) {
      fireEvent.change(usernameInput, { target: { value: '@username' } });
    }

    fireEvent.click(submitButton);

    expect(queryByText('username_valid_charset')).not.toBeNull();

    expect(onSubmit).not.toBeCalled();

    // Clear error
    if (usernameInput) {
      fireEvent.change(usernameInput, { target: { value: 'username' } });
    }

    expect(queryByText('username_valid_charset')).toBeNull();
  });

  test('submit form properly with terms settings enabled', async () => {
    const { getByText, container } = renderWithPageContext(
      <SettingsProvider>
        <UsernameForm onSubmit={onSubmit} />
      </SettingsProvider>
    );
    const submitButton = getByText('action.create_account');
    const usernameInput = container.querySelector('input[name="new-username"]');

    if (usernameInput) {
      fireEvent.change(usernameInput, { target: { value: 'username' } });
    }

    const termsButton = getByText('description.agree_with_terms');
    fireEvent.click(termsButton);

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(onSubmit).toBeCalledWith('username');
    });
  });
});
