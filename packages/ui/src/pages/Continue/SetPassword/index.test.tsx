import { act, waitFor, fireEvent } from '@testing-library/react';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { mockSignInExperienceSettings } from '@/__mocks__/logto';
import { addProfile } from '@/apis/interaction';

import SetPassword from '.';

const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

jest.mock('@/apis/interaction', () => ({
  addProfile: jest.fn(async () => ({ redirectTo: '/' })),
}));

describe('SetPassword', () => {
  it('render set-password page properly without confirm password field', () => {
    const { queryByText, container } = renderWithPageContext(
      <SettingsProvider>
        <SetPassword />
      </SettingsProvider>
    );
    expect(container.querySelector('input[name="newPassword"]')).not.toBeNull();
    expect(container.querySelector('input[name="confirmPassword"]')).toBeNull();
    expect(queryByText('action.save_password')).not.toBeNull();
  });

  it('render set-password page properly with confirm password field', () => {
    const { queryByText, container } = renderWithPageContext(
      <SettingsProvider
        settings={{
          ...mockSignInExperienceSettings,
          forgotPassword: {
            email: false,
            phone: false,
          },
        }}
      >
        <SetPassword />
      </SettingsProvider>
    );
    expect(container.querySelector('input[name="newPassword"]')).not.toBeNull();
    expect(container.querySelector('input[name="confirmPassword"]')).not.toBeNull();
    expect(queryByText('action.save_password')).not.toBeNull();
  });

  it('should show error message when password cannot pass fast check', async () => {
    const { queryByText, getByText, container } = renderWithPageContext(
      <SettingsProvider
        settings={{
          ...mockSignInExperienceSettings,
          forgotPassword: {
            email: false,
            phone: false,
          },
        }}
      >
        <SetPassword />
      </SettingsProvider>
    );
    const submitButton = getByText('action.save_password');
    const passwordInput = container.querySelector('input[name="newPassword"]');
    const confirmPasswordInput = container.querySelector('input[name="confirmPassword"]');

    act(() => {
      if (passwordInput) {
        fireEvent.change(passwordInput, { target: { value: '1234' } });
      }

      if (confirmPasswordInput) {
        fireEvent.change(confirmPasswordInput, { target: { value: '1234' } });
      }

      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(queryByText('error.password_rejected.too_short')).not.toBeNull();
    });
  });

  it('should submit properly', async () => {
    const { getByText, container } = renderWithPageContext(
      <SettingsProvider
        settings={{
          ...mockSignInExperienceSettings,
          forgotPassword: {
            email: false,
            phone: false,
          },
        }}
      >
        <SetPassword />
      </SettingsProvider>
    );
    const submitButton = getByText('action.save_password');
    const passwordInput = container.querySelector('input[name="newPassword"]');
    const confirmPasswordInput = container.querySelector('input[name="confirmPassword"]');

    act(() => {
      if (passwordInput) {
        fireEvent.change(passwordInput, { target: { value: '1234!@#$' } });
      }

      if (confirmPasswordInput) {
        fireEvent.change(confirmPasswordInput, { target: { value: '1234!@#$' } });
      }

      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(addProfile).toBeCalledWith({ password: '1234!@#$' });
    });
  });
});
