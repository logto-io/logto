import { InteractionEvent } from '@logto/schemas';
import { fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import { putInteraction, sendVerificationCode } from '@/apis/interaction';

import EmailRegister from './EmailRegister';

const mockedNavigate = jest.fn();

jest.mock('@/apis/interaction', () => ({
  sendVerificationCode: jest.fn(() => ({ success: true })),
  putInteraction: jest.fn(() => ({ success: true })),
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
      expect(putInteraction).toBeCalledWith(InteractionEvent.Register);
      expect(sendVerificationCode).toBeCalledWith({ email });
      expect(mockedNavigate).toBeCalledWith(
        { pathname: '/register/email/verification-code' },
        { state: { email } }
      );
    });
  });
});
