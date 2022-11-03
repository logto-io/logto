import { fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import { sendRegisterEmailPasscode } from '@/apis/register';

import EmailRegister from './EmailRegister';

const mockedNavigate = jest.fn();

jest.mock('@/apis/register', () => ({
  sendRegisterEmailPasscode: jest.fn(() => ({ success: true })),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

describe('EmailRegister', () => {
  const email = 'foo@logto.io';

  test('register form submit', async () => {
    const { container, getByText } = renderWithPageContext(
      <MemoryRouter>
        <EmailRegister />
      </MemoryRouter>
    );
    const emailInput = container.querySelector('input[name="email"]');

    if (emailInput) {
      fireEvent.change(emailInput, { target: { value: email } });
    }

    const submitButton = getByText('action.create_account');

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(sendRegisterEmailPasscode).toBeCalledWith(email);
      expect(mockedNavigate).toBeCalledWith(
        { pathname: '/register/email/passcode-validation', search: '' },
        { state: { email } }
      );
    });
  });
});
