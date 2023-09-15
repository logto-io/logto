import { act, waitFor, fireEvent } from '@testing-library/react';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { addProfile } from '@/apis/interaction';

import SetUsername from '.';

const mockedNavigate = jest.fn();

// PhoneNum CountryCode detection
jest.mock('i18next', () => ({
  language: 'en',
  t: (key: string) => key,
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

jest.mock('@/apis/interaction', () => ({
  addProfile: jest.fn(async () => ({ redirectTo: '/' })),
}));

describe('SetUsername', () => {
  it('render SetUsername page properly', () => {
    const { queryByText, container } = renderWithPageContext(
      <SettingsProvider>
        <SetUsername />
      </SettingsProvider>
    );
    expect(container.querySelector('input[name="identifier"]')).not.toBeNull();
    expect(queryByText('action.continue')).not.toBeNull();
  });

  it('should submit properly', async () => {
    const { getByText, container } = renderWithPageContext(
      <SettingsProvider>
        <SetUsername />
      </SettingsProvider>
    );
    const submitButton = getByText('action.continue');
    const usernameInput = container.querySelector('input[name="identifier"]');

    act(() => {
      if (usernameInput) {
        fireEvent.change(usernameInput, { target: { value: 'username' } });
      }

      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(addProfile).toBeCalledWith({ username: 'username' });
    });
  });
});
