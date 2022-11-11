import { act, waitFor, fireEvent } from '@testing-library/react';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { continueApi } from '@/apis/continue';

import SetPassword from '.';

const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

jest.mock('@/apis/continue', () => ({
  continueApi: jest.fn(async () => ({ redirectTo: '/' })),
}));

describe('SetPassword', () => {
  it('render set-password page properly', () => {
    const { queryByText, container } = renderWithPageContext(
      <SettingsProvider>
        <SetPassword />
      </SettingsProvider>
    );
    expect(container.querySelector('input[name="new-password"]')).not.toBeNull();
    expect(container.querySelector('input[name="confirm-new-password"]')).not.toBeNull();
    expect(queryByText('action.save_password')).not.toBeNull();
  });

  it('should submit properly', async () => {
    const { getByText, container } = renderWithPageContext(
      <SettingsProvider>
        <SetPassword />
      </SettingsProvider>
    );
    const submitButton = getByText('action.save_password');
    const passwordInput = container.querySelector('input[name="new-password"]');
    const confirmPasswordInput = container.querySelector('input[name="confirm-new-password"]');

    act(() => {
      if (passwordInput) {
        fireEvent.change(passwordInput, { target: { value: '123456' } });
      }

      if (confirmPasswordInput) {
        fireEvent.change(confirmPasswordInput, { target: { value: '123456' } });
      }

      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(continueApi).toBeCalledWith('password', '123456', undefined);
    });
  });
});
