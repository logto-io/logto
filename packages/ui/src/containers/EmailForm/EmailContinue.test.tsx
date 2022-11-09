import { fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import { sendContinueSetEmailPasscode } from '@/apis/continue';

import EmailContinue from './EmailContinue';

const mockedNavigate = jest.fn();

jest.mock('@/apis/continue', () => ({
  sendContinueSetEmailPasscode: jest.fn(() => ({ success: true })),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

describe('EmailContinue', () => {
  const email = 'foo@logto.io';

  test('register form submit', async () => {
    const { container, getByText } = renderWithPageContext(
      <MemoryRouter>
        <EmailContinue />
      </MemoryRouter>
    );
    const emailInput = container.querySelector('input[name="email"]');

    if (emailInput) {
      fireEvent.change(emailInput, { target: { value: email } });
    }

    const submitButton = getByText('action.continue');

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(sendContinueSetEmailPasscode).toBeCalledWith(email);
      expect(mockedNavigate).toBeCalledWith(
        { pathname: '/continue/email/passcode-validation', search: '' },
        { state: { email } }
      );
    });
  });
});
