import { InteractionEvent, SignInIdentifier } from '@logto/schemas';
import { fireEvent, waitFor, act } from '@testing-library/react';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import {
  signInWithPasswordIdentifier,
  initInteraction,
  sendVerificationCode,
} from '@/apis/experience';
import { UserFlow } from '@/types';

import PasswordForm from '.';

jest.mock('@/apis/experience', () => ({
  signInWithPasswordIdentifier: jest.fn(() => ({ redirectTo: '/' })),
  sendVerificationCode: jest.fn(() => ({ success: true })),
  initInteraction: jest.fn(() => ({ success: true })),
}));

const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

describe('PasswordSignInForm', () => {
  const username = 'foo';
  const email = 'foo@logto.io';
  const phone = '18573333333';
  const password = '111222';

  afterEach(() => {
    jest.clearAllMocks();
  });

  test.each([
    { identifier: SignInIdentifier.Username, value: username, isVerificationCodeEnabled: false },
    { identifier: SignInIdentifier.Email, value: email, isVerificationCodeEnabled: true },
    { identifier: SignInIdentifier.Phone, value: phone, isVerificationCodeEnabled: true },
  ])(
    'Password SignInForm for %variable.identifier',
    async ({ identifier, value, isVerificationCodeEnabled }) => {
      const { getByText, queryByText, container } = renderWithPageContext(
        <PasswordForm
          identifier={identifier}
          value={value}
          isVerificationCodeEnabled={isVerificationCodeEnabled}
        />
      );

      const submitButton = getByText('action.continue');

      act(() => {
        fireEvent.submit(submitButton);
      });

      await waitFor(() => {
        expect(signInWithPasswordIdentifier).not.toBeCalled();
        expect(queryByText('error.password_required')).not.toBeNull();
      });

      const passwordInput = container.querySelector('input[name="password"]');

      if (passwordInput) {
        fireEvent.change(passwordInput, { target: { value: password } });
      }

      act(() => {
        fireEvent.submit(submitButton);
      });

      await waitFor(() => {
        expect(signInWithPasswordIdentifier).toBeCalledWith({
          identifier: {
            type: identifier,
            value,
          },
          password,
        });
      });

      if (isVerificationCodeEnabled) {
        const sendVerificationCodeLink = getByText('action.sign_in_via_passcode');

        expect(sendVerificationCodeLink).not.toBeNull();

        act(() => {
          fireEvent.click(sendVerificationCodeLink);
        });

        await waitFor(() => {
          expect(initInteraction).toBeCalledWith(InteractionEvent.SignIn);
          expect(sendVerificationCode).toBeCalledWith(InteractionEvent.SignIn, {
            type: identifier,
            value,
          });
        });

        expect(mockedNavigate).toBeCalledWith(
          {
            pathname: `/${UserFlow.SignIn}/verification-code`,
            search: '',
          },
          {
            replace: true,
          }
        );
      }
    }
  );
});
