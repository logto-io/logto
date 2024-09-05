import { SignInIdentifier } from '@logto/schemas';
import { act, waitFor, fireEvent } from '@testing-library/react';
import { useLocation } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { mockSignInExperienceSettings } from '@/__mocks__/logto';
import { setUserPassword } from '@/apis/interaction';

import RegisterPassword from '.';

const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
  useLocation: jest.fn(() => ({ state: { username: 'username' } })),
}));

jest.mock('@/apis/interaction', () => ({
  setUserPassword: jest.fn(async () => ({ redirectTo: '/' })),
}));

const useLocationMock = useLocation as jest.Mock;

describe('<RegisterPassword />', () => {
  afterEach(() => {
    jest.clearAllMocks();
    useLocationMock.mockImplementation(() => ({ state: { username: 'username' } }));
  });

  it('render PasswordRegister page without confirm password input field properly', () => {
    const { queryByText, container } = renderWithPageContext(
      <SettingsProvider>
        <RegisterPassword />
      </SettingsProvider>
    );

    expect(container.querySelector('input[name="newPassword"]')).not.toBeNull();
    expect(container.querySelector('input[name="confirmPassword"]')).toBeNull();
    expect(queryByText('action.save_password')).not.toBeNull();
  });

  it('render PasswordRegister page with confirm password input field properly with forgot password disabled', () => {
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
        <RegisterPassword />
      </SettingsProvider>
    );

    expect(container.querySelector('input[name="newPassword"]')).not.toBeNull();
    expect(container.querySelector('input[name="confirmPassword"]')).not.toBeNull();
    expect(queryByText('action.save_password')).not.toBeNull();
  });

  it('render without username signUp method should return error', () => {
    const { queryByText, container } = renderWithPageContext(
      <SettingsProvider
        settings={{
          ...mockSignInExperienceSettings,
          signUp: {
            ...mockSignInExperienceSettings.signUp,
            identifiers: [SignInIdentifier.Email],
          },
        }}
      >
        <RegisterPassword />
      </SettingsProvider>
    );

    expect(container.querySelector('input[name="newPassword"]')).toBeNull();
    expect(queryByText('description.not_found')).not.toBeNull();
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
        <RegisterPassword />
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
        <RegisterPassword />
      </SettingsProvider>
    );

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

      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(setUserPassword).toBeCalledWith('1234asdf');
    });
  });
});
