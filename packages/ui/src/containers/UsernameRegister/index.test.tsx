import { fireEvent, act, waitFor } from '@testing-library/react';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { checkUsername } from '@/apis/register';

import UsernameRegister from '.';

const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

jest.mock('@/apis/register', () => ({
  checkUsername: jest.fn(async () => ({})),
}));

describe('<UsernameRegister />', () => {
  test('default render', () => {
    const { queryByText, container } = renderWithPageContext(<UsernameRegister />);
    expect(container.querySelector('input[name="new-username"]')).not.toBeNull();
    expect(queryByText('action.create')).not.toBeNull();
  });

  test('render with terms settings enabled', () => {
    const { queryByText } = renderWithPageContext(
      <SettingsProvider>
        <UsernameRegister />
      </SettingsProvider>
    );
    expect(queryByText('description.terms_of_use')).not.toBeNull();
  });

  test('username are required', () => {
    const { queryByText, getByText } = renderWithPageContext(<UsernameRegister />);
    const submitButton = getByText('action.create');
    fireEvent.click(submitButton);

    expect(queryByText('username_required')).not.toBeNull();

    expect(checkUsername).not.toBeCalled();
  });

  test('username with initial numeric char should throw', () => {
    const { queryByText, getByText, container } = renderWithPageContext(<UsernameRegister />);
    const submitButton = getByText('action.create');

    const usernameInput = container.querySelector('input[name="new-username"]');

    if (usernameInput) {
      fireEvent.change(usernameInput, { target: { value: '1username' } });
    }

    fireEvent.click(submitButton);

    expect(queryByText('username_should_not_start_with_number')).not.toBeNull();

    expect(checkUsername).not.toBeCalled();

    // Clear error
    if (usernameInput) {
      fireEvent.change(usernameInput, { target: { value: 'username' } });
    }

    expect(queryByText('username_should_not_start_with_number')).toBeNull();
  });

  test('username with special character should throw', () => {
    const { queryByText, getByText, container } = renderWithPageContext(<UsernameRegister />);
    const submitButton = getByText('action.create');
    const usernameInput = container.querySelector('input[name="new-username"]');

    if (usernameInput) {
      fireEvent.change(usernameInput, { target: { value: '@username' } });
    }

    fireEvent.click(submitButton);

    expect(queryByText('username_valid_charset')).not.toBeNull();

    expect(checkUsername).not.toBeCalled();

    // Clear error
    if (usernameInput) {
      fireEvent.change(usernameInput, { target: { value: 'username' } });
    }

    expect(queryByText('username_valid_charset')).toBeNull();
  });

  test('submit form properly with terms settings enabled', async () => {
    const { getByText, container } = renderWithPageContext(
      <SettingsProvider>
        <UsernameRegister />
      </SettingsProvider>
    );
    const submitButton = getByText('action.create');
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
      expect(checkUsername).toBeCalledWith('username');
    });
  });
});
