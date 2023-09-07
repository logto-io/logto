import { act, waitFor, fireEvent } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import { setUserPassword } from '@/apis/interaction';

import ResetPassword from '.';

const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

jest.mock('@/apis/interaction', () => ({
  setUserPassword: jest.fn(async () => ({ redirectTo: '/' })),
}));

describe('ForgotPassword', () => {
  it('render forgot-password page properly', () => {
    const { queryByText, container } = renderWithPageContext(
      <Routes>
        <Route path="/forgot-password" element={<ResetPassword />} />
      </Routes>,
      { initialEntries: ['/forgot-password'] }
    );

    expect(container.querySelector('input[name="newPassword"]')).not.toBeNull();
    expect(container.querySelector('input[name="confirmPassword"]')).not.toBeNull();
    expect(queryByText('action.save_password')).not.toBeNull();
  });

  test('should show error message when password cannot pass fast check', async () => {
    const { queryByText, getByText, container } = renderWithPageContext(<ResetPassword />);
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

  test('should submit properly', async () => {
    const { getByText, container } = renderWithPageContext(<ResetPassword />);
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
      expect(setUserPassword).toBeCalledWith('1234!@#$');
    });
  });
});
