import { fireEvent, act, waitFor } from '@testing-library/react';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import { addProfile } from '@/apis/interaction';

import SetUsername from '.';

const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

jest.mock('@/apis/interaction', () => ({
  addProfile: jest.fn(async () => ({})),
}));

describe('<UsernameRegister />', () => {
  test('default render', () => {
    const { queryByText, container } = renderWithPageContext(<SetUsername />);
    expect(container.querySelector('input[name="new-username"]')).not.toBeNull();
    expect(queryByText('action.continue')).not.toBeNull();
  });

  test('submit form properly', async () => {
    const { getByText, container } = renderWithPageContext(<SetUsername />);
    const submitButton = getByText('action.continue');
    const usernameInput = container.querySelector('input[name="new-username"]');

    if (usernameInput) {
      fireEvent.change(usernameInput, { target: { value: 'username' } });
    }

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(addProfile).toBeCalledWith({ username: 'username' });
    });
  });
});
