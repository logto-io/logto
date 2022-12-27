import { fireEvent, act, waitFor } from '@testing-library/react';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { registerWithUsernamePassword } from '@/apis/interaction';

import UsernameRegister from '.';

const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

jest.mock('@/apis/interaction', () => ({
  registerWithUsernamePassword: jest.fn(async () => ({})),
}));

describe('<UsernameRegister />', () => {
  test('default render', () => {
    const { queryByText, container } = renderWithPageContext(<UsernameRegister />);
    expect(container.querySelector('input[name="new-username"]')).not.toBeNull();
    expect(queryByText('action.create_account')).not.toBeNull();
  });

  test('submit form properly', async () => {
    const { getByText, container } = renderWithPageContext(
      <SettingsProvider>
        <UsernameRegister />
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
      expect(registerWithUsernamePassword).toBeCalledWith('username');
    });
  });
});
