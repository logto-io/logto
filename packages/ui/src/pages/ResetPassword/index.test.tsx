import { act, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

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
      <MemoryRouter initialEntries={['/forgot-password']}>
        <Routes>
          <Route path="/forgot-password" element={<ResetPassword />} />
        </Routes>
      </MemoryRouter>
    );

    expect(container.querySelector('input[name="new-password"]')).not.toBeNull();
    expect(container.querySelector('input[name="confirm-password"]')).not.toBeNull();
    expect(queryByText('action.save_password')).not.toBeNull();
  });

  test('should submit properly', async () => {
    const { getByText, container } = renderWithPageContext(<ResetPassword />);
    const submitButton = getByText('action.save_password');
    const passwordInput = container.querySelector('input[name="new-password"]');
    const confirmPasswordInput = container.querySelector('input[name="confirm-password"]');

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
      expect(setUserPassword).toBeCalledWith('123456');
    });
  });
});
